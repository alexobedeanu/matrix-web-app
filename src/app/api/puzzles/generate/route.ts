import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { generateAIPuzzle, UserHistory } from '@/lib/ai-puzzle-generator';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category, difficulty } = await request.json();

    // Get user with solving history
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        puzzleSolves: {
          include: {
            puzzle: true
          },
          orderBy: {
            solvedAt: 'desc'
          },
          take: 50 // Last 50 solves for analysis
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build user history for AI analysis
    const solvedCategories = user.puzzleSolves.map(solve => solve.puzzle.category);
    const solvedDifficulties = user.puzzleSolves.map(solve => solve.puzzle.difficulty);
    
    // Calculate average solve time (in seconds)
    const solveTimes = user.puzzleSolves
      .filter(solve => solve.timeToSolve)
      .map(solve => solve.timeToSolve!);
    const averageSolveTime = solveTimes.length > 0 
      ? solveTimes.reduce((sum, time) => sum + time, 0) / solveTimes.length 
      : 300; // Default 5 minutes

    // Calculate success rate (assuming they solved everything they attempted)
    const successRate = user.puzzleSolves.length > 0 ? 1.0 : 0.5;

    // Find preferred categories (most solved)
    const categoryCount = solvedCategories.reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const preferredCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([cat]) => cat);

    const userHistory: UserHistory = {
      solvedCategories,
      solvedDifficulties,
      averageSolveTime,
      currentLevel: user.level,
      preferredCategories,
      successRate
    };

    // Generate AI puzzle
    const aiPuzzle = generateAIPuzzle(userHistory, category, difficulty);

    // Create puzzle in database
    const createdPuzzle = await prisma.puzzle.create({
      data: {
        title: `${aiPuzzle.title} [AI Generated]`,
        description: aiPuzzle.description,
        category: aiPuzzle.category,
        difficulty: aiPuzzle.difficulty,
        content: JSON.stringify(aiPuzzle.content),
        solution: JSON.stringify(aiPuzzle.solution),
        hints: JSON.stringify(aiPuzzle.hints),
        xpReward: aiPuzzle.xpReward,
        coinReward: aiPuzzle.coinReward,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      puzzle: {
        id: createdPuzzle.id,
        title: createdPuzzle.title,
        description: createdPuzzle.description,
        category: createdPuzzle.category,
        difficulty: createdPuzzle.difficulty,
        xpReward: createdPuzzle.xpReward,
        coinReward: createdPuzzle.coinReward
      },
      aiAnalysis: {
        recommendedCategory: !category ? aiPuzzle.category : null,
        recommendedDifficulty: !difficulty ? aiPuzzle.difficulty : null,
        userLevel: user.level,
        totalPuzzlesSolved: user.puzzleSolves.length,
        preferredCategories
      }
    });

  } catch (error) {
    console.error('POST /api/puzzles/generate error:', error);
    return NextResponse.json({ error: 'Failed to generate puzzle' }, { status: 500 });
  }
}