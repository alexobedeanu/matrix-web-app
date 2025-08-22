import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { calculateXPGain, XP_REWARDS, COIN_REWARDS } from '@/lib/xp-system';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, multiplier = 1 } = await request.json();

    // Validate action
    if (!action || !(action in XP_REWARDS)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        xp: true,
        level: true,
        coins: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate XP and coin gains
    const baseXPGain = XP_REWARDS[action as keyof typeof XP_REWARDS];
    const baseCoinGain = COIN_REWARDS[action as keyof typeof COIN_REWARDS] || 0;
    
    const xpGain = Math.floor(baseXPGain * multiplier);
    const coinGain = Math.floor(baseCoinGain * multiplier);

    // Calculate new level
    const xpCalculation = calculateXPGain(user.xp, xpGain);
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        xp: xpCalculation.newXP,
        level: xpCalculation.newLevel,
        coins: user.coins + coinGain,
        lastActive: new Date()
      },
      select: {
        id: true,
        xp: true,
        level: true,
        coins: true,
        hackerAlias: true
      }
    });

    // If leveled up, give bonus coins
    if (xpCalculation.leveledUp) {
      const levelUpBonus = (xpCalculation.newLevel - user.level) * COIN_REWARDS.LEVEL_UP;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          coins: updatedUser.coins + levelUpBonus
        }
      });
      updatedUser.coins += levelUpBonus;
    }

    return NextResponse.json({
      success: true,
      xpGained: xpGain,
      coinsGained: coinGain + (xpCalculation.leveledUp ? (xpCalculation.newLevel - user.level) * COIN_REWARDS.LEVEL_UP : 0),
      leveledUp: xpCalculation.leveledUp,
      oldLevel: user.level,
      newLevel: xpCalculation.newLevel,
      user: updatedUser
    });

  } catch (error) {
    console.error('POST /api/xp error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}