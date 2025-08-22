'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';

interface Mission {
  id: string;
  title: string;
  description: string;
  type: string;
  target: number;
  xpReward: number;
  coinReward: number;
  category: string;
  icon: string;
  progress: number;
  isCompleted: boolean;
  expiresAt: string;
  timeRemaining: string;
}

interface MissionData {
  dailyMissions: Mission[];
  weeklyMissions: Mission[];
  completedToday: number;
  totalMissions: number;
}

export default function MissionsPage() {
  const { data: session, status } = useSession();
  const [missionData, setMissionData] = useState<MissionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }
    
    if (session?.user) {
      fetchMissions();
    }
  }, [session, status]);

  const fetchMissions = async () => {
    try {
      const response = await fetch('/api/missions');
      if (response.ok) {
        const data = await response.json();
        setMissionData(data);
      }
    } catch (error) {
      console.error('Failed to fetch missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimMission = async (missionId: string) => {
    try {
      const response = await fetch('/api/missions/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert(`🎉 Mission completed! +${result.xpReward} XP, +${result.coinReward} coins!`);
          await fetchMissions();
        }
      }
    } catch (error) {
      console.error('Failed to claim mission:', error);
    }
  };

  const formatTimeRemaining = (expiresAt: string): string => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'EXPIRED';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 p-8">
        <div className="text-center">
          <div className="text-3xl font-mono animate-pulse">LOADING_MISSIONS.exe</div>
          <div className="mt-4 text-lg font-mono text-green-300">Accessing mission database...</div>
        </div>
      </div>
    );
  }

  if (!missionData) {
    return (
      <div className="min-h-screen bg-black text-green-400 p-8">
        <div className="text-center">Error loading missions.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="border border-green-400 rounded-lg p-6 bg-black/50 backdrop-blur mb-8">
          <h1 className="text-4xl font-mono font-bold text-green-400 mb-4">
            {'>'} DAILY_MISSIONS.sys
          </h1>
          <p className="font-mono text-green-300 mb-4">
            Complete daily objectives to earn extra XP and coins. Missions reset every 24 hours.
          </p>
          
          <div className="flex items-center gap-8 text-sm font-mono">
            <div>
              <span className="text-green-300">COMPLETED_TODAY:</span>
              <span className="text-green-400 ml-2 font-bold">
                {missionData.completedToday}/{missionData.totalMissions}
              </span>
            </div>
            <div className="flex-1 bg-black border border-green-400 h-4 rounded">
              <div
                className="bg-green-400 h-full rounded transition-all duration-300"
                style={{ 
                  width: `${missionData.totalMissions > 0 ? (missionData.completedToday / missionData.totalMissions) * 100 : 0}%` 
                }}
              />
            </div>
            <div className="text-green-300">
              {missionData.totalMissions > 0 
                ? Math.round((missionData.completedToday / missionData.totalMissions) * 100)
                : 0
              }% COMPLETE
            </div>
          </div>
        </div>

        {/* Daily Missions */}
        <div className="mb-8">
          <h2 className="text-2xl font-mono font-bold text-green-400 mb-6 flex items-center gap-3">
            <span>📅</span> DAILY_OBJECTIVES
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {missionData.dailyMissions.map(mission => (
              <div
                key={mission.id}
                className={`border rounded-lg p-6 bg-black/50 backdrop-blur transition-all ${
                  mission.isCompleted 
                    ? 'border-cyan-400 bg-cyan-400/10' 
                    : 'border-green-400/50 hover:border-green-400'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{mission.icon}</div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-green-300">EXPIRES IN</div>
                    <div className="text-sm font-mono text-yellow-400">
                      {formatTimeRemaining(mission.expiresAt)}
                    </div>
                  </div>
                </div>

                <h3 className={`text-xl font-mono font-bold mb-2 ${
                  mission.isCompleted ? 'text-cyan-400' : 'text-green-400'
                }`}>
                  {mission.title}
                </h3>

                <p className="font-mono text-sm mb-4 text-green-300 leading-relaxed">
                  {mission.description}
                </p>

                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4 text-sm font-mono">
                    <span className="text-green-400">+{mission.xpReward} XP</span>
                    <span className="text-yellow-400">+{mission.coinReward} coins</span>
                  </div>
                </div>

                {mission.isCompleted ? (
                  <div className="text-center">
                    <div className="text-cyan-400 font-mono text-lg mb-2">✓ COMPLETED</div>
                    <button
                      onClick={() => claimMission(mission.id)}
                      className="w-full py-3 bg-cyan-400 text-black font-mono font-bold hover:bg-cyan-500 transition-colors"
                    >
                      CLAIM_REWARD
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-mono text-green-300">Progress:</span>
                      <span className="text-sm font-mono text-green-400">
                        {mission.progress}/{mission.target}
                      </span>
                    </div>
                    <div className="w-full bg-black border border-green-400 h-4 rounded">
                      <div
                        className="bg-green-400 h-full rounded transition-all duration-300"
                        style={{ width: `${Math.min(100, (mission.progress / mission.target) * 100)}%` }}
                      />
                    </div>
                    <div className="text-center mt-4">
                      <div className="text-green-300 font-mono text-sm">
                        {Math.round((mission.progress / mission.target) * 100)}% complete
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Missions */}
        {missionData.weeklyMissions.length > 0 && (
          <div>
            <h2 className="text-2xl font-mono font-bold text-purple-400 mb-6 flex items-center gap-3">
              <span>🏆</span> WEEKLY_CHALLENGES
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {missionData.weeklyMissions.map(mission => (
                <div
                  key={mission.id}
                  className={`border rounded-lg p-6 bg-black/50 backdrop-blur transition-all ${
                    mission.isCompleted 
                      ? 'border-purple-400 bg-purple-400/10' 
                      : 'border-purple-400/50 hover:border-purple-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">{mission.icon}</div>
                    <div className="text-right">
                      <div className="text-xs font-mono text-purple-300">EXPIRES IN</div>
                      <div className="text-sm font-mono text-yellow-400">
                        {formatTimeRemaining(mission.expiresAt)}
                      </div>
                    </div>
                  </div>

                  <h3 className={`text-xl font-mono font-bold mb-2 ${
                    mission.isCompleted ? 'text-purple-400' : 'text-purple-400'
                  }`}>
                    {mission.title}
                  </h3>

                  <p className="font-mono text-sm mb-4 text-purple-300 leading-relaxed">
                    {mission.description}
                  </p>

                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4 text-sm font-mono">
                      <span className="text-green-400">+{mission.xpReward} XP</span>
                      <span className="text-yellow-400">+{mission.coinReward} coins</span>
                    </div>
                  </div>

                  {mission.isCompleted ? (
                    <div className="text-center">
                      <div className="text-purple-400 font-mono text-lg mb-2">✓ COMPLETED</div>
                      <button
                        onClick={() => claimMission(mission.id)}
                        className="w-full py-3 bg-purple-400 text-black font-mono font-bold hover:bg-purple-500 transition-colors"
                      >
                        CLAIM_REWARD
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-mono text-purple-300">Progress:</span>
                        <span className="text-sm font-mono text-purple-400">
                          {mission.progress}/{mission.target}
                        </span>
                      </div>
                      <div className="w-full bg-black border border-purple-400 h-4 rounded">
                        <div
                          className="bg-purple-400 h-full rounded transition-all duration-300"
                          style={{ width: `${Math.min(100, (mission.progress / mission.target) * 100)}%` }}
                        />
                      </div>
                      <div className="text-center mt-4">
                        <div className="text-purple-300 font-mono text-sm">
                          {Math.round((mission.progress / mission.target) * 100)}% complete
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}