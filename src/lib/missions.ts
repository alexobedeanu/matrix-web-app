export interface DailyMission {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  target: number;
  xpReward: number;
  coinReward: number;
  category: 'DAILY' | 'WEEKLY' | 'SPECIAL';
  duration: number; // hours, 24 for daily
  icon: string;
}

export enum MissionType {
  SOLVE_PUZZLES = 'SOLVE_PUZZLES',
  DAILY_LOGIN = 'DAILY_LOGIN', 
  XP_GAIN = 'XP_GAIN',
  SOCIAL_INTERACTION = 'SOCIAL_INTERACTION',
  STREAK_MAINTAIN = 'STREAK_MAINTAIN'
}

export interface UserMissionProgress {
  missionId: string;
  progress: number;
  isCompleted: boolean;
  startedAt: Date;
  completedAt?: Date;
  expiresAt: Date;
}

export const DAILY_MISSION_POOL: DailyMission[] = [
  // Basic daily missions
  {
    id: 'daily_solver_1',
    title: 'Script Kiddie Daily',
    description: 'Solve 1 puzzle of any difficulty',
    type: MissionType.SOLVE_PUZZLES,
    target: 1,
    xpReward: 25,
    coinReward: 15,
    category: 'DAILY',
    duration: 24,
    icon: '🔓'
  },
  {
    id: 'daily_solver_3',
    title: 'Hacker Grind',
    description: 'Solve 3 puzzles today',
    type: MissionType.SOLVE_PUZZLES,
    target: 3,
    xpReward: 75,
    coinReward: 50,
    category: 'DAILY',
    duration: 24,
    icon: '⚡'
  },
  {
    id: 'daily_xp_100',
    title: 'XP Hunter',
    description: 'Earn 100 XP today',
    type: MissionType.XP_GAIN,
    target: 100,
    xpReward: 50,
    coinReward: 30,
    category: 'DAILY',
    duration: 24,
    icon: '💫'
  },
  {
    id: 'daily_login',
    title: 'Digital Presence',
    description: 'Login to the matrix today',
    type: MissionType.DAILY_LOGIN,
    target: 1,
    xpReward: 10,
    coinReward: 5,
    category: 'DAILY',
    duration: 24,
    icon: '📡'
  },
  {
    id: 'daily_perfect',
    title: 'Perfectionist',
    description: 'Solve a puzzle without using hints',
    type: MissionType.SOLVE_PUZZLES,
    target: 1,
    xpReward: 50,
    coinReward: 25,
    category: 'DAILY',
    duration: 24,
    icon: '💎'
  },
  {
    id: 'daily_speed',
    title: 'Speed Demon',
    description: 'Solve a puzzle in under 2 minutes',
    type: MissionType.SOLVE_PUZZLES,
    target: 1,
    xpReward: 40,
    coinReward: 20,
    category: 'DAILY',
    duration: 24,
    icon: '🚀'
  },

  // Category-specific missions
  {
    id: 'daily_crypto',
    title: 'Cipher Breaker',
    description: 'Solve 1 cryptography puzzle',
    type: MissionType.SOLVE_PUZZLES,
    target: 1,
    xpReward: 35,
    coinReward: 20,
    category: 'DAILY',
    duration: 24,
    icon: '🔐'
  },
  {
    id: 'daily_web_sec',
    title: 'Web Penetrator',
    description: 'Complete 1 web security challenge',
    type: MissionType.SOLVE_PUZZLES,
    target: 1,
    xpReward: 35,
    coinReward: 20,
    category: 'DAILY',
    duration: 24,
    icon: '🌐'
  },
  {
    id: 'daily_network',
    title: 'Packet Sniffer',
    description: 'Analyze 1 network puzzle',
    type: MissionType.SOLVE_PUZZLES,
    target: 1,
    xpReward: 35,
    coinReward: 20,
    category: 'DAILY',
    duration: 24,
    icon: '📡'
  },

  // Difficulty missions
  {
    id: 'daily_easy',
    title: 'Warm Up',
    description: 'Complete 2 easy puzzles',
    type: MissionType.SOLVE_PUZZLES,
    target: 2,
    xpReward: 30,
    coinReward: 15,
    category: 'DAILY',
    duration: 24,
    icon: '🟢'
  },
  {
    id: 'daily_hard',
    title: 'Challenge Accepted',
    description: 'Complete 1 hard puzzle',
    type: MissionType.SOLVE_PUZZLES,
    target: 1,
    xpReward: 80,
    coinReward: 60,
    category: 'DAILY',
    duration: 24,
    icon: '🔥'
  }
];

export const WEEKLY_MISSION_POOL: DailyMission[] = [
  {
    id: 'weekly_solver_10',
    title: 'Weekly Grinder',
    description: 'Solve 10 puzzles this week',
    type: MissionType.SOLVE_PUZZLES,
    target: 10,
    xpReward: 200,
    coinReward: 150,
    category: 'WEEKLY',
    duration: 168, // 7 days
    icon: '🏆'
  },
  {
    id: 'weekly_streak_7',
    title: 'Dedication',
    description: 'Maintain a 7-day login streak',
    type: MissionType.STREAK_MAINTAIN,
    target: 7,
    xpReward: 150,
    coinReward: 100,
    category: 'WEEKLY',
    duration: 168,
    icon: '🔥'
  },
  {
    id: 'weekly_xp_500',
    title: 'XP Master',
    description: 'Earn 500 XP this week',
    type: MissionType.XP_GAIN,
    target: 500,
    xpReward: 150,
    coinReward: 100,
    category: 'WEEKLY',
    duration: 168,
    icon: '⚡'
  }
];

/**
 * Generate daily missions for a user
 * Returns 3-4 missions from different categories
 */
export function generateDailyMissions(): DailyMission[] {
  const missions: DailyMission[] = [];
  
  // Always include daily login
  missions.push(DAILY_MISSION_POOL.find(m => m.id === 'daily_login')!);
  
  // Add a random solving mission
  const solvingMissions = DAILY_MISSION_POOL.filter(m => 
    m.type === MissionType.SOLVE_PUZZLES && m.id !== 'daily_login'
  );
  missions.push(solvingMissions[Math.floor(Math.random() * solvingMissions.length)]);
  
  // Add a skill-based mission (perfect/speed)
  const skillMissions = DAILY_MISSION_POOL.filter(m => 
    m.type === MissionType.SOLVE_PUZZLES || m.type === MissionType.SOLVE_PUZZLES
  );
  if (Math.random() > 0.5 && skillMissions.length > 0) {
    missions.push(skillMissions[Math.floor(Math.random() * skillMissions.length)]);
  }
  
  // Add a category or difficulty mission
  const categoryMissions = DAILY_MISSION_POOL.filter(m => 
    m.type === MissionType.SOLVE_PUZZLES || m.type === MissionType.SOLVE_PUZZLES
  );
  if (categoryMissions.length > 0) {
    missions.push(categoryMissions[Math.floor(Math.random() * categoryMissions.length)]);
  }
  
  // Optionally add XP mission
  if (missions.length < 4 && Math.random() > 0.6) {
    const xpMission = DAILY_MISSION_POOL.find(m => m.type === MissionType.XP_GAIN);
    if (xpMission) missions.push(xpMission);
  }
  
  return missions;
}

/**
 * Check if user has completed any missions
 */
export function checkMissionProgress(
  mission: DailyMission, 
  userStats: {
    dailyPuzzlesSolved: number;
    dailyXPEarned: number;
    dailyPerfectSolves: number;
    dailySpeedSolves: number;
    dailyCategoryPuzzles: Record<string, number>;
    dailyDifficultyPuzzles: Record<string, number>;
    currentStreak: number;
    loggedInToday: boolean;
  }
): { completed: boolean; progress: number } {
  
  let progress = 0;
  let completed = false;

  switch (mission.type) {
    case MissionType.SOLVE_PUZZLES:
      // Check if it's a specific category, difficulty, perfect, or speed mission
      if (mission.id.includes('perfect')) {
        progress = userStats.dailyPerfectSolves;
      } else if (mission.id.includes('speed')) {
        progress = userStats.dailySpeedSolves;
      } else if (mission.id.includes('crypto') || mission.id.includes('web_sec') || mission.id.includes('network')) {
        const category = extractCategoryFromMissionId(mission.id);
        progress = userStats.dailyCategoryPuzzles[category] || 0;
      } else if (mission.id.includes('easy') || mission.id.includes('hard') || mission.id.includes('medium')) {
        const difficulty = extractDifficultyFromMissionId(mission.id);
        progress = userStats.dailyDifficultyPuzzles[difficulty] || 0;
      } else {
        // General puzzle solving mission
        progress = userStats.dailyPuzzlesSolved;
      }
      break;
      
    case MissionType.XP_GAIN:
      progress = userStats.dailyXPEarned;
      break;
      
    case MissionType.DAILY_LOGIN:
      progress = userStats.loggedInToday ? 1 : 0;
      break;
      
    case MissionType.STREAK_MAINTAIN:
      progress = userStats.currentStreak;
      break;
      
    case MissionType.SOCIAL_INTERACTION:
      progress = 0; // Not implemented yet
      break;
      
    default:
      progress = 0;
  }
  
  completed = progress >= mission.target;
  
  return { completed, progress };
}

function extractCategoryFromMissionId(missionId: string): string {
  if (missionId.includes('crypto')) return 'CRYPTOGRAPHY';
  if (missionId.includes('web_sec')) return 'WEB_SECURITY';
  if (missionId.includes('network')) return 'NETWORK';
  if (missionId.includes('forensics')) return 'FORENSICS';
  if (missionId.includes('reverse')) return 'REVERSE_ENGINEERING';
  if (missionId.includes('programming')) return 'PROGRAMMING';
  if (missionId.includes('logic')) return 'LOGIC';
  return 'CRYPTOGRAPHY'; // default
}

function extractDifficultyFromMissionId(missionId: string): string {
  if (missionId.includes('easy')) return 'EASY';
  if (missionId.includes('medium')) return 'MEDIUM';
  if (missionId.includes('hard')) return 'HARD';
  if (missionId.includes('expert')) return 'EXPERT';
  if (missionId.includes('legendary')) return 'LEGENDARY';
  return 'EASY'; // default
}

/**
 * Calculate mission progress percentage
 */
export function getMissionProgressPercentage(progress: number, target: number): number {
  if (target === 0) return 100; // Handle division by zero
  return Math.min(100, Math.max(0, (progress / target) * 100));
}