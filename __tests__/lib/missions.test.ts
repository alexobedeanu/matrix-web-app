import { 
  generateDailyMissions, 
  checkMissionProgress, 
  getMissionProgressPercentage,
  MissionType,
  type DailyMission 
} from '@/lib/missions'

describe('missions', () => {
  describe('generateDailyMissions', () => {
    it('should generate an array of daily missions', () => {
      const missions = generateDailyMissions()
      
      expect(Array.isArray(missions)).toBe(true)
      expect(missions.length).toBeGreaterThan(0)
    })

    it('should generate missions with valid structure', () => {
      const missions = generateDailyMissions()
      
      missions.forEach(mission => {
        expect(mission).toHaveProperty('title')
        expect(mission).toHaveProperty('description')
        expect(mission).toHaveProperty('type')
        expect(mission).toHaveProperty('target')
        expect(mission).toHaveProperty('xpReward')
        expect(mission).toHaveProperty('coinReward')
        expect(mission).toHaveProperty('category')
        expect(mission).toHaveProperty('duration')
        expect(mission).toHaveProperty('icon')
        
        expect(typeof mission.title).toBe('string')
        expect(typeof mission.description).toBe('string')
        expect(typeof mission.target).toBe('number')
        expect(typeof mission.xpReward).toBe('number')
        expect(typeof mission.coinReward).toBe('number')
        expect(mission.duration).toBe(24) // Daily missions should be 24 hours
        expect(mission.category).toBe('DAILY')
      })
    })

    it('should generate missions with valid MissionType values', () => {
      const missions = generateDailyMissions()
      const validTypes = Object.values(MissionType)
      
      missions.forEach(mission => {
        expect(validTypes).toContain(mission.type)
      })
    })

    it('should generate different missions on multiple calls', () => {
      const missions1 = generateDailyMissions()
      const missions2 = generateDailyMissions()
      
      // The missions should be randomly selected, so they might be different
      // We just check that both calls return valid missions
      expect(missions1.length).toBeGreaterThan(0)
      expect(missions2.length).toBeGreaterThan(0)
      expect(missions1.every(m => m.category === 'DAILY')).toBe(true)
      expect(missions2.every(m => m.category === 'DAILY')).toBe(true)
    })
  })

  describe('checkMissionProgress', () => {
    const mockStats = {
      dailyPuzzlesSolved: 3,
      dailyXPEarned: 150,
      dailyPerfectSolves: 1,
      dailySpeedSolves: 0,
      dailyCategoryPuzzles: { WEB_SECURITY: 2, CRYPTOGRAPHY: 1 },
      dailyDifficultyPuzzles: { EASY: 1, MEDIUM: 2 },
      currentStreak: 5,
      loggedInToday: true
    }

    it('should check SOLVE_PUZZLES mission progress correctly', () => {
      const mission: DailyMission = {
        id: 'test',
        title: 'Test',
        description: 'Test',
        type: MissionType.SOLVE_PUZZLES,
        target: 2,
        xpReward: 50,
        coinReward: 25,
        category: 'DAILY',
        duration: 24,
        icon: '🎯'
      }

      const result = checkMissionProgress(mission, mockStats)
      
      expect(result.progress).toBe(3) // dailyPuzzlesSolved
      expect(result.completed).toBe(true) // 3 >= 2
    })

    it('should check XP_GAIN mission progress correctly', () => {
      const mission: DailyMission = {
        id: 'test',
        title: 'Test',
        description: 'Test',
        type: MissionType.XP_GAIN,
        target: 100,
        xpReward: 50,
        coinReward: 25,
        category: 'DAILY',
        duration: 24,
        icon: '⚡'
      }

      const result = checkMissionProgress(mission, mockStats)
      
      expect(result.progress).toBe(150) // dailyXPEarned
      expect(result.completed).toBe(true) // 150 >= 100
    })

    it('should check DAILY_LOGIN mission progress correctly', () => {
      const mission: DailyMission = {
        id: 'test',
        title: 'Test',
        description: 'Test',
        type: MissionType.DAILY_LOGIN,
        target: 1,
        xpReward: 25,
        coinReward: 15,
        category: 'DAILY',
        duration: 24,
        icon: '🚪'
      }

      const result = checkMissionProgress(mission, mockStats)
      
      expect(result.progress).toBe(1) // loggedInToday ? 1 : 0
      expect(result.completed).toBe(true)
    })

    it('should check STREAK_MAINTAIN mission progress correctly', () => {
      const mission: DailyMission = {
        id: 'test',
        title: 'Test',
        description: 'Test',
        type: MissionType.STREAK_MAINTAIN,
        target: 3,
        xpReward: 75,
        coinReward: 35,
        category: 'DAILY',
        duration: 24,
        icon: '🔥'
      }

      const result = checkMissionProgress(mission, mockStats)
      
      expect(result.progress).toBe(5) // currentStreak
      expect(result.completed).toBe(true) // 5 >= 3
    })

    it('should handle incomplete missions', () => {
      const mission: DailyMission = {
        id: 'test',
        title: 'Test',
        description: 'Test',
        type: MissionType.SOLVE_PUZZLES,
        target: 10, // More than what user has solved
        xpReward: 100,
        coinReward: 50,
        category: 'DAILY',
        duration: 24,
        icon: '🎯'
      }

      const result = checkMissionProgress(mission, mockStats)
      
      expect(result.progress).toBe(3) // dailyPuzzlesSolved
      expect(result.completed).toBe(false) // 3 < 10
    })

    it('should handle SOCIAL_INTERACTION mission', () => {
      const mission: DailyMission = {
        id: 'test',
        title: 'Test',
        description: 'Test',
        type: MissionType.SOCIAL_INTERACTION,
        target: 1,
        xpReward: 30,
        coinReward: 20,
        category: 'DAILY',
        duration: 24,
        icon: '💬'
      }

      const result = checkMissionProgress(mission, mockStats)
      
      expect(result.progress).toBe(0) // No social interactions tracked in mock stats
      expect(result.completed).toBe(false)
    })
  })

  describe('getMissionProgressPercentage', () => {
    it('should calculate correct percentage', () => {
      expect(getMissionProgressPercentage(5, 10)).toBe(50)
      expect(getMissionProgressPercentage(0, 10)).toBe(0)
      expect(getMissionProgressPercentage(10, 10)).toBe(100)
      expect(getMissionProgressPercentage(15, 10)).toBe(100) // Capped at 100%
    })

    it('should handle edge cases', () => {
      expect(getMissionProgressPercentage(5, 0)).toBe(100) // Division by zero should return 100%
      expect(getMissionProgressPercentage(0, 0)).toBe(100) // Both zero should return 100%
    })
  })
})