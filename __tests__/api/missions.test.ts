/**
 * @jest-environment node
 */
import { GET } from '@/app/api/missions/route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'

// Mock dependencies
jest.mock('next-auth/next')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    mission: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    userMission: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/missions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 if user not found in database', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' },
        expires: '2024-01-01',
      })
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('User not found')
    })

    it('should create daily missions if none exist', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        missions: [],
        puzzleSolves: [],
      }

      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' },
        expires: '2024-01-01',
      })
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce({ ...mockUser, missions: [] })
      
      mockPrisma.mission.findFirst.mockResolvedValue(null)
      mockPrisma.mission.create.mockResolvedValue({
        id: 'mission-1',
        title: 'Test Mission',
        description: 'Test description',
        type: 'SOLVE_PUZZLES',
        requirement: '{"target":1}',
        xpReward: 50,
        coinReward: 25,
        duration: 24,
        isDaily: true,
        isActive: true,
        createdAt: new Date(),
      })
      mockPrisma.userMission.findFirst.mockResolvedValue(null)
      mockPrisma.userMission.create.mockResolvedValue({
        id: 'user-mission-1',
        userId: 'user-1',
        missionId: 'mission-1',
        progress: 0,
        isCompleted: false,
        startedAt: new Date(),
        completedAt: null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })

      const response = await GET()

      expect(response.status).toBe(200)
      expect(mockPrisma.mission.create).toHaveBeenCalled()
      expect(mockPrisma.userMission.create).toHaveBeenCalled()
    })

    it('should return existing missions if they exist', async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        missions: [
          {
            id: 'user-mission-1',
            progress: 0,
            isCompleted: false,
            startedAt: today, // Make sure this is today
            completedAt: null,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            mission: {
              id: 'mission-1',
              title: 'Digital Presence', // Use a title that exists in generateDailyMissions
              description: 'Login to the matrix today',
              type: 'DAILY_LOGIN',
              requirement: '{"target":1}',
              xpReward: 10,
              coinReward: 5,
              duration: 24,
              isDaily: true,
              isActive: true,
              createdAt: new Date(),
            },
          },
        ],
        puzzleSolves: [],
        streak: 0,
        lastActive: today,
      }

      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' },
        expires: '2024-01-01',
      })
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.dailyMissions).toHaveLength(1)
      expect(data.dailyMissions[0].title).toBe('Digital Presence')
    })
  })
})