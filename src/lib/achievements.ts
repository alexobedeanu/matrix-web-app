export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'PUZZLE_SOLVING' | 'SOCIAL' | 'PROGRESSION' | 'SPECIAL';
  condition: AchievementCondition;
  xpReward: number;
  coinReward: number;
  isSecret?: boolean;
}

export interface AchievementCondition {
  type: 'puzzle_count' | 'xp_total' | 'level_reached' | 'streak_days' | 'specific_puzzle' | 'speed_solve' | 'perfect_solve' | 'social_action' | 'combo';
  target: number | string;
  category?: string;
  difficulty?: string;
  timeLimit?: number; // seconds
  additional?: Record<string, any>;
}

export interface UserProgress {
  puzzlesSolved: number;
  puzzlesByCategory: Record<string, number>;
  puzzlesByDifficulty: Record<string, number>;
  perfectSolves: number;
  speedSolves: number;
  currentStreak: number;
  totalXP: number;
  currentLevel: number;
  socialActions: number;
  specificPuzzles: string[];
}

export const ACHIEVEMENTS: Achievement[] = [
  // Beginner achievements
  {
    id: 'first_hack',
    name: 'Script Kiddie',
    description: 'Complete your first puzzle',
    icon: '🔓',
    category: 'PUZZLE_SOLVING',
    condition: { type: 'puzzle_count', target: 1 },
    xpReward: 50,
    coinReward: 25
  },
  {
    id: 'crypto_novice',
    name: 'Cipher Breaker',
    description: 'Solve 5 cryptography puzzles',
    icon: '🔐',
    category: 'PUZZLE_SOLVING',
    condition: { type: 'puzzle_count', target: 5, category: 'CRYPTOGRAPHY' },
    xpReward: 100,
    coinReward: 50
  },
  {
    id: 'web_hacker',
    name: 'Web Penetrator',
    description: 'Master web security challenges',
    icon: '🌐',
    category: 'PUZZLE_SOLVING',
    condition: { type: 'puzzle_count', target: 3, category: 'WEB_SECURITY' },
    xpReward: 100,
    coinReward: 50
  },

  // Progression achievements
  {
    id: 'level_5',
    name: 'Rising Hacker',
    description: 'Reach level 5',
    icon: '📈',
    category: 'PROGRESSION',
    condition: { type: 'level_reached', target: 5 },
    xpReward: 100,
    coinReward: 100
  },
  {
    id: 'level_10',
    name: 'Code Breaker',
    description: 'Reach level 10',
    icon: '🎯',
    category: 'PROGRESSION',
    condition: { type: 'level_reached', target: 10 },
    xpReward: 200,
    coinReward: 150
  },
  {
    id: 'xp_1000',
    name: 'XP Grinder',
    description: 'Accumulate 1000 XP',
    icon: '⚡',
    category: 'PROGRESSION',
    condition: { type: 'xp_total', target: 1000 },
    xpReward: 150,
    coinReward: 75
  },

  // Skill-based achievements
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Solve an easy puzzle in under 30 seconds',
    icon: '⚡',
    category: 'PUZZLE_SOLVING',
    condition: { 
      type: 'speed_solve', 
      target: 30,
      difficulty: 'EASY'
    },
    xpReward: 100,
    coinReward: 50
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Solve 10 puzzles without using hints',
    icon: '💎',
    category: 'PUZZLE_SOLVING',
    condition: { type: 'perfect_solve', target: 10 },
    xpReward: 200,
    coinReward: 100
  },
  {
    id: 'hard_puzzle_master',
    name: 'Hard Mode Champion',
    description: 'Complete 5 hard difficulty puzzles',
    icon: '🔥',
    category: 'PUZZLE_SOLVING',
    condition: { type: 'puzzle_count', target: 5, difficulty: 'HARD' },
    xpReward: 300,
    coinReward: 200
  },

  // Streak achievements
  {
    id: 'streak_3',
    name: 'Consistency',
    description: 'Maintain a 3-day login streak',
    icon: '📅',
    category: 'PROGRESSION',
    condition: { type: 'streak_days', target: 3 },
    xpReward: 75,
    coinReward: 50
  },
  {
    id: 'streak_7',
    name: 'Dedication',
    description: 'Maintain a 7-day login streak',
    icon: '🗓️',
    category: 'PROGRESSION',
    condition: { type: 'streak_days', target: 7 },
    xpReward: 150,
    coinReward: 100
  },
  {
    id: 'streak_30',
    name: 'Digital Monk',
    description: 'Maintain a 30-day login streak',
    icon: '🧘',
    category: 'PROGRESSION',
    condition: { type: 'streak_days', target: 30 },
    xpReward: 500,
    coinReward: 300
  },

  // Special achievements
  {
    id: 'sql_injection_master',
    name: 'SQL Ninja',
    description: 'Master the SQL injection simulator',
    icon: '💉',
    category: 'SPECIAL',
    condition: { type: 'specific_puzzle', target: 'sql_injection_sim' },
    xpReward: 150,
    coinReward: 75
  },
  {
    id: 'binary_detective_solved',
    name: 'Binary Detective',
    description: 'Decode the binary message',
    icon: '🕵️',
    category: 'SPECIAL',
    condition: { type: 'specific_puzzle', target: 'binary_detective' },
    xpReward: 100,
    coinReward: 50
  },
  
  // Legendary achievements
  {
    id: 'puzzle_completionist',
    name: 'Puzzle Completionist',
    description: 'Solve 50 puzzles across all categories',
    icon: '🏆',
    category: 'SPECIAL',
    condition: { type: 'puzzle_count', target: 50 },
    xpReward: 1000,
    coinReward: 500
  },
  {
    id: 'legendary_solver',
    name: 'Legendary Hacker',
    description: 'Complete a legendary difficulty puzzle',
    icon: '👑',
    category: 'SPECIAL',
    condition: { type: 'puzzle_count', target: 1, difficulty: 'LEGENDARY' },
    xpReward: 500,
    coinReward: 250,
    isSecret: true
  }
];

/**
 * Check if user qualifies for any achievements
 */
export function checkAchievements(progress: UserProgress, unlockedAchievements: string[]): Achievement[] {
  const newAchievements: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    // Skip if already unlocked
    if (unlockedAchievements.includes(achievement.id)) {
      continue;
    }

    if (isAchievementUnlocked(achievement, progress)) {
      newAchievements.push(achievement);
    }
  }

  return newAchievements;
}

/**
 * Check if a specific achievement condition is met
 */
function isAchievementUnlocked(achievement: Achievement, progress: UserProgress): boolean {
  const condition = achievement.condition;

  switch (condition.type) {
    case 'puzzle_count':
      if (condition.category) {
        return (progress.puzzlesByCategory[condition.category] || 0) >= condition.target;
      }
      if (condition.difficulty) {
        return (progress.puzzlesByDifficulty[condition.difficulty] || 0) >= condition.target;
      }
      return progress.puzzlesSolved >= condition.target;

    case 'xp_total':
      return progress.totalXP >= condition.target;

    case 'level_reached':
      return progress.currentLevel >= condition.target;

    case 'streak_days':
      return progress.currentStreak >= condition.target;

    case 'specific_puzzle':
      return progress.specificPuzzles.includes(condition.target as string);

    case 'speed_solve':
      // This would be checked when a puzzle is solved
      return progress.speedSolves >= 1;

    case 'perfect_solve':
      return progress.perfectSolves >= condition.target;

    case 'social_action':
      return progress.socialActions >= condition.target;

    default:
      return false;
  }
}

/**
 * Get achievement progress percentage
 */
export function getAchievementProgress(achievement: Achievement, progress: UserProgress): number {
  const condition = achievement.condition;

  switch (condition.type) {
    case 'puzzle_count':
      let current = 0;
      if (condition.category) {
        current = progress.puzzlesByCategory[condition.category] || 0;
      } else if (condition.difficulty) {
        current = progress.puzzlesByDifficulty[condition.difficulty] || 0;
      } else {
        current = progress.puzzlesSolved;
      }
      return Math.min(100, (current / condition.target) * 100);

    case 'xp_total':
      return Math.min(100, (progress.totalXP / condition.target) * 100);

    case 'level_reached':
      return Math.min(100, (progress.currentLevel / condition.target) * 100);

    case 'streak_days':
      return Math.min(100, (progress.currentStreak / condition.target) * 100);

    case 'perfect_solve':
      return Math.min(100, (progress.perfectSolves / condition.target) * 100);

    default:
      return 0;
  }
}