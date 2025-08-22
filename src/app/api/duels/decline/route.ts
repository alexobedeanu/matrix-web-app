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
      return NextResponse.json({ error: 'You can only decline challenges made to you' }, { status: 403 });
    }

    // Check if duel is still pending
    if (duel.status !== 'PENDING') {
      return NextResponse.json({ error: 'This challenge is no longer pending' }, { status: 400 });
    }

    // Decline the duel by updating status to CANCELLED
    await prisma.duel.update({
      where: { id: duelId },
      data: {
        status: 'CANCELLED',
        endedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: `Challenge from ${duel.challenger.hackerAlias || duel.challenger.name} declined`
    });

  } catch (error) {
    console.error('POST /api/duels/decline error:', error);
    return NextResponse.json({ error: 'Failed to decline challenge' }, { status: 500 });
  }
}