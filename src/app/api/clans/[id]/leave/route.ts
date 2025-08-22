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
      where: { email: session.user.email },
      include: {
        clan: {
          include: {
            members: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.clan || user.clan.id !== params.id) {
      return NextResponse.json({ error: 'You are not a member of this clan' }, { status: 400 });
    }

    const isLeader = user.clan.leaderId === user.id;
    const memberCount = user.clan.members.length;

    if (isLeader && memberCount > 1) {
      // Leader cannot leave if there are other members
      // They must either transfer leadership or kick all members first
      return NextResponse.json({ 
        error: 'As clan leader, you must transfer leadership or disband the clan first' 
      }, { status: 400 });
    }

    if (isLeader && memberCount === 1) {
      // Last member and leader - delete the clan
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { clanId: null }
        }),
        prisma.clan.delete({
          where: { id: params.id }
        })
      ]);

      return NextResponse.json({
        success: true,
        message: 'Clan disbanded successfully'
      });
    } else {
      // Regular member leaving
      await prisma.user.update({
        where: { id: user.id },
        data: { clanId: null }
      });

      return NextResponse.json({
        success: true,
        message: 'Left clan successfully'
      });
    }

  } catch (error) {
    console.error('POST /api/clans/[id]/leave error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}