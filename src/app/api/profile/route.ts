import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        hackerAlias: true,
        bio: true,
        level: true,
        xp: true,
        coins: true,
        streak: true,
        lastActive: true,
        createdAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update lastActive
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('GET /api/profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hackerAlias, bio } = await request.json();

    // Validate hacker alias uniqueness if provided
    if (hackerAlias) {
      const existingUser = await prisma.user.findFirst({
        where: {
          hackerAlias,
          email: { not: session.user.email }
        }
      });

      if (existingUser) {
        return NextResponse.json({ error: 'Hacker alias already taken' }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        hackerAlias: hackerAlias || null,
        bio: bio || null,
        lastActive: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        hackerAlias: true,
        bio: true,
        level: true,
        xp: true,
        coins: true,
        streak: true,
        lastActive: true,
        createdAt: true,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('PUT /api/profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}