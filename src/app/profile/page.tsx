'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import { getLevelInfo, getLevelTitle } from '@/lib/xp-system';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  hackerAlias: string | null;
  bio: string | null;
  level: number;
  xp: number;
  coins: number;
  streak: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    hackerAlias: '',
    bio: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }
    
    if (session?.user) {
      fetchProfile();
    }
  }, [session, status]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          hackerAlias: data.hackerAlias || '',
          bio: data.bio || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchProfile();
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const awardXP = async (action: string, multiplier = 1) => {
    try {
      const response = await fetch('/api/xp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, multiplier }),
      });

      if (response.ok) {
        const result = await response.json();
        await fetchProfile();
        
        if (result.leveledUp) {
          alert(`🎉 LEVEL UP! You reached level ${result.newLevel}! +${result.coinsGained} coins!`);
        }
      }
    } catch (error) {
      console.error('Failed to award XP:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black text-green-400 p-8">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-green-400 p-8">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="border border-green-400 rounded-lg p-8 bg-black/50 backdrop-blur">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-mono font-bold text-green-400">
              PROFILE_ACCESS.exe
            </h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-colors font-mono"
            >
              {isEditing ? 'CANCEL' : 'EDIT'}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              <div className="border border-green-400 p-4 rounded">
                <h2 className="text-xl font-mono mb-4 text-green-400">IDENTITY</h2>
                
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-mono mb-2">HACKER_ALIAS:</label>
                      <input
                        type="text"
                        value={formData.hackerAlias}
                        onChange={(e) => setFormData({ ...formData, hackerAlias: e.target.value })}
                        className="w-full p-2 bg-black border border-green-400 text-green-400 font-mono focus:outline-none focus:ring-1 focus:ring-green-400"
                        placeholder="Enter your hacker alias..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-mono mb-2">BIO:</label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={4}
                        className="w-full p-2 bg-black border border-green-400 text-green-400 font-mono focus:outline-none focus:ring-1 focus:ring-green-400"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full py-2 bg-green-400 text-black font-mono font-bold hover:bg-green-500 transition-colors"
                    >
                      UPDATE_PROFILE
                    </button>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-mono">EMAIL:</span>
                      <div className="font-mono">{profile.email}</div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-mono">ALIAS:</span>
                      <div className="font-mono text-lg">
                        {profile.hackerAlias || 'UNNAMED_HACKER'}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-mono">BIO:</span>
                      <div className="font-mono text-sm text-green-300">
                        {profile.bio || 'No bio set...'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Stats */}
            <div className="space-y-6">
              <div className="border border-green-400 p-4 rounded">
                <h2 className="text-xl font-mono mb-4 text-green-400">STATS</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-mono">LEVEL:</span>
                    <div className="text-right">
                      <div className="font-mono text-xl font-bold">{profile.level}</div>
                      <div className="font-mono text-xs text-green-300">{getLevelTitle(profile.level)}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-mono">XP:</span>
                      <span className="font-mono">{profile.xp} / {getLevelInfo(profile.xp).xpForNextLevel}</span>
                    </div>
                    <div className="w-full bg-black border border-green-400 h-4 rounded">
                      <div
                        className="bg-green-400 h-full rounded transition-all duration-300"
                        style={{ width: `${getLevelInfo(profile.xp).progressPercentage}%` }}
                      />
                    </div>
                    <div className="text-xs font-mono text-green-300 mt-1">
                      {getLevelInfo(profile.xp).xpNeededForNext} XP to next level
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-mono">COINS:</span>
                    <span className="font-mono text-xl font-bold text-yellow-400">{profile.coins}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-mono">STREAK:</span>
                    <span className="font-mono text-xl font-bold text-orange-400">{profile.streak}</span>
                  </div>
                  
                  {/* Debug XP buttons - remove in production */}
                  <div className="mt-6 p-4 border border-yellow-400 rounded">
                    <div className="text-sm font-mono text-yellow-400 mb-2">DEBUG MODE:</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => awardXP('DAILY_LOGIN')}
                        className="px-2 py-1 text-xs font-mono border border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                      >
                        +DAILY LOGIN
                      </button>
                      <button
                        onClick={() => awardXP('PUZZLE_EASY')}
                        className="px-2 py-1 text-xs font-mono border border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                      >
                        +PUZZLE EASY
                      </button>
                      <button
                        onClick={() => awardXP('PUZZLE_HARD')}
                        className="px-2 py-1 text-xs font-mono border border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                      >
                        +PUZZLE HARD
                      </button>
                      <button
                        onClick={() => awardXP('ACHIEVEMENT_UNLOCK')}
                        className="px-2 py-1 text-xs font-mono border border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                      >
                        +ACHIEVEMENT
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-green-400 p-4 rounded">
                <h2 className="text-xl font-mono mb-4 text-green-400">ACHIEVEMENTS</h2>
                <div className="text-center text-green-300 font-mono">
                  Coming soon...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}