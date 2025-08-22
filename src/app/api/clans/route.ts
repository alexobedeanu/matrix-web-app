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

    // Get user with clan info
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        clan: {
          include: {
            members: {
              include: {
                clan: false
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let userClan = null;
    let clanMembers: any[] = [];

    if (user.clan) {
      // Get clan leader info
      const leader = user.clan.members.find(member => member.id === user.clan?.leaderId);
      
      userClan = {
        id: user.clan.id,
        name: user.clan.name,
        description: user.clan.description,
        image: user.clan.image,
        leaderId: user.clan.leaderId,
        xp: user.clan.xp,
        createdAt: user.clan.createdAt,
        memberCount: user.clan.members.length,
        isUserMember: true,
        leaderName: leader?.hackerAlias || leader?.name || 'Unknown'
      };

      // Format clan members
      clanMembers = user.clan.members.map(member => ({
        id: member.id,
        hackerAlias: member.hackerAlias,
        name: member.name,
        level: member.level,
        xp: member.xp,
        joinedAt: member.createdAt, // Using createdAt as join date proxy
        isLeader: member.id === user.clan?.leaderId
      })).sort((a, b) => {
        // Leaders first, then by XP
        if (a.isLeader) return -1;
        if (b.isLeader) return 1;
        return b.xp - a.xp;
      });
    }

    // Get available clans (if user is not in one)
    let availableClans: any[] = [];
    if (!user.clan) {
      const clans = await prisma.clan.findMany({
        include: {
          members: {
            select: {
              id: true,
              hackerAlias: true,
              name: true
            }
          }
        },
        orderBy: {
          xp: 'desc'
        }
      });

      availableClans = await Promise.all(
        clans.map(async clan => {
          const leader = clan.members.find(member => member.id === clan.leaderId);
          
          return {
            id: clan.id,
            name: clan.name,
            description: clan.description,
            image: clan.image,
            leaderId: clan.leaderId,
            xp: clan.xp,
            createdAt: clan.createdAt,
            memberCount: clan.members.length,
            isUserMember: false,
            leaderName: leader?.hackerAlias || leader?.name || 'Unknown'
          };
        })
      );
    }

    return NextResponse.json({
      userClan,
      availableClans,
      clanMembers
    });

  } catch (error) {
    console.error('GET /api/clans error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description } = await request.json();

    if (!name || name.trim().length < 3) {
      return NextResponse.json({ error: 'Clan name must be at least 3 characters' }, { status: 400 });
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

    // Check if clan name is taken
    const existingClan = await prisma.clan.findUnique({
      where: { name: name.trim() }
    });

    if (existingClan) {
      return NextResponse.json({ error: 'Clan name is already taken' }, { status: 400 });
    }

    // Create clan and set user as leader
    const clan = await prisma.$transaction(async (tx) => {
      const newClan = await tx.clan.create({
        data: {
          name: name.trim(),
          description: description?.trim() || '',
          leaderId: user.id,
          xp: 0
        }
      });

      // Add user to the clan
      await tx.user.update({
        where: { id: user.id },
        data: { clanId: newClan.id }
      });

      return newClan;
    });

    return NextResponse.json({
      success: true,
      clan: {
        id: clan.id,
        name: clan.name,
        description: clan.description,
        leaderId: clan.leaderId,
        xp: clan.xp
      }
    });

  } catch (error) {
    console.error('POST /api/clans error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}