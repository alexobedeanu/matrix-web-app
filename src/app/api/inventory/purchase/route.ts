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
      where: { email: session.user.email },
      include: {
        inventory: {
          where: { itemId }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already owns this item
    if (user.inventory.length > 0) {
      return NextResponse.json({ error: 'You already own this item' }, { status: 400 });
    }

    // Get item details
    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId }
    });

    if (!item || !item.isActive) {
      return NextResponse.json({ error: 'Item not found or not available' }, { status: 404 });
    }

    // Check if user has enough coins
    if (user.coins < item.price) {
      return NextResponse.json({ 
        error: `Insufficient funds. Need ${item.price} coins, have ${user.coins}` 
      }, { status: 400 });
    }

    // Purchase item
    await prisma.$transaction([
      // Deduct coins from user
      prisma.user.update({
        where: { id: user.id },
        data: { 
          coins: user.coins - item.price,
          lastActive: new Date()
        }
      }),
      
      // Add item to user inventory
      prisma.userInventory.create({
        data: {
          userId: user.id,
          itemId: item.id,
          quantity: 1,
          equipped: false
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      item: {
        id: item.id,
        name: item.name,
        price: item.price
      },
      remainingCoins: user.coins - item.price
    });

  } catch (error) {
    console.error('POST /api/inventory/purchase error:', error);
    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 });
  }
}