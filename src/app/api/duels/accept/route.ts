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

    const { duelId } = await request.json();

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
        challengee: true
      }
    });

    if (!duel) {
      return NextResponse.json({ error: 'Duel not found' }, { status: 404 });
    }

    // Check if user is the challengee
    if (duel.challengeeId !== user.id) {
      return NextResponse.json({ error: 'You can only accept challenges made to you' }, { status: 403 });
    }

    // Check if duel is still pending
    if (duel.status !== 'PENDING') {
      return NextResponse.json({ error: 'This challenge is no longer pending' }, { status: 400 });
    }

    // Get a random puzzle for the duel
    const randomPuzzle = await prisma.puzzle.findFirst({
      where: { isActive: true },
      skip: Math.floor(Math.random() * await prisma.puzzle.count({ where: { isActive: true } }))
    });

    if (!randomPuzzle) {
      return NextResponse.json({ error: 'No puzzles available for dueling' }, { status: 500 });
    }

    // Accept the duel
    const acceptedDuel = await prisma.duel.update({
      where: { id: duelId },
      data: {
        status: 'ACCEPTED',
        puzzleId: randomPuzzle.id,
        startedAt: new Date()
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
      }
    });

    return NextResponse.json({
      success: true,
      duel: {
        id: acceptedDuel.id,
        status: acceptedDuel.status,
        challengerName: acceptedDuel.challenger.hackerAlias || acceptedDuel.challenger.name,
        challengeeName: acceptedDuel.challengee.hackerAlias || acceptedDuel.challengee.name,
        puzzle: acceptedDuel.puzzle,
        startedAt: acceptedDuel.startedAt
      }
    });

  } catch (error) {
    console.error('POST /api/duels/accept error:', error);
    return NextResponse.json({ error: 'Failed to accept challenge' }, { status: 500 });
  }
}