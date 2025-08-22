import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'xp';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Define ordering based on type
    let orderBy: any = {};
    switch (type) {
      case 'level':
        orderBy = [{ level: 'desc' }, { xp: 'desc' }];
        break;
      case 'puzzles':
        // We'll handle this with a special query
        break;
      case 'streak':
        orderBy = [{ streak: 'desc' }, { xp: 'desc' }];
        break;
      case 'xp':
      default:
        orderBy = { xp: 'desc' };
        break;
    }

    let users: any[];

    if (type === 'puzzles') {
      // For puzzle count, we need to use raw SQL or groupBy
      users = await prisma.user.findMany({
        select: {
          id: true,
          hackerAlias: true,
          name: true,
          email: true,
          level: true,
          xp: true,
          coins: true,
          streak: true,
          _count: {
            select: {
              puzzleSolves: true
            }
          }
        },
        orderBy: [
          { puzzleSolves: { _count: 'desc' } },
          { xp: 'desc' }
        ],
        take: limit
      });
    } else {
      users = await prisma.user.findMany({
        select: {
          id: true,
          hackerAlias: true,
          name: true,
          email: true,
          level: true,
          xp: true,
          coins: true,
          streak: true,
          _count: {
            select: {
              puzzleSolves: true
            }
          }
        },
        orderBy,
        take: limit
      });
    }

    // Add rank and format data
    const leaderboard = users.map((user, index) => ({
      id: user.id,
      hackerAlias: user.hackerAlias,
      name: user.name,
      email: user.email,
      level: user.level,
      xp: user.xp,
      coins: user.coins,
      streak: user.streak,
      puzzlesSolved: user._count.puzzleSolves,
      rank: index + 1,
      isCurrentUser: user.email === session.user.email
    }));

    // Find current user's position if not in top results
    const currentUserInTop = leaderboard.find(u => u.isCurrentUser);
    let currentUser = currentUserInTop;

    if (!currentUserInTop) {
      // Get current user's rank separately
      const currentUserData = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          hackerAlias: true,
          name: true,
          email: true,
          level: true,
          xp: true,
          coins: true,
          streak: true,
          _count: {
            select: {
              puzzleSolves: true
            }
          }
        }
      });

      if (currentUserData) {
        // Calculate rank based on type
        let rank = 1;
        if (type === 'xp') {
          rank = await prisma.user.count({
            where: { xp: { gt: currentUserData.xp } }
          }) + 1;
        } else if (type === 'level') {
          rank = await prisma.user.count({
            where: {
              OR: [
                { level: { gt: currentUserData.level } },
                { 
                  level: currentUserData.level,
                  xp: { gt: currentUserData.xp }
                }
              ]
            }
          }) + 1;
        } else if (type === 'streak') {
          rank = await prisma.user.count({
            where: {
              OR: [
                { streak: { gt: currentUserData.streak } },
                {
                  streak: currentUserData.streak,
                  xp: { gt: currentUserData.xp }
                }
              ]
            }
          }) + 1;
        } else if (type === 'puzzles') {
          // For puzzles, we need a more complex query
          const usersWithMorePuzzles = await prisma.user.findMany({
            select: { 
              id: true,
              xp: true,
              _count: { select: { puzzleSolves: true } }
            },
            where: {
              OR: [
                { puzzleSolves: { _count: { gt: currentUserData._count.puzzleSolves } } },
                {
                  puzzleSolves: { _count: currentUserData._count.puzzleSolves },
                  xp: { gt: currentUserData.xp }
                }
              ]
            }
          });
          rank = usersWithMorePuzzles.length + 1;
        }

        currentUser = {
          id: currentUserData.id,
          hackerAlias: currentUserData.hackerAlias,
          name: currentUserData.name,
          email: currentUserData.email,
          level: currentUserData.level,
          xp: currentUserData.xp,
          coins: currentUserData.coins,
          streak: currentUserData.streak,
          puzzlesSolved: currentUserData._count.puzzleSolves,
          rank,
          isCurrentUser: true
        };
      }
    }

    return NextResponse.json({
      leaderboard,
      currentUser,
      type,
      total: users.length
    });

  } catch (error) {
    console.error('GET /api/leaderboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}