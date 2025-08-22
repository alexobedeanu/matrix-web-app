import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { seedPuzzles, seedAchievements } from '@/lib/seedData';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user to check solved puzzles
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        puzzleSolves: {
          select: {
            puzzleId: true,
            timeToSolve: true,
            solvedAt: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Seed puzzles and achievements if none exist
    const puzzleCount = await prisma.puzzle.count();
    if (puzzleCount === 0) {
      await seedPuzzles();
      await seedAchievements();
    }

    // Get all active puzzles
    const puzzles = await prisma.puzzle.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        difficulty: true,
        xpReward: true,
        coinReward: true,
        isActive: true,
        createdAt: true
      },
      orderBy: [
        { difficulty: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    // Mark solved puzzles and add solve info
    const puzzlesWithSolveStatus = puzzles.map(puzzle => {
      const solve = user.puzzleSolves.find(s => s.puzzleId === puzzle.id);
      return {
        ...puzzle,
        solved: !!solve,
        timeToSolve: solve?.timeToSolve || undefined
      };
    });

    return NextResponse.json(puzzlesWithSolveStatus);
  } catch (error) {
    console.error('GET /api/puzzles error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Seed some initial puzzles if none exist
    const existingPuzzles = await prisma.puzzle.count();
    
    if (existingPuzzles === 0) {
      await seedPuzzles();
      return NextResponse.json({ message: 'Puzzles seeded successfully' });
    }

    return NextResponse.json({ message: 'Puzzles already exist' });
  } catch (error) {
    console.error('POST /api/puzzles error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

