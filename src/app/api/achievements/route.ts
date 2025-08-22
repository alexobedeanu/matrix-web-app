import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { checkAchievements, ACHIEVEMENTS, UserProgress } from '@/lib/achievements';
import { XP_REWARDS, COIN_REWARDS } from '@/lib/xp-system';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with achievements
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        achievements: {
          include: {
            achievement: true
          }
        },
        puzzleSolves: {
          include: {
            puzzle: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate user progress
    const puzzlesByCategory: Record<string, number> = {};
    const puzzlesByDifficulty: Record<string, number> = {};
    const specificPuzzles: string[] = [];

    user.puzzleSolves.forEach(solve => {
      const category = solve.puzzle.category;
      const difficulty = solve.puzzle.difficulty;
      
      puzzlesByCategory[category] = (puzzlesByCategory[category] || 0) + 1;
      puzzlesByDifficulty[difficulty] = (puzzlesByDifficulty[difficulty] || 0) + 1;
      specificPuzzles.push(solve.puzzle.title.toLowerCase().replace(/[^a-z0-9]/g, '_'));
    });

    const progress: UserProgress = {
      puzzlesSolved: user.puzzleSolves.length,
      puzzlesByCategory,
      puzzlesByDifficulty,
      perfectSolves: user.puzzleSolves.filter(s => s.hintsUsed === 0).length,
      speedSolves: user.puzzleSolves.filter(s => s.timeToSolve && s.timeToSolve < 60).length, // Under 1 minute
      currentStreak: user.streak,
      totalXP: user.xp,
      currentLevel: user.level,
      socialActions: 0, // TODO: implement when chat/social features are added
      specificPuzzles
    };

    const unlockedAchievementIds = user.achievements.map(ua => ua.achievement.name.toLowerCase().replace(/[^a-z0-9]/g, '_'));

    // Return user achievements with progress
    const userAchievements = user.achievements.map(ua => ({
      id: ua.achievement.id,
      name: ua.achievement.name,
      description: ua.achievement.description,
      icon: ua.achievement.icon,
      category: ua.achievement.category,
      xpReward: ua.achievement.xpReward,
      coinReward: ua.achievement.coinReward,
      unlockedAt: ua.unlockedAt,
      isUnlocked: true,
      progress: 100
    }));

    // Add available achievements with progress
    const availableAchievements = ACHIEVEMENTS
      .filter(ach => !unlockedAchievementIds.includes(ach.id))
      .filter(ach => !ach.isSecret) // Hide secret achievements
      .map(ach => ({
        id: ach.id,
        name: ach.name,
        description: ach.description,
        icon: ach.icon,
        category: ach.category,
        xpReward: ach.xpReward,
        coinReward: ach.coinReward,
        unlockedAt: null,
        isUnlocked: false,
        progress: getAchievementProgress(ach, progress)
      }));

    return NextResponse.json({
      unlockedAchievements: userAchievements,
      availableAchievements,
      totalUnlocked: userAchievements.length,
      totalAvailable: ACHIEVEMENTS.length,
      progress
    });

  } catch (error) {
    console.error('GET /api/achievements error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trigger, data } = await request.json();

    // Get user with current achievements
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        achievements: {
          include: {
            achievement: true
          }
        },
        puzzleSolves: {
          include: {
            puzzle: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate current progress (same as GET)
    const puzzlesByCategory: Record<string, number> = {};
    const puzzlesByDifficulty: Record<string, number> = {};
    const specificPuzzles: string[] = [];

    user.puzzleSolves.forEach(solve => {
      const category = solve.puzzle.category;
      const difficulty = solve.puzzle.difficulty;
      
      puzzlesByCategory[category] = (puzzlesByCategory[category] || 0) + 1;
      puzzlesByDifficulty[difficulty] = (puzzlesByDifficulty[difficulty] || 0) + 1;
      specificPuzzles.push(solve.puzzle.title.toLowerCase().replace(/[^a-z0-9]/g, '_'));
    });

    const progress: UserProgress = {
      puzzlesSolved: user.puzzleSolves.length,
      puzzlesByCategory,
      puzzlesByDifficulty,
      perfectSolves: user.puzzleSolves.filter(s => s.hintsUsed === 0).length,
      speedSolves: user.puzzleSolves.filter(s => s.timeToSolve && s.timeToSolve < 60).length,
      currentStreak: user.streak,
      totalXP: user.xp,
      currentLevel: user.level,
      socialActions: 0,
      specificPuzzles
    };

    const unlockedAchievementIds = user.achievements.map(ua => ua.achievement.name.toLowerCase().replace(/[^a-z0-9]/g, '_'));

    // Check for new achievements
    const newAchievements = checkAchievements(progress, unlockedAchievementIds);

    if (newAchievements.length === 0) {
      return NextResponse.json({ newAchievements: [] });
    }

    // Create achievement records if they don't exist
    for (const achievement of newAchievements) {
      // First ensure the achievement exists in database
      let dbAchievement = await prisma.achievement.findUnique({
        where: { name: achievement.name }
      });

      if (!dbAchievement) {
        dbAchievement = await prisma.achievement.create({
          data: {
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            category: achievement.category,
            condition: JSON.stringify(achievement.condition),
            xpReward: achievement.xpReward,
            coinReward: achievement.coinReward
          }
        });
      }

      // Create user achievement
      await prisma.userAchievement.create({
        data: {
          userId: user.id,
          achievementId: dbAchievement.id
        }
      });
    }

    // Award XP and coins for achievements
    const totalXP = newAchievements.reduce((sum, ach) => sum + ach.xpReward, 0);
    const totalCoins = newAchievements.reduce((sum, ach) => sum + ach.coinReward, 0);

    if (totalXP > 0 || totalCoins > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          xp: user.xp + totalXP,
          coins: user.coins + totalCoins,
          lastActive: new Date()
        }
      });
    }

    return NextResponse.json({
      newAchievements: newAchievements.map(ach => ({
        id: ach.id,
        name: ach.name,
        description: ach.description,
        icon: ach.icon,
        xpReward: ach.xpReward,
        coinReward: ach.coinReward
      })),
      totalXP,
      totalCoins
    });

  } catch (error) {
    console.error('POST /api/achievements error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function (reused from achievements.ts)
function getAchievementProgress(achievement: any, progress: UserProgress): number {
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