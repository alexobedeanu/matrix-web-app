import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all duels involving this user
    const duels = await prisma.duel.findMany({
      where: {
        OR: [
          { challengerId: user.id },
          { challengeeId: user.id }
        ]
      },
      include: {
        challenger: {
          select: { hackerAlias: true, name: true }
        },
        challengee: {
          select: { hackerAlias: true, name: true }
        },
        puzzle: {
          select: { id: true, title: true, difficulty: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Categorize duels
    const activeDuels = duels.filter(d => 
      d.status === 'ACCEPTED' || d.status === 'IN_PROGRESS'
    ).map(formatDuel);

    const pendingChallenges = duels.filter(d => 
      d.status === 'PENDING' && d.challengeeId === user.id
    ).map(formatDuel);

    const completedDuels = duels.filter(d => 
      d.status === 'COMPLETED'
    ).map(formatDuel);

    const duelHistory = duels.filter(d => 
      d.status === 'COMPLETED' || d.status === 'CANCELLED'
    ).slice(0, 20).map(formatDuel); // Last 20 duels

    // Get online players (active in last 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const onlinePlayers = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: user.id } }, // Exclude current user
          { lastActive: { gte: fifteenMinutesAgo } }
        ]
      },
      select: {
        id: true,
        hackerAlias: true,
        name: true,
        level: true,
        xp: true,
        lastActive: true
      },
      orderBy: { level: 'desc' },
      take: 20
    });

    const formattedOnlinePlayers = onlinePlayers.map(player => ({
      id: player.id,
      hackerAlias: player.hackerAlias,
      name: player.name,
      level: player.level,
      xp: player.xp,
      isOnline: true
    }));

    return NextResponse.json({
      activeDuels,
      pendingChallenges,
      completedDuels,
      onlinePlayers: formattedOnlinePlayers,
      duelHistory
    });

  } catch (error) {
    console.error('GET /api/duels error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function formatDuel(duel: any) {
  return {
    id: duel.id,
    challengerId: duel.challengerId,
    challengeeId: duel.challengeeId,
    status: duel.status,
    challengerName: duel.challenger.hackerAlias || duel.challenger.name,
    challengeeName: duel.challengee.hackerAlias || duel.challengee.name,
    challengerScore: duel.challengerScore,
    challengeeScore: duel.challengeeScore,
    createdAt: duel.createdAt,
    startedAt: duel.startedAt,
    endedAt: duel.endedAt,
    puzzle: duel.puzzle
  };
}