import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { calculateXPGain, XP_REWARDS, COIN_REWARDS } from '@/lib/xp-system';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { answer, timeSpent, hintsUsed } = await request.json();

    // Get puzzle with solution
    const puzzle = await prisma.puzzle.findUnique({
      where: { id: params.id },
    });

    if (!puzzle || !puzzle.isActive) {
      return NextResponse.json({ error: 'Puzzle not found' }, { status: 404 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        puzzleSolves: {
          where: { puzzleId: params.id }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already solved
    if (user.puzzleSolves.length > 0) {
      return NextResponse.json({ error: 'Puzzle already solved' }, { status: 400 });
    }

    // Parse solution
    const solution = typeof puzzle.solution === 'string' ? JSON.parse(puzzle.solution) : puzzle.solution;
    const content = typeof puzzle.content === 'string' ? JSON.parse(puzzle.content) : puzzle.content;

    // Check answer based on puzzle type
    let isCorrect = false;
    
    switch (content.type) {
      case 'caesar':
        isCorrect = answer.trim().toUpperCase() === solution.answer.toUpperCase();
        break;
      
      case 'binary':
        isCorrect = answer.trim().toUpperCase() === solution.answer.toUpperCase();
        break;
      
      case 'pattern':
      case 'network':
        isCorrect = answer.trim() === solution.answer;
        break;
      
      case 'sql_injection':
        // For SQL injection, check if the answer indicates successful bypass
        isCorrect = answer === 'successful_injection';
        break;
      
      case 'reverse_logic':
        isCorrect = answer.trim().toLowerCase() === solution.answer.toLowerCase();
        break;
      
      case 'steganography':
        isCorrect = answer.trim().toLowerCase() === solution.answer.toLowerCase();
        break;
      
      default:
        isCorrect = answer.trim().toLowerCase() === solution.answer.toLowerCase();
    }

    if (!isCorrect) {
      return NextResponse.json({ 
        correct: false, 
        message: 'Incorrect answer. Try again!' 
      });
    }

    // Calculate rewards
    let xpGain = puzzle.xpReward;
    let coinGain = puzzle.coinReward;

    // Bonus for perfect solve (no hints)
    if (hintsUsed === 0) {
      xpGain += XP_REWARDS.PERFECT_SOLVE;
      coinGain += COIN_REWARDS.PERFECT_SOLVE;
    }

    // Speed bonus for fast solving (under 2 minutes)
    if (timeSpent < 120) {
      xpGain += XP_REWARDS.SPEED_BONUS;
      coinGain += COIN_REWARDS.SPEED_BONUS;
    }

    // Calculate new level
    const xpCalculation = calculateXPGain(user.xp, xpGain);

    // Record the solve in database
    await prisma.$transaction([
      // Create puzzle solve record
      prisma.puzzleSolve.create({
        data: {
          userId: user.id,
          puzzleId: puzzle.id,
          timeToSolve: timeSpent,
          hintsUsed
        }
      }),
      
      // Update user stats
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
      coinGain += levelUpBonus;
    }

    return NextResponse.json({
      correct: true,
      xpGained: xpGain,
      coinsGained: coinGain,
      leveledUp: xpCalculation.leveledUp,
      oldLevel: user.level,
      newLevel: xpCalculation.newLevel,
      perfectSolve: hintsUsed === 0,
      speedBonus: timeSpent < 120,
      timeSpent
    });

  } catch (error) {
    console.error('POST /api/puzzles/[id]/solve error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}