import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { calculateXPGain, COIN_REWARDS } from '@/lib/xp-system';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { missionId } = await request.json();

    // Get user and mission
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userMission = await prisma.userMission.findUnique({
      where: { id: missionId },
      include: { mission: true }
    });

    if (!userMission || userMission.userId !== user.id) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    if (userMission.isCompleted) {
      return NextResponse.json({ error: 'Mission already claimed' }, { status: 400 });
    }

    // Check if mission is actually completed (double-check)
    // For now, we'll trust the frontend validation
    // TODO: Add server-side mission completion validation

    // Calculate rewards
    const xpGain = userMission.mission.xpReward;
    const coinGain = userMission.mission.coinReward;

    // Calculate new level
    const xpCalculation = calculateXPGain(user.xp, xpGain);

    // Update user and mission in transaction
    await prisma.$transaction([
      // Mark mission as completed
      prisma.userMission.update({
        where: { id: missionId },
        data: {
          isCompleted: true,
          completedAt: new Date()
        }
      }),
      
      // Update user rewards
      prisma.user.update({
        where: { id: user.id },
        data: {
          xp: xpCalculation.newXP,
          level: xpCalculation.newLevel,
          coins: user.coins + coinGain,
          lastActive: new Date()
        }
      })
    ]);

    // Level up bonus
    if (xpCalculation.leveledUp) {
      const levelUpBonus = (xpCalculation.newLevel - user.level) * COIN_REWARDS.LEVEL_UP;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          coins: user.coins + coinGain + levelUpBonus
        }
      });
    }

    return NextResponse.json({
      success: true,
      xpReward: xpGain,
      coinReward: coinGain,
      leveledUp: xpCalculation.leveledUp,
      oldLevel: user.level,
      newLevel: xpCalculation.newLevel
    });

  } catch (error) {
    console.error('POST /api/missions/claim error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}