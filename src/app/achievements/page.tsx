'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
  coinReward: number;
  unlockedAt?: string;
  isUnlocked: boolean;
  progress: number;
}

interface AchievementData {
  unlockedAchievements: Achievement[];
  availableAchievements: Achievement[];
  totalUnlocked: number;
  totalAvailable: number;
}

const CATEGORY_COLORS = {
  PUZZLE_SOLVING: 'border-green-400 text-green-400',
  SOCIAL: 'border-blue-400 text-blue-400',
  PROGRESSION: 'border-yellow-400 text-yellow-400',
  SPECIAL: 'border-purple-400 text-purple-400'
};

const CATEGORY_LABELS = {
  PUZZLE_SOLVING: 'PUZZLE MASTER',
  SOCIAL: 'SOCIAL HACKER',
  PROGRESSION: 'RANK CLIMBER',
  SPECIAL: 'LEGENDARY'
};

export default function AchievementsPage() {
  const { data: session, status } = useSession();
  const [achievementData, setAchievementData] = useState<AchievementData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }
    
    if (session?.user) {
      fetchAchievements();
    }
  }, [session, status]);

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements');
      if (response.ok) {
        const data = await response.json();
        setAchievementData(data);
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerAchievementCheck = async () => {
    try {
      const response = await fetch('/api/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: 'manual_check' })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.newAchievements.length > 0) {
          alert(`🎉 New achievements unlocked: ${result.newAchievements.map((a: any) => a.name).join(', ')}!`);
          await fetchAchievements();
        } else {
          alert('No new achievements at this time. Keep hacking!');
        }
      }
    } catch (error) {
      console.error('Failed to check achievements:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 p-8">
        <div className="text-center">
          <div className="text-3xl font-mono animate-pulse">LOADING_ACHIEVEMENTS.exe</div>
          <div className="mt-4 text-lg font-mono text-green-300">Accessing achievement database...</div>
        </div>
      </div>
    );
  }

  if (!achievementData) {
    return (
      <div className="min-h-screen bg-black text-green-400 p-8">
        <div className="text-center">Error loading achievements.</div>
      </div>
    );
  }

  const allAchievements = [...achievementData.unlockedAchievements, ...achievementData.availableAchievements];
  
  const filteredAchievements = allAchievements.filter(achievement => {
    const categoryMatch = selectedCategory === 'ALL' || achievement.category === selectedCategory;
    const statusMatch = !showOnlyUnlocked || achievement.isUnlocked;
    return categoryMatch && statusMatch;
  });

  const categories = ['ALL', ...Object.keys(CATEGORY_COLORS)];

  return (
    <div className="min-h-screen bg-black text-green-400 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="border border-green-400 rounded-lg p-6 bg-black/50 backdrop-blur mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-mono font-bold text-green-400">
              {'>'} ACHIEVEMENT_MATRIX.sys
            </h1>
            <button
              onClick={triggerAchievementCheck}
              className="px-4 py-2 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-colors font-mono"
            >
              CHECK_FOR_NEW
            </button>
          </div>
          
          <div className="flex items-center gap-8 text-sm font-mono">
            <div>
              <span className="text-green-300">UNLOCKED:</span>
              <span className="text-green-400 ml-2 font-bold">
                {achievementData.totalUnlocked}/{achievementData.totalAvailable}
              </span>
            </div>
            <div className="flex-1 bg-black border border-green-400 h-4 rounded">
              <div
                className="bg-green-400 h-full rounded transition-all duration-300"
                style={{ 
                  width: `${achievementData.totalAvailable > 0 ? (achievementData.totalUnlocked / achievementData.totalAvailable) * 100 : 0}%` 
                }}
              />
            </div>
            <div className="text-green-300">
              {achievementData.totalAvailable > 0 
                ? Math.round((achievementData.totalUnlocked / achievementData.totalAvailable) * 100)
                : 0
              }% COMPLETE
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="border border-green-400 rounded-lg p-6 bg-black/50 backdrop-blur mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Category Filter */}
            <div>
              <h3 className="font-mono text-lg text-green-400 mb-4">FILTER_BY_CATEGORY:</h3>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`p-2 border font-mono text-sm transition-colors ${
                      selectedCategory === category
                        ? 'bg-green-400 text-black border-green-400'
                        : 'text-green-400 border-green-400/50 hover:border-green-400'
                    }`}
                  >
                    {category === 'ALL' ? 'ALL' : CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <h3 className="font-mono text-lg text-green-400 mb-4">DISPLAY_OPTIONS:</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowOnlyUnlocked(!showOnlyUnlocked)}
                  className={`w-full p-2 border font-mono text-sm transition-colors ${
                    showOnlyUnlocked
                      ? 'bg-cyan-400 text-black border-cyan-400'
                      : 'text-cyan-400 border-cyan-400/50 hover:border-cyan-400'
                  }`}
                >
                  {showOnlyUnlocked ? '✓ SHOW ONLY UNLOCKED' : 'SHOW ALL ACHIEVEMENTS'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map(achievement => (
            <div
              key={achievement.id}
              className={`border rounded-lg p-6 bg-black/50 backdrop-blur transition-all ${
                achievement.isUnlocked 
                  ? `${CATEGORY_COLORS[achievement.category as keyof typeof CATEGORY_COLORS]} shadow-lg`
                  : 'border-gray-600 text-gray-400 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">
                  {achievement.isUnlocked ? achievement.icon : '🔒'}
                </div>
                <div className={`px-2 py-1 border text-xs font-mono ${
                  achievement.isUnlocked 
                    ? CATEGORY_COLORS[achievement.category as keyof typeof CATEGORY_COLORS]
                    : 'border-gray-600 text-gray-500'
                }`}>
                  {CATEGORY_LABELS[achievement.category as keyof typeof CATEGORY_LABELS]}
                </div>
              </div>

              <h3 className={`text-xl font-mono font-bold mb-2 ${
                achievement.isUnlocked 
                  ? CATEGORY_COLORS[achievement.category as keyof typeof CATEGORY_COLORS]
                  : 'text-gray-500'
              }`}>
                {achievement.name}
              </h3>

              <p className={`font-mono text-sm mb-4 leading-relaxed ${
                achievement.isUnlocked ? 'text-green-300' : 'text-gray-500'
              }`}>
                {achievement.description}
              </p>

              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4 text-sm font-mono">
                  <span className={achievement.isUnlocked ? 'text-green-400' : 'text-gray-500'}>
                    +{achievement.xpReward} XP
                  </span>
                  <span className={achievement.isUnlocked ? 'text-yellow-400' : 'text-gray-500'}>
                    +{achievement.coinReward} coins
                  </span>
                </div>
              </div>

              {achievement.isUnlocked ? (
                <div className="text-center">
                  <div className="text-green-400 font-mono text-sm mb-2">✓ UNLOCKED</div>
                  {achievement.unlockedAt && (
                    <div className="text-green-300 font-mono text-xs">
                      {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-mono text-gray-500">Progress:</span>
                    <span className="text-sm font-mono text-gray-400">{Math.round(achievement.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-800 border border-gray-600 h-2 rounded">
                    <div
                      className="bg-gray-500 h-full rounded transition-all duration-300"
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center text-green-300 font-mono text-lg">
            No achievements found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
}