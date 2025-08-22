import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with inventory
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        inventory: {
          include: {
            item: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Seed shop items if none exist
    await seedShopItems();

    // Get all shop items
    const shopItems = await prisma.inventoryItem.findMany({
      where: { isActive: true }
    });

    // Format user inventory
    const userInventory = user.inventory.map(ui => ({
      id: ui.item.id,
      name: ui.item.name,
      description: ui.item.description,
      type: ui.item.type,
      rarity: ui.item.rarity,
      effect: typeof ui.item.effect === 'string' ? JSON.parse(ui.item.effect) : ui.item.effect,
      icon: ui.item.icon,
      price: ui.item.price,
      quantity: ui.quantity,
      equipped: ui.equipped,
      obtainedAt: ui.obtainedAt
    }));

    // Format shop items with ownership info
    const formattedShopItems = shopItems.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      type: item.type,
      rarity: item.rarity,
      effect: typeof item.effect === 'string' ? JSON.parse(item.effect) : item.effect,
      icon: item.icon,
      price: item.price,
      owned: user.inventory.some(ui => ui.itemId === item.id)
    }));

    // Get equipped items
    const equippedItems = userInventory.filter(item => item.equipped);

    return NextResponse.json({
      items: userInventory,
      shopItems: formattedShopItems,
      userCoins: user.coins,
      equippedItems
    });

  } catch (error) {
    console.error('GET /api/inventory error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function seedShopItems() {
  const existingItems = await prisma.inventoryItem.count();
  
  if (existingItems === 0) {
    const shopItems = [
      // Tools
      {
        name: 'Advanced Decoder',
        description: 'Decrypt messages 20% faster with enhanced algorithms.',
        type: 'DECODER',
        rarity: 'UNCOMMON',
        effect: JSON.stringify({ type: 'time_bonus', value: 30 }),
        icon: '🔓',
        price: 500
      },
      {
        name: 'Neural Scanner',
        description: 'Advanced pattern recognition for complex puzzles.',
        type: 'SCANNER',
        rarity: 'RARE',
        effect: JSON.stringify({ type: 'hint_discount', value: 25 }),
        icon: '📡',
        price: 1200
      },
      {
        name: 'Quantum Toolkit',
        description: 'Elite hacker\'s multi-purpose digital Swiss Army knife.',
        type: 'TOOL',
        rarity: 'EPIC',
        effect: JSON.stringify({ type: 'xp_boost', value: 15 }),
        icon: '🔧',
        price: 2500
      },

      // Exploits
      {
        name: 'SQL Injector Pro',
        description: 'Automated SQL injection testing suite.',
        type: 'EXPLOIT',
        rarity: 'UNCOMMON',
        effect: JSON.stringify({ type: 'category_bonus', category: 'WEB_SECURITY', value: 25 }),
        icon: '💣',
        price: 800
      },
      {
        name: 'Buffer Overflow Kit',
        description: 'Advanced memory corruption exploitation tools.',
        type: 'EXPLOIT',
        rarity: 'RARE',
        effect: JSON.stringify({ type: 'category_bonus', category: 'REVERSE_ENGINEERING', value: 30 }),
        icon: '💥',
        price: 1500
      },

      // Enhancers
      {
        name: 'Cognitive Enhancer',
        description: 'Boost your mental processing power.',
        type: 'ENHANCER',
        rarity: 'RARE',
        effect: JSON.stringify({ type: 'xp_boost', value: 25 }),
        icon: '⚡',
        price: 2000
      },
      {
        name: 'Luck Amplifier',
        description: 'Increases coin drops from successful hacks.',
        type: 'ENHANCER',
        rarity: 'EPIC',
        effect: JSON.stringify({ type: 'coin_boost', value: 50 }),
        icon: '🍀',
        price: 3000
      },
      {
        name: 'Ghost Protocol',
        description: 'Hide your activities from tracking systems.',
        type: 'ENHANCER',
        rarity: 'LEGENDARY',
        effect: JSON.stringify({ type: 'stealth', description: 'Hide from public leaderboards' }),
        icon: '👻',
        price: 10000
      },

      // Cosmetic
      {
        name: 'Neon Avatar Skin',
        description: 'Stand out with a glowing neon appearance.',
        type: 'COSMETIC',
        rarity: 'UNCOMMON',
        effect: JSON.stringify({ type: 'cosmetic', description: 'Neon glow effect' }),
        icon: '🎨',
        price: 300
      },
      {
        name: 'Matrix Code Rain',
        description: 'Classic green code rain visual effect.',
        type: 'COSMETIC',
        rarity: 'RARE',
        effect: JSON.stringify({ type: 'cosmetic', description: 'Matrix background effect' }),
        icon: '💚',
        price: 750
      },
      {
        name: 'Elite Hacker Badge',
        description: 'Show off your legendary status.',
        type: 'COSMETIC',
        rarity: 'LEGENDARY',
        effect: JSON.stringify({ type: 'cosmetic', description: 'Exclusive badge display' }),
        icon: '👑',
        price: 5000
      },

      // Common starter items
      {
        name: 'Basic Hex Editor',
        description: 'Essential tool for any aspiring hacker.',
        type: 'TOOL',
        rarity: 'COMMON',
        effect: JSON.stringify({ type: 'xp_boost', value: 5 }),
        icon: '🔧',
        price: 100
      },
      {
        name: 'Network Sniffer',
        description: 'Capture and analyze network packets.',
        type: 'SCANNER',
        rarity: 'COMMON',
        effect: JSON.stringify({ type: 'category_bonus', category: 'NETWORK', value: 10 }),
        icon: '📡',
        price: 200
      },
      {
        name: 'Crypto Decoder',
        description: 'Basic cryptographic analysis tools.',
        type: 'DECODER',
        rarity: 'COMMON',
        effect: JSON.stringify({ type: 'category_bonus', category: 'CRYPTOGRAPHY', value: 10 }),
        icon: '🔓',
        price: 150
      }
    ];

    for (const item of shopItems) {
      await prisma.inventoryItem.upsert({
        where: { name: item.name },
        update: {},
        create: item
      });
    }
  }
}