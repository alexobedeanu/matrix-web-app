export interface XPCalculation {
  newXP: number;
  newLevel: number;
  leveledUp: boolean;
  xpGained: number;
}

export interface LevelInfo {
  level: number;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpNeededForNext: number;
  progressPercentage: number;
}

/**
 * Calculate XP required for a specific level
 * Uses exponential growth: level^2 * 50
 */
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  return (level - 1) * (level - 1) * 50 + (level - 1) * 50;
}

/**
 * Calculate level based on current XP
 */
export function getLevelFromXP(xp: number): number {
  if (xp < 0) return 1;
  
  let level = 1;
  while (getXPForLevel(level + 1) <= xp) {
    level++;
  }
  return level;
}

/**
 * Get detailed level information
 */
export function getLevelInfo(currentXP: number): LevelInfo {
  const level = getLevelFromXP(currentXP);
  const xpForCurrentLevel = getXPForLevel(level);
  const xpForNextLevel = getXPForLevel(level + 1);
  const xpNeededForNext = xpForNextLevel - currentXP;
  const xpInCurrentLevel = currentXP - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = xpNeededForLevel > 0 ? (xpInCurrentLevel / xpNeededForLevel) * 100 : 0;

  return {
    level,
    currentXP,
    xpForCurrentLevel,
    xpForNextLevel,
    xpNeededForNext,
    progressPercentage: Math.min(100, Math.max(0, progressPercentage))
  };
}

/**
 * Calculate XP gain and check for level up
 */
export function calculateXPGain(currentXP: number, xpToAdd: number): XPCalculation {
  const oldLevel = getLevelFromXP(currentXP);
  const newXP = currentXP + xpToAdd;
  const newLevel = getLevelFromXP(newXP);
  const leveledUp = newLevel > oldLevel;

  return {
    newXP,
    newLevel,
    leveledUp,
    xpGained: xpToAdd
  };
}

/**
 * XP rewards for different actions
 */
export const XP_REWARDS = {
  DAILY_LOGIN: 10,
  FIRST_TIME_LOGIN: 50,
  PUZZLE_EASY: 25,
  PUZZLE_MEDIUM: 50,
  PUZZLE_HARD: 100,
  PUZZLE_EXPERT: 200,
  PUZZLE_LEGENDARY: 500,
  PERFECT_SOLVE: 50, // No hints used
  SPEED_BONUS: 25, // Solved quickly
  STREAK_BONUS: 15, // Per day in streak
  ACHIEVEMENT_UNLOCK: 100,
  CLAN_CONTRIBUTION: 20,
  SOCIAL_INTERACTION: 5
} as const;

/**
 * Coin rewards for different actions
 */
export const COIN_REWARDS = {
  DAILY_LOGIN: 5,
  FIRST_TIME_LOGIN: 100,
  PUZZLE_EASY: 10,
  PUZZLE_MEDIUM: 25,
  PUZZLE_HARD: 50,
  PUZZLE_EXPERT: 100,
  PUZZLE_LEGENDARY: 250,
  PERFECT_SOLVE: 25,
  SPEED_BONUS: 10,
  STREAK_BONUS: 5,
  ACHIEVEMENT_UNLOCK: 50,
  LEVEL_UP: 50
} as const;

/**
 * Level titles for gamification
 */
export const LEVEL_TITLES: Record<number, string> = {
  1: "SCRIPT_KIDDIE",
  5: "JUNIOR_HACKER", 
  10: "CODE_BREAKER",
  15: "CYBER_WARRIOR",
  20: "DIGITAL_PHANTOM",
  25: "MATRIX_WALKER",
  30: "SYSTEM_INFILTRATOR",
  35: "NEURAL_ARCHITECT", 
  40: "QUANTUM_HACKER",
  45: "CYBER_LEGEND",
  50: "DIGITAL_GOD"
};

/**
 * Get level title for a given level
 */
export function getLevelTitle(level: number): string {
  const availableTitles = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a);
  
  for (const titleLevel of availableTitles) {
    if (level >= titleLevel) {
      return LEVEL_TITLES[titleLevel];
    }
  }
  
  return LEVEL_TITLES[1]; // Default to first title
}