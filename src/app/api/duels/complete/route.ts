import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { duelId, score, completionTime } = await request.json();

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the duel
    const duel = await prisma.duel.findUnique({
      where: { id: duelId },
      include: {
        challenger: true,
        challengee: true,
        puzzle: true
      }
    });

    if (!duel) {
      return NextResponse.json({ error: 'Duel not found' }, { status: 404 });
    }

    // Check if user is part of this duel
    const isChallenger = duel.challengerId === user.id;
    const isChallengee = duel.challengeeId === user.id;
    
    if (!isChallenger && !isChallengee) {
      return NextResponse.json({ error: 'You are not part of this duel' }, { status: 403 });
    }

    // Check if duel is active
    if (duel.status !== 'ACCEPTED' && duel.status !== 'IN_PROGRESS') {
      return NextResponse.json({ error: 'This duel is not active' }, { status: 400 });
    }

    // Update duel with player's score
    const updateData: any = {
      status: 'IN_PROGRESS'
    };

    if (isChallenger) {
      if (duel.challengerScore !== null) {
        return NextResponse.json({ error: 'You have already completed this duel' }, { status: 400 });
      }
      updateData.challengerScore = score;
      updateData.challengerTime = completionTime;
    } else {
      if (duel.challengeeScore !== null) {
        return NextResponse.json({ error: 'You have already completed this duel' }, { status: 400 });
      }
      updateData.challengeeScore = score;
      updateData.challengeeTime = completionTime;
    }

    // Check if both players have completed
    const bothCompleted = (isChallenger && duel.challengeeScore !== null) || 
                         (isChallengee && duel.challengerScore !== null);

    if (bothCompleted) {
      updateData.status = 'COMPLETED';
      updateData.endedAt = new Date();

      // Determine winner and award XP
      const challengerScore = isChallenger ? score : duel.challengerScore!;
      const challengeeScore = isChallengee ? score : duel.challengeeScore!;
      
      let winnerId = null;
      let winnerXP = 100;
      let loserXP = 25;

      if (challengerScore > challengeeScore) {
        winnerId = duel.challengerId;
      } else if (challengeeScore > challengerScore) {
        winnerId = duel.challengeeId;
      } else {
        // Tie - both get moderate XP
        winnerXP = 50;
        loserXP = 50;
      }

      updateData.winnerId = winnerId;

      // Update XP for both players
      await prisma.$transaction([
        prisma.user.update({
          where: { id: duel.challengerId },
          data: { 
            xp: { increment: winnerId === duel.challengerId ? winnerXP : loserXP },
            lastActive: new Date()
          }
        }),
        prisma.user.update({
          where: { id: duel.challengeeId },
          data: { 
            xp: { increment: winnerId === duel.challengeeId ? winnerXP : loserXP },
            lastActive: new Date()
          }
        })
      ]);
    }

    // Update the duel
    const updatedDuel = await prisma.duel.update({
      where: { id: duelId },
      data: updateData,
      include: {
        challenger: {
          select: { hackerAlias: true, name: true }
        },
        challengee: {
          select: { hackerAlias: true, name: true }
        },
        puzzle: {
          select: { title: true, difficulty: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      duel: {
        id: updatedDuel.id,
        status: updatedDuel.status,
        challengerName: updatedDuel.challenger.hackerAlias || updatedDuel.challenger.name,
        challengeeName: updatedDuel.challengee.hackerAlias || updatedDuel.challengee.name,
        challengerScore: updatedDuel.challengerScore,
        challengeeScore: updatedDuel.challengeeScore,
        winnerId: updatedDuel.winnerId,
        puzzle: updatedDuel.puzzle,
        endedAt: updatedDuel.endedAt
      },
      xpGained: bothCompleted ? (winnerId === user.id ? winnerXP : loserXP) : 0
    });

  } catch (error) {
    console.error('POST /api/duels/complete error:', error);
    return NextResponse.json({ error: 'Failed to complete duel' }, { status: 500 });
  }
}