'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import { getLevelTitle } from '@/lib/xp-system';

interface LeaderboardUser {
  id: string;
  hackerAlias: string | null;
  name: string | null;
  email: string;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  puzzlesSolved: number;
  rank: number;
  isCurrentUser?: boolean;
}

type LeaderboardType = 'xp' | 'level' | 'puzzles' | 'streak';

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardUser | null>(null);
  const [activeTab, setActiveTab] = useState<LeaderboardType>('xp');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }
    
    if (session?.user) {
      fetchLeaderboard();
    }
  }, [session, status, activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/leaderboard?type=${activeTab}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard);
        setCurrentUserRank(data.currentUser);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400'; // Gold
    if (rank === 2) return 'text-gray-300'; // Silver  
    if (rank === 3) return 'text-orange-400'; // Bronze
    return 'text-green-400';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const tabs = [
    { id: 'xp', label: 'XP', icon: '⚡' },
    { id: 'level', label: 'LEVEL', icon: '🔥' },
    { id: 'puzzles', label: 'PUZZLES', icon: '🧩' },
    { id: 'streak', label: 'STREAK', icon: '📈' }
  ];

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 p-8">
        <div className="text-center">
          <div className="text-3xl font-mono animate-pulse">LOADING_RANKINGS.exe</div>
          <div className="mt-4 text-lg font-mono text-green-300">Accessing global database...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="border border-green-400 rounded-lg p-6 bg-black/50 backdrop-blur mb-8">
          <h1 className="text-4xl font-mono font-bold text-green-400 mb-4">
            {'>'} GLOBAL_LEADERBOARD.sys
          </h1>
          <p className="font-mono text-green-300">
            Rise through the ranks and prove your worth in the digital realm.
          </p>
        </div>

        {/* Tabs */}
        <div className="border border-green-400 rounded-lg p-6 bg-black/50 backdrop-blur mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as LeaderboardType)}
                className={`p-4 border font-mono text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-green-400 text-black border-green-400'
                    : 'text-green-400 border-green-400/50 hover:border-green-400'
                }`}
              >
                <div className="text-2xl mb-2">{tab.icon}</div>
                <div>{tab.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2">
            <div className="border border-green-400 rounded-lg p-6 bg-black/50 backdrop-blur">
              <h2 className="text-2xl font-mono font-bold text-green-400 mb-6">
                TOP_50_RANKINGS
              </h2>

              <div className="space-y-3">
                {leaderboard.map((user, index) => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-4 border rounded transition-colors ${
                      user.isCurrentUser 
                        ? 'border-cyan-400 bg-cyan-400/10' 
                        : 'border-green-400/30 hover:border-green-400/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`text-2xl font-mono font-bold ${getRankColor(user.rank)}`}>
                        {getRankIcon(user.rank)}
                      </div>
                      
                      <div>
                        <div className="font-mono font-bold text-green-400">
                          {user.hackerAlias || user.name || 'UNNAMED_HACKER'}
                        </div>
                        <div className="text-sm font-mono text-green-300">
                          {getLevelTitle(user.level)} - Level {user.level}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      {activeTab === 'xp' && (
                        <div className="text-green-400 font-bold">{user.xp.toLocaleString()} XP</div>
                      )}
                      {activeTab === 'level' && (
                        <div className="text-green-400 font-bold">Level {user.level}</div>
                      )}
                      {activeTab === 'puzzles' && (
                        <div className="text-green-400 font-bold">{user.puzzlesSolved} solved</div>
                      )}
                      {activeTab === 'streak' && (
                        <div className="text-orange-400 font-bold">{user.streak} days</div>
                      )}
                      <div className="text-sm text-green-300">
                        {user.coins.toLocaleString()} coins
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Current User Stats */}
          <div className="space-y-6">
            {/* Current User Rank */}
            {currentUserRank && (
              <div className="border border-cyan-400 rounded-lg p-6 bg-black/50 backdrop-blur">
                <h3 className="text-xl font-mono font-bold text-cyan-400 mb-4">
                  YOUR_RANK
                </h3>
                
                <div className="text-center space-y-4">
                  <div className={`text-6xl font-mono font-bold ${getRankColor(currentUserRank.rank)}`}>
                    {getRankIcon(currentUserRank.rank)}
                  </div>
                  
                  <div>
                    <div className="font-mono font-bold text-green-400 text-lg">
                      {currentUserRank.hackerAlias || currentUserRank.name || 'UNNAMED_HACKER'}
                    </div>
                    <div className="text-sm font-mono text-green-300">
                      {getLevelTitle(currentUserRank.level)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="font-mono text-sm text-green-300">XP</div>
                      <div className="font-mono font-bold text-green-400">
                        {currentUserRank.xp.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-sm text-green-300">LEVEL</div>
                      <div className="font-mono font-bold text-green-400">
                        {currentUserRank.level}
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-sm text-green-300">SOLVED</div>
                      <div className="font-mono font-bold text-green-400">
                        {currentUserRank.puzzlesSolved}
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-sm text-green-300">STREAK</div>
                      <div className="font-mono font-bold text-orange-400">
                        {currentUserRank.streak}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="border border-green-400 rounded-lg p-6 bg-black/50 backdrop-blur">
              <h3 className="text-xl font-mono font-bold text-green-400 mb-4">
                SYSTEM_STATS
              </h3>
              
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-green-300">TOTAL_HACKERS:</span>
                  <span className="text-green-400">{leaderboard.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-300">AVG_LEVEL:</span>
                  <span className="text-green-400">
                    {leaderboard.length > 0 
                      ? Math.round(leaderboard.reduce((sum, u) => sum + u.level, 0) / leaderboard.length)
                      : 0
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-300">TOP_XP:</span>
                  <span className="text-green-400">
                    {leaderboard[0]?.xp.toLocaleString() || '0'}
                  </span>
                </div>
              </div>
            </div>

            {/* Achievement Preview */}
            <div className="border border-purple-400 rounded-lg p-6 bg-black/50 backdrop-blur">
              <h3 className="text-xl font-mono font-bold text-purple-400 mb-4">
                ACHIEVEMENTS
              </h3>
              <div className="text-center text-purple-300 font-mono text-sm">
                Coming soon...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}