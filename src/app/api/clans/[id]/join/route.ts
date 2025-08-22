import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is already in a clan
    if (user.clanId) {
      return NextResponse.json({ error: 'You are already in a clan' }, { status: 400 });
    }

    // Check if clan exists
    const clan = await prisma.clan.findUnique({
      where: { id: params.id },
      include: {
        members: true
      }
    });

    if (!clan) {
      return NextResponse.json({ error: 'Clan not found' }, { status: 404 });
    }

    // Check member limit (optional - you can set a max clan size)
    const MAX_CLAN_SIZE = 50;
    if (clan.members.length >= MAX_CLAN_SIZE) {
      return NextResponse.json({ error: 'Clan is full' }, { status: 400 });
    }

    // Join the clan
    await prisma.user.update({
      where: { id: user.id },
      data: { clanId: clan.id }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully joined ${clan.name}`
    });

  } catch (error) {
    console.error('POST /api/clans/[id]/join error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}