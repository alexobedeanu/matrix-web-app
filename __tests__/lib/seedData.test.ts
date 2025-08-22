/**
 * @jest-environment node
 */
import { seedPuzzles, seedAchievements } from '@/lib/seedData'
import { prisma } from '@/lib/prisma'

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    puzzle: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    achievement: {
      findFirst: jest.fn(), 
      create: jest.fn(),
    },
  },
}))

// Mock console.log to avoid cluttering test output
jest.spyOn(console, 'log').mockImplementation()

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('seedData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('seedPuzzles', () => {
    it('should create puzzles when none exist', async () => {
      mockPrisma.puzzle.findFirst.mockResolvedValue(null)
      mockPrisma.puzzle.create.mockResolvedValue({} as any)

      await seedPuzzles()

      expect(mockPrisma.puzzle.findFirst).toHaveBeenCalledTimes(5) // 5 puzzles in seed data
      expect(mockPrisma.puzzle.create).toHaveBeenCalledTimes(5)
    })

    it('should not create puzzles that already exist', async () => {
      mockPrisma.puzzle.findFirst.mockResolvedValue({ id: 'existing-puzzle' } as any)

      await seedPuzzles()

      expect(mockPrisma.puzzle.findFirst).toHaveBeenCalledTimes(5)
      expect(mockPrisma.puzzle.create).not.toHaveBeenCalled()
    })

    it('should create puzzle with correct data structure', async () => {
      mockPrisma.puzzle.findFirst.mockResolvedValue(null)
      mockPrisma.puzzle.create.mockResolvedValue({} as any)

      await seedPuzzles()

      expect(mockPrisma.puzzle.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: expect.any(String),
          description: expect.any(String),
          category: expect.any(String),
          difficulty: expect.any(String),
          content: expect.any(String),
          solution: expect.any(String),
          hints: expect.any(String),
          xpReward: expect.any(Number),
          coinReward: expect.any(Number),
          isActive: true,
        })
      })
    })

    it('should create puzzles with different categories and difficulties', async () => {
      mockPrisma.puzzle.findFirst.mockResolvedValue(null)
      mockPrisma.puzzle.create.mockResolvedValue({} as any)

      await seedPuzzles()

      const createCalls = mockPrisma.puzzle.create.mock.calls
      const categories = createCalls.map(call => call[0].data.category)
      const difficulties = createCalls.map(call => call[0].data.difficulty)

      // Check that we have variety in categories and difficulties
      expect(new Set(categories).size).toBeGreaterThan(1)
      expect(new Set(difficulties).size).toBeGreaterThan(1)
    })
  })

  describe('seedAchievements', () => {
    it('should create achievements when none exist', async () => {
      mockPrisma.achievement.findFirst.mockResolvedValue(null)
      mockPrisma.achievement.create.mockResolvedValue({} as any)

      await seedAchievements()

      expect(mockPrisma.achievement.findFirst).toHaveBeenCalledTimes(3) // 3 achievements in seed data
      expect(mockPrisma.achievement.create).toHaveBeenCalledTimes(3)
    })

    it('should not create achievements that already exist', async () => {
      mockPrisma.achievement.findFirst.mockResolvedValue({ id: 'existing-achievement' } as any)

      await seedAchievements()

      expect(mockPrisma.achievement.findFirst).toHaveBeenCalledTimes(3)
      expect(mockPrisma.achievement.create).not.toHaveBeenCalled()
    })

    it('should create achievement with correct data structure', async () => {
      mockPrisma.achievement.findFirst.mockResolvedValue(null)
      mockPrisma.achievement.create.mockResolvedValue({} as any)

      await seedAchievements()

      expect(mockPrisma.achievement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: expect.any(String),
          description: expect.any(String),
          category: expect.any(String),
          requirement: expect.any(String),
          xpReward: expect.any(Number),
          coinReward: expect.any(Number),
          icon: expect.any(String),
          rarity: expect.any(String),
          isActive: true,
        })
      })
    })

    it('should create achievements with different categories and rarities', async () => {
      mockPrisma.achievement.findFirst.mockResolvedValue(null)
      mockPrisma.achievement.create.mockResolvedValue({} as any)

      await seedAchievements()

      const createCalls = mockPrisma.achievement.create.mock.calls
      const categories = createCalls.map(call => call[0].data.category)
      const rarities = createCalls.map(call => call[0].data.rarity)

      // Check that we have variety in categories and rarities
      expect(new Set(categories).size).toBeGreaterThan(1)
      expect(new Set(rarities).size).toBeGreaterThan(1)
    })
  })
})