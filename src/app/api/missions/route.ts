import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { generateDailyMissions, checkMissionProgress, getMissionProgressPercentage } from '@/lib/missions';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with missions and puzzle solving stats
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        missions: {
          include: {
            mission: true
          }
        },
        puzzleSolves: {
          where: {
            solvedAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)) // Today only
            }
          },
          include: {
            puzzle: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get or create today's missions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let userMissions = user.missions.filter(um => 
      new Date(um.startedAt).getTime() >= today.getTime()
    );

    // If no missions for today, generate new ones
    if (userMissions.length === 0) {
      const dailyMissions = generateDailyMissions();
      
      // Create mission records if they don't exist
      for (const missionTemplate of dailyMissions) {
        let dbMission = await prisma.mission.findFirst({
          where: { title: missionTemplate.title }
        });

        if (!dbMission) {
          dbMission = await prisma.mission.create({
            data: {
              title: missionTemplate.title,
              description: missionTemplate.description,
              type: missionTemplate.type,
              requirement: JSON.stringify({ target: missionTemplate.target }),
              xpReward: missionTemplate.xpReward,
              coinReward: missionTemplate.coinReward,
              duration: missionTemplate.duration,
              isDaily: true,
              isActive: true
            }
          });
        }

        // Create user mission (check if not exists)
        const existingUserMission = await prisma.userMission.findFirst({
          where: {
            userId: user.id,
            missionId: dbMission.id
          }
        });

        if (!existingUserMission) {
          await prisma.userMission.create({
            data: {
              userId: user.id,
              missionId: dbMission.id,
              progress: 0,
              isCompleted: false,
              startedAt: new Date(),
              expiresAt: new Date(Date.now() + missionTemplate.duration * 60 * 60 * 1000)
            }
          });
        }
      }

      // Refresh user missions
      const refreshedUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          missions: {
            where: {
              startedAt: {
                gte: today
              }
            },
            include: {
              mission: true
            }
          },
          puzzleSolves: {
            where: {
              solvedAt: {
                gte: today
              }
            },
            include: {
              puzzle: true
            }
          }
        }
      });

      if (refreshedUser) {
        userMissions = refreshedUser.missions;
      }
    }

    // Calculate daily stats for mission progress
    const todayPuzzleSolves = user.puzzleSolves;
    const dailyStats = {
      dailyPuzzlesSolved: todayPuzzleSolves.length,
      dailyXPEarned: todayPuzzleSolves.reduce((sum, solve) => sum + solve.puzzle.xpReward, 0),
      dailyPerfectSolves: todayPuzzleSolves.filter(solve => solve.hintsUsed === 0).length,
      dailySpeedSolves: todayPuzzleSolves.filter(solve => solve.timeToSolve && solve.timeToSolve < 120).length,
      dailyCategoryPuzzles: todayPuzzleSolves.reduce((acc, solve) => {
        acc[solve.puzzle.category] = (acc[solve.puzzle.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      dailyDifficultyPuzzles: todayPuzzleSolves.reduce((acc, solve) => {
        acc[solve.puzzle.difficulty] = (acc[solve.puzzle.difficulty] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      currentStreak: user.streak,
      loggedInToday: user.lastActive && new Date(user.lastActive).toDateString() === new Date().toDateString()
    };

    // Format missions with progress
    const dailyMissions = userMissions
      .filter(um => um.mission.isDaily)
      .map(um => {
        const missionTemplate = generateDailyMissions().find(m => m.title === um.mission.title);
        if (!missionTemplate) return null;

        const { completed, progress } = checkMissionProgress(missionTemplate, dailyStats);
        
        return {
          id: um.id,
          title: um.mission.title,
          description: um.mission.description,
          type: um.mission.type,
          target: missionTemplate.target,
          xpReward: um.mission.xpReward,
          coinReward: um.mission.coinReward,
          category: 'DAILY',
          icon: missionTemplate.icon,
          progress,
          isCompleted: completed,
          expiresAt: um.expiresAt,
          timeRemaining: formatTimeRemaining(um.expiresAt)
        };
      })
      .filter(Boolean);

    const weeklyMissions: any[] = []; // TODO: Implement weekly missions

    const completedToday = dailyMissions.filter(m => m.isCompleted).length;

    return NextResponse.json({
      dailyMissions,
      weeklyMissions,
      completedToday,
      totalMissions: dailyMissions.length,
      userStats: dailyStats
    });

  } catch (error) {
    console.error('GET /api/missions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function formatTimeRemaining(expiresAt: Date): string {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diff = expires.getTime() - now.getTime();
  
  if (diff <= 0) return 'EXPIRED';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}