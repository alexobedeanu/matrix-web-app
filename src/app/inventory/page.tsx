'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  effect: any;
  icon: string;
  price: number;
  quantity: number;
  equipped: boolean;
  obtainedAt: string;
}

interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  effect: any;
  icon: string;
  price: number;
  owned: boolean;
}

interface InventoryData {
  items: InventoryItem[];
  shopItems: ShopItem[];
  userCoins: number;
  equippedItems: InventoryItem[];
}

const RARITY_COLORS = {
  COMMON: 'text-gray-400 border-gray-400',
  UNCOMMON: 'text-green-400 border-green-400',
  RARE: 'text-blue-400 border-blue-400',
  EPIC: 'text-purple-400 border-purple-400',
  LEGENDARY: 'text-yellow-400 border-yellow-400'
};

const TYPE_ICONS = {
  TOOL: '🔧',
  EXPLOIT: '💣',
  DECODER: '🔓',
  SCANNER: '📡',
  ENHANCER: '⚡',
  COSMETIC: '🎨'
};

export default function InventoryPage() {
  const { data: session, status } = useSession();
  const [inventoryData, setInventoryData] = useState<InventoryData | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'shop'>('inventory');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | ShopItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }
    
    if (session?.user) {
      fetchInventory();
    }
  }, [session, status]);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory');
      if (response.ok) {
        const data = await response.json();
        setInventoryData(data);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const equipItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/inventory/equip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      });

      if (response.ok) {
        await fetchInventory();
        alert('Item equipped successfully!');
      }
    } catch (error) {
      console.error('Failed to equip item:', error);
    }
  };

  const purchaseItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/inventory/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      });

      if (response.ok) {
        const result = await response.json();
        await fetchInventory();
        alert(`🎉 Purchased ${result.item.name}!`);
      } else {
        const error = await response.json();
        alert(`Purchase failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to purchase item:', error);
    }
  };

  const getEffectDescription = (effect: any): string => {
    if (!effect) return 'No special effect';
    
    switch (effect.type) {
      case 'xp_boost':
        return `+${effect.value}% XP gain`;
      case 'hint_discount':
        return `${effect.value}% cheaper hints`;
      case 'time_bonus':
        return `+${effect.value}s puzzle time`;
      case 'coin_boost':
        return `+${effect.value}% coin gain`;
      case 'stealth':
        return 'Hide from leaderboards';
      case 'cosmetic':
        return 'Visual customization';
      default:
        return effect.description || 'Unknown effect';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 p-8">
        <div className="text-center">
          <div className="text-3xl font-mono animate-pulse">LOADING_INVENTORY.exe</div>
          <div className="mt-4 text-lg font-mono text-green-300">Accessing digital vault...</div>
        </div>
      </div>
    );
  }

  if (!inventoryData) {
    return (
      <div className="min-h-screen bg-black text-green-400 p-8">
        <div className="text-center">Error loading inventory.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="border border-green-400 rounded-lg p-6 bg-black/50 backdrop-blur mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-mono font-bold text-green-400">
              {'>'} DIGITAL_INVENTORY.sys
            </h1>
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-yellow-400">
                💰 {inventoryData.userCoins.toLocaleString()} coins
              </div>
              <div className="text-sm font-mono text-yellow-300">CYBER_CURRENCY</div>
            </div>
          </div>
          <p className="font-mono text-green-300">
            Manage your digital tools and exploits. Equip items for puzzle-solving bonuses.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex mb-8">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-3 font-mono font-bold border-r border-green-400 transition-colors ${
              activeTab === 'inventory'
                ? 'bg-green-400 text-black'
                : 'bg-black text-green-400 hover:bg-green-400/10'
            }`}
          >
            MY_INVENTORY ({inventoryData.items.length})
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`px-6 py-3 font-mono font-bold transition-colors ${
              activeTab === 'shop'
                ? 'bg-green-400 text-black'
                : 'bg-black text-green-400 hover:bg-green-400/10'
            }`}
          >
            DARKNET_SHOP ({inventoryData.shopItems.length})
          </button>
        </div>

        {/* Equipped Items */}
        {activeTab === 'inventory' && inventoryData.equippedItems.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-mono font-bold text-cyan-400 mb-4">
              ⚡ EQUIPPED_ITEMS
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {inventoryData.equippedItems.map(item => (
                <div
                  key={item.id}
                  className={`border rounded-lg p-4 bg-black/50 backdrop-blur ${
                    RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS]
                  } shadow-lg`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">{TYPE_ICONS[item.type as keyof typeof TYPE_ICONS]}</div>
                    <div>
                      <div className={`font-mono font-bold ${
                        RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS]
                      }`}>
                        {item.name}
                      </div>
                      <div className="text-xs font-mono text-green-300">{item.rarity}</div>
                    </div>
                  </div>
                  <p className="text-sm font-mono text-green-300 mb-2">
                    {getEffectDescription(item.effect)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(activeTab === 'inventory' ? inventoryData.items : inventoryData.shopItems).map(item => (
                <div
                  key={item.id}
                  className={`border rounded-lg p-6 bg-black/50 backdrop-blur transition-all hover:scale-105 cursor-pointer ${
                    RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS]
                  } ${selectedItem?.id === item.id ? 'shadow-lg ring-2 ring-current' : ''}`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">{TYPE_ICONS[item.type as keyof typeof TYPE_ICONS]}</div>
                    <div className={`px-2 py-1 border text-xs font-mono ${
                      RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS]
                    }`}>
                      {item.rarity}
                    </div>
                  </div>

                  <h3 className={`text-lg font-mono font-bold mb-2 ${
                    RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS]
                  }`}>
                    {item.name}
                  </h3>

                  <p className="font-mono text-sm text-green-300 mb-4 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mb-4">
                    <div className="text-xs font-mono text-green-300 mb-1">EFFECT:</div>
                    <div className="text-sm font-mono text-cyan-400">
                      {getEffectDescription(item.effect)}
                    </div>
                  </div>

                  {activeTab === 'inventory' ? (
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-mono text-green-300">
                        QTY: {'quantity' in item ? item.quantity : 1}
                      </div>
                      {'equipped' in item ? (
                        item.equipped ? (
                          <div className="text-cyan-400 font-mono text-sm">✓ EQUIPPED</div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              equipItem(item.id);
                            }}
                            className="px-3 py-1 bg-green-400 text-black font-mono text-sm font-bold hover:bg-green-500 transition-colors"
                          >
                            EQUIP
                          </button>
                        )
                      ) : null}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-mono font-bold text-yellow-400">
                        💰 {item.price.toLocaleString()}
                      </div>
                      {'owned' in item ? (
                        item.owned ? (
                          <div className="text-green-400 font-mono text-sm">✓ OWNED</div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              purchaseItem(item.id);
                            }}
                            className="px-4 py-2 bg-green-400 text-black font-mono font-bold hover:bg-green-500 transition-colors"
                            disabled={inventoryData.userCoins < item.price}
                          >
                            BUY
                          </button>
                        )
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {(activeTab === 'inventory' ? inventoryData.items : inventoryData.shopItems).length === 0 && (
              <div className="text-center text-green-300 font-mono text-lg">
                {activeTab === 'inventory' 
                  ? 'Your inventory is empty. Visit the shop to acquire items!'
                  : 'Shop is currently empty. Check back later for new items!'
                }
              </div>
            )}
          </div>

          {/* Item Details Sidebar */}
          <div className="lg:col-span-1">
            {selectedItem ? (
              <div className="border border-green-400 rounded-lg p-6 bg-black/50 backdrop-blur sticky top-8">
                <h3 className="text-xl font-mono font-bold text-green-400 mb-4">
                  ITEM_DETAILS
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-mono text-green-300">NAME:</div>
                    <div className={`font-mono font-bold ${
                      RARITY_COLORS[selectedItem.rarity as keyof typeof RARITY_COLORS]
                    }`}>
                      {selectedItem.name}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-mono text-green-300">TYPE:</div>
                    <div className="font-mono text-green-400">
                      {TYPE_ICONS[selectedItem.type as keyof typeof TYPE_ICONS]} {selectedItem.type}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-mono text-green-300">RARITY:</div>
                    <div className={`font-mono ${
                      RARITY_COLORS[selectedItem.rarity as keyof typeof RARITY_COLORS]
                    }`}>
                      {selectedItem.rarity}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-mono text-green-300">DESCRIPTION:</div>
                    <div className="font-mono text-green-400 text-sm leading-relaxed">
                      {selectedItem.description}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-mono text-green-300">EFFECT:</div>
                    <div className="font-mono text-cyan-400 text-sm">
                      {getEffectDescription(selectedItem.effect)}
                    </div>
                  </div>

                  {'obtainedAt' in selectedItem && (
                    <div>
                      <div className="text-sm font-mono text-green-300">OBTAINED:</div>
                      <div className="font-mono text-green-400 text-sm">
                        {new Date(selectedItem.obtainedAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {activeTab === 'shop' && (
                    <div>
                      <div className="text-sm font-mono text-green-300">PRICE:</div>
                      <div className="font-mono text-yellow-400 text-lg font-bold">
                        💰 {selectedItem.price.toLocaleString()} coins
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="border border-green-400/50 rounded-lg p-6 bg-black/30 backdrop-blur text-center">
                <div className="text-green-300 font-mono">
                  Click on an item to view details
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}