'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

interface Duel {
  id: string;
  challengerId: string;
  challengeeId: string;
  status: string;
  challengerName: string;
  challengeeName: string;
  challengerScore: number;
  challengeeScore: number;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  puzzle?: {
    id: string;
    title: string;
    difficulty: string;
  };
}

interface Player {
  id: string;
  hackerAlias: string;
  name: string;
  level: number;
  xp: number;
  isOnline: boolean;
}

interface DuelData {
  activeDuels: Duel[];
  pendingChallenges: Duel[];
  completedDuels: Duel[];
  onlinePlayers: Player[];
  duelHistory: Duel[];
}

export default function DuelsPage() {
  const { data: session, status } = useSession();
  const [duelData, setDuelData] = useState<DuelData | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [activeTab, setActiveTab] = useState<'duels' | 'challenge' | 'history'>('duels');
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }
    
    if (session?.user) {
      fetchDuels();
      // Poll for updates every 5 seconds
      const interval = setInterval(fetchDuels, 5000);
      return () => clearInterval(interval);
    }
  }, [session, status]);

  const fetchDuels = async () => {
    try {
      const response = await fetch('/api/duels');
      if (response.ok) {
        const data = await response.json();
        setDuelData(data);
      }
    } catch (error) {
      console.error('Failed to fetch duels:', error);
    } finally {
      setLoading(false);
    }
  };

  const challengePlayer = async (playerId: string) => {
    try {
      const response = await fetch('/api/duels/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeeId: playerId })
      });

      if (response.ok) {
        const result = await response.json();
        addToast(`🎯 Challenge sent to ${result.challengeeName}!`, 'success');
        setSelectedPlayer(null);
        await fetchDuels();
      } else {
        const error = await response.json();
        addToast(`Challenge failed: ${error.error}`, 'error');
      }
    } catch (error) {
      console.error('Failed to challenge player:', error);
    }
  };

  const acceptChallenge = async (duelId: string) => {
    try {
      const response = await fetch(`/api/duels/${duelId}/accept`, {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        addToast('🎉 Challenge accepted! Redirecting to duel...', 'success');
        window.location.href = `/duels/${duelId}`;
      }
    } catch (error) {
      console.error('Failed to accept challenge:', error);
    }
  };

  const declineChallenge = async (duelId: string) => {
    try {
      const response = await fetch(`/api/duels/${duelId}/decline`, {
        method: 'POST'
      });

      if (response.ok) {
        await fetchDuels();
        addToast('Challenge declined.', 'info');
      }
    } catch (error) {
      console.error('Failed to decline challenge:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-400 border-yellow-400';
      case 'ACCEPTED':
        return 'text-cyan-400 border-cyan-400';
      case 'IN_PROGRESS':
        return 'text-green-400 border-green-400';
      case 'COMPLETED':
        return 'text-purple-400 border-purple-400';
      case 'CANCELLED':
        return 'text-red-400 border-red-400';
      default:
        return 'text-gray-400 border-gray-400';
    }
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 p-8">
        <div className="text-center">
          <div className="text-3xl font-mono animate-pulse">LOADING_COMBAT.sys</div>
          <div className="mt-4 text-lg font-mono text-green-300">Initializing PvP arena...</div>
        </div>
      </div>
    );
  }

  if (!duelData) {
    return (
      <div className="min-h-screen bg-black text-green-400 p-8">
        <div className="text-center">Error loading dueling system.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="border border-green-400 rounded-lg p-6 bg-black/50 backdrop-blur mb-8">
          <h1 className="text-4xl font-mono font-bold text-green-400 mb-4">
            {'>'} PVP_ARENA.exe
          </h1>
          <p className="font-mono text-green-300">
            Challenge other hackers to puzzle duels. First to solve wins the glory.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="border border-green-400/50 p-4 rounded bg-black/30">
            <div className="text-2xl font-mono font-bold text-green-400">
              {duelData.activeDuels.length}
            </div>
            <div className="text-sm font-mono text-green-300">ACTIVE DUELS</div>
          </div>
          <div className="border border-yellow-400/50 p-4 rounded bg-black/30">
            <div className="text-2xl font-mono font-bold text-yellow-400">
              {duelData.pendingChallenges.length}
            </div>
            <div className="text-sm font-mono text-yellow-300">PENDING</div>
          </div>
          <div className="border border-purple-400/50 p-4 rounded bg-black/30">
            <div className="text-2xl font-mono font-bold text-purple-400">
              {duelData.completedDuels.length}
            </div>
            <div className="text-sm font-mono text-purple-300">COMPLETED</div>
          </div>
          <div className="border border-cyan-400/50 p-4 rounded bg-black/30">
            <div className="text-2xl font-mono font-bold text-cyan-400">
              {duelData.onlinePlayers.length}
            </div>
            <div className="text-sm font-mono text-cyan-300">ONLINE</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-8">
          <button
            onClick={() => setActiveTab('duels')}
            className={`px-6 py-3 font-mono font-bold border-r border-green-400 transition-colors ${
              activeTab === 'duels'
                ? 'bg-green-400 text-black'
                : 'bg-black text-green-400 hover:bg-green-400/10'
            }`}
          >
            ACTIVE_DUELS
          </button>
          <button
            onClick={() => setActiveTab('challenge')}
            className={`px-6 py-3 font-mono font-bold border-r border-green-400 transition-colors ${
              activeTab === 'challenge'
                ? 'bg-green-400 text-black'
                : 'bg-black text-green-400 hover:bg-green-400/10'
            }`}
          >
            CHALLENGE_PLAYERS
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-mono font-bold transition-colors ${
              activeTab === 'history'
                ? 'bg-green-400 text-black'
                : 'bg-black text-green-400 hover:bg-green-400/10'
            }`}
          >
            DUEL_HISTORY
          </button>
        </div>

        {/* Content */}
        {activeTab === 'duels' && (
          <div className="space-y-6">
            {/* Pending Challenges */}
            {duelData.pendingChallenges.length > 0 && (
              <div>
                <h2 className="text-2xl font-mono font-bold text-yellow-400 mb-4">
                  ⚡ INCOMING_CHALLENGES
                </h2>
                <div className="grid gap-4">
                  {duelData.pendingChallenges.map(duel => (
                    <div
                      key={duel.id}
                      className="border border-yellow-400 rounded-lg p-6 bg-black/50 backdrop-blur"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-mono font-bold text-yellow-400">
                            Challenge from {duel.challengerName}
                          </div>
                          <div className="text-sm font-mono text-yellow-300">
                            {formatTimeAgo(duel.createdAt)}
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => acceptChallenge(duel.id)}
                            className="px-4 py-2 bg-green-400 text-black font-mono font-bold hover:bg-green-500 transition-colors"
                          >
                            ACCEPT
                          </button>
                          <button
                            onClick={() => declineChallenge(duel.id)}
                            className="px-4 py-2 border border-red-400 text-red-400 font-mono font-bold hover:bg-red-400 hover:text-black transition-colors"
                          >
                            DECLINE
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Duels */}
            <div>
              <h2 className="text-2xl font-mono font-bold text-green-400 mb-4">
                🎯 ACTIVE_BATTLES
              </h2>
              {duelData.activeDuels.length > 0 ? (
                <div className="grid gap-4">
                  {duelData.activeDuels.map(duel => (
                    <div
                      key={duel.id}
                      className={`border rounded-lg p-6 bg-black/50 backdrop-blur cursor-pointer hover:bg-black/70 transition-colors ${
                        getStatusColor(duel.status)
                      }`}
                      onClick={() => window.location.href = `/duels/${duel.id}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`px-3 py-1 border text-sm font-mono ${
                            getStatusColor(duel.status)
                          }`}>
                            {duel.status}
                          </div>
                          <div className="text-sm font-mono text-green-300">
                            {formatTimeAgo(duel.createdAt)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 items-center">
                        <div className="text-center">
                          <div className="font-mono font-bold text-green-400">
                            {duel.challengerName}
                          </div>
                          <div className="text-2xl font-mono text-green-400">
                            {duel.challengerScore}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-mono text-green-400">VS</div>
                          {duel.puzzle && (
                            <div className="text-xs font-mono text-green-300">
                              {duel.puzzle.title}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-center">
                          <div className="font-mono font-bold text-green-400">
                            {duel.challengeeName}
                          </div>
                          <div className="text-2xl font-mono text-green-400">
                            {duel.challengeeScore}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-green-300 font-mono">
                  No active duels. Challenge someone to start!
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'challenge' && (
          <div>
            <h2 className="text-2xl font-mono font-bold text-green-400 mb-6">
              🎯 AVAILABLE_TARGETS
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {duelData.onlinePlayers.map(player => (
                <div
                  key={player.id}
                  className="border border-green-400/50 rounded-lg p-6 bg-black/50 backdrop-blur hover:border-green-400 transition-all cursor-pointer"
                  onClick={() => setSelectedPlayer(player)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-mono text-green-300">ONLINE</span>
                    </div>
                    <div className="text-sm font-mono text-green-400">
                      Level {player.level}
                    </div>
                  </div>

                  <h3 className="text-lg font-mono font-bold text-green-400 mb-2">
                    {player.hackerAlias || player.name}
                  </h3>

                  <div className="text-sm font-mono text-green-300 mb-4">
                    {player.xp.toLocaleString()} XP
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      challengePlayer(player.id);
                    }}
                    className="w-full py-2 bg-red-400 text-black font-mono font-bold hover:bg-red-500 transition-colors"
                  >
                    CHALLENGE
                  </button>
                </div>
              ))}
            </div>

            {duelData.onlinePlayers.length === 0 && (
              <div className="text-center text-green-300 font-mono">
                No other players online at the moment.
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h2 className="text-2xl font-mono font-bold text-purple-400 mb-6">
              📚 BATTLE_HISTORY
            </h2>
            {duelData.duelHistory.length > 0 ? (
              <div className="space-y-4">
                {duelData.duelHistory.map(duel => (
                  <div
                    key={duel.id}
                    className="border border-purple-400/50 rounded-lg p-6 bg-black/50 backdrop-blur"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`px-3 py-1 border text-sm font-mono ${
                        getStatusColor(duel.status)
                      }`}>
                        {duel.status}
                      </div>
                      <div className="text-sm font-mono text-purple-300">
                        {formatTimeAgo(duel.createdAt)}
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 items-center">
                      <div className="text-center">
                        <div className={`font-mono font-bold ${
                          duel.challengerScore > duel.challengeeScore 
                            ? 'text-green-400' 
                            : 'text-red-400'
                        }`}>
                          {duel.challengerName}
                        </div>
                        <div className="text-xl font-mono">
                          {duel.challengerScore}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-mono text-purple-400">VS</div>
                      </div>
                      
                      <div className="text-center">
                        <div className={`font-mono font-bold ${
                          duel.challengeeScore > duel.challengerScore 
                            ? 'text-green-400' 
                            : 'text-red-400'
                        }`}>
                          {duel.challengeeName}
                        </div>
                        <div className="text-xl font-mono">
                          {duel.challengeeScore}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-purple-300 font-mono">
                No duel history yet. Start battling to build your record!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}