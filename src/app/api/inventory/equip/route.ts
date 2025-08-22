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

    const { itemId } = await request.json();

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user owns this item
    const userItem = await prisma.userInventory.findUnique({
      where: {
        userId_itemId: {
          userId: user.id,
          itemId
        }
      },
      include: {
        item: true
      }
    });

    if (!userItem) {
      return NextResponse.json({ error: 'You do not own this item' }, { status: 400 });
    }

    if (userItem.equipped) {
      return NextResponse.json({ error: 'Item is already equipped' }, { status: 400 });
    }

    // Check equipment limits (e.g., only one item per type)
    const currentlyEquippedOfType = await prisma.userInventory.findMany({
      where: {
        userId: user.id,
        equipped: true,
        item: {
          type: userItem.item.type
        }
      }
    });

    // Unequip other items of the same type (only one per type)
    if (currentlyEquippedOfType.length > 0) {
      await prisma.userInventory.updateMany({
        where: {
          userId: user.id,
          equipped: true,
          item: {
            type: userItem.item.type
          }
        },
        data: {
          equipped: false
        }
      });
    }

    // Equip the item
    await prisma.userInventory.update({
      where: {
        userId_itemId: {
          userId: user.id,
          itemId
        }
      },
      data: {
        equipped: true
      }
    });

    return NextResponse.json({
      success: true,
      item: {
        id: userItem.item.id,
        name: userItem.item.name,
        type: userItem.item.type
      }
    });

  } catch (error) {
    console.error('POST /api/inventory/equip error:', error);
    return NextResponse.json({ error: 'Failed to equip item' }, { status: 500 });
  }
}