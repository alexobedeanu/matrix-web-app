/**
 * @jest-environment node
 */
import { GET } from '@/app/api/puzzles/route'
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
    puzzle: {
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}))
jest.mock('@/lib/seedData', () => ({
  seedPuzzles: jest.fn(),
  seedAchievements: jest.fn(),
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/puzzles', () => {
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

    it('should return puzzles successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        puzzleSolves: [],
      }
      const mockPuzzles = [
        {
          id: 'puzzle-1',
          title: 'Test Puzzle',
          description: 'Test description',
          category: 'WEB_SECURITY',
          difficulty: 'EASY',
          xpReward: 100,
          coinReward: 25,
          isActive: true,
          createdAt: new Date(),
        },
      ]

      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' },
        expires: '2024-01-01',
      })
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.puzzle.count.mockResolvedValue(1)
      mockPrisma.puzzle.findMany.mockResolvedValue(mockPuzzles)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.puzzles).toHaveLength(1)
      expect(data.puzzles[0].title).toBe('Test Puzzle')
      expect(data.puzzles[0].isSolved).toBe(false)
    })

    it('should seed puzzles if none exist', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        puzzleSolves: [],
      }

      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' },
        expires: '2024-01-01',
      })
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.puzzle.count.mockResolvedValue(0)
      mockPrisma.puzzle.findMany.mockResolvedValue([])

      const { seedPuzzles, seedAchievements } = require('@/lib/seedData')

      await GET()

      expect(seedPuzzles).toHaveBeenCalled()
      expect(seedAchievements).toHaveBeenCalled()
    })

    it('should mark solved puzzles correctly', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        puzzleSolves: [{ puzzleId: 'puzzle-1', timeToSolve: 120, solvedAt: new Date() }],
      }
      const mockPuzzles = [
        {
          id: 'puzzle-1',
          title: 'Solved Puzzle',
          description: 'Test description',
          category: 'WEB_SECURITY',
          difficulty: 'EASY',
          xpReward: 100,
          coinReward: 25,
          isActive: true,
          createdAt: new Date(),
        },
      ]

      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' },
        expires: '2024-01-01',
      })
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.puzzle.count.mockResolvedValue(1)
      mockPrisma.puzzle.findMany.mockResolvedValue(mockPuzzles)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.puzzles[0].isSolved).toBe(true)
      expect(data.puzzles[0].timeToSolve).toBe(120)
    })
  })
})