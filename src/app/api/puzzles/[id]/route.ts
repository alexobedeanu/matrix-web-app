import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const puzzle = await prisma.puzzle.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        difficulty: true,
        content: true,
        hints: true,
        xpReward: true,
        coinReward: true,
        isActive: true,
      }
    });

    if (!puzzle || !puzzle.isActive) {
      return NextResponse.json({ error: 'Puzzle not found' }, { status: 404 });
    }

    // Check if user already solved this puzzle
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        puzzleSolves: {
          where: { puzzleId: params.id }
        }
      }
    });

    if (user?.puzzleSolves.length > 0) {
      return NextResponse.json({ error: 'Puzzle already solved' }, { status: 400 });
    }

    // Parse JSON fields
    const puzzleData = {
      ...puzzle,
      content: typeof puzzle.content === 'string' ? JSON.parse(puzzle.content) : puzzle.content,
      hints: typeof puzzle.hints === 'string' ? JSON.parse(puzzle.hints) : puzzle.hints
    };

    return NextResponse.json(puzzleData);
  } catch (error) {
    console.error('GET /api/puzzles/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}