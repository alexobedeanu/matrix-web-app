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

    const { challengeeId } = await request.json();

    // Get challenger
    const challenger = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!challenger) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get challengee
    const challengee = await prisma.user.findUnique({
      where: { id: challengeeId }
    });

    if (!challengee) {
      return NextResponse.json({ error: 'Target player not found' }, { status: 404 });
    }

    if (challenger.id === challengee.id) {
      return NextResponse.json({ error: 'Cannot challenge yourself' }, { status: 400 });
    }

    // Check if there's already a pending duel between these players
    const existingDuel = await prisma.duel.findFirst({
      where: {
        OR: [
          { challengerId: challenger.id, challengeeId: challengee.id, status: 'PENDING' },
          { challengerId: challengee.id, challengeeId: challenger.id, status: 'PENDING' }
        ]
      }
    });

    if (existingDuel) {
      return NextResponse.json({ error: 'A challenge is already pending between you and this player' }, { status: 400 });
    }

    // Create the duel challenge
    const duel = await prisma.duel.create({
      data: {
        challengerId: challenger.id,
        challengeeId: challengee.id,
        status: 'PENDING'
      }
    });

    return NextResponse.json({
      success: true,
      duelId: duel.id,
      challengeeName: challengee.hackerAlias || challengee.name
    });

  } catch (error) {
    console.error('POST /api/duels/challenge error:', error);
    return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
  }
}