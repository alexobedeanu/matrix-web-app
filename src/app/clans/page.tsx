'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';

interface Clan {
  id: string;
  name: string;
  description: string;
  image: string;
  leaderId: string;
  xp: number;
  createdAt: string;
  memberCount: number;
  isUserMember: boolean;
  leaderName: string;
}

interface ClanMember {
  id: string;
  hackerAlias: string;
  name: string;
  level: number;
  xp: number;
  joinedAt: string;
  isLeader: boolean;
}

interface ClanData {
  userClan: Clan | null;
  availableClans: Clan[];
  clanMembers: ClanMember[];
}

export default function ClansPage() {
  const { data: session, status } = useSession();
  const [clanData, setClanData] = useState<ClanData | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }
    
    if (session?.user) {
      fetchClans();
    }
  }, [session, status]);

  const fetchClans = async () => {
    try {
      const response = await fetch('/api/clans');
      if (response.ok) {
        const data = await response.json();
        setClanData(data);
      }
    } catch (error) {
      console.error('Failed to fetch clans:', error);
    } finally {
      setLoading(false);
    }
  };

  const createClan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/clans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });

      if (response.ok) {
        setShowCreateForm(false);
        setCreateForm({ name: '', description: '' });
        await fetchClans();
        alert('🎉 Clan created successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to create clan: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to create clan:', error);
      alert('Failed to create clan. Please try again.');
    }
  };

  const joinClan = async (clanId: string) => {
    try {
      const response = await fetch(`/api/clans/${clanId}/join`, {
        method: 'POST'
      });

      if (response.ok) {
        await fetchClans();
        alert('🎉 Successfully joined clan!');
      } else {
        const error = await response.json();
        alert(`Failed to join clan: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to join clan:', error);
      alert('Failed to join clan. Please try again.');
    }
  };

  const leaveClan = async () => {
    if (!clanData?.userClan) return;

    if (confirm('Are you sure you want to leave your clan?')) {
      try {
        const response = await fetch(`/api/clans/${clanData.userClan.id}/leave`, {
          method: 'POST'
        });

        if (response.ok) {
          await fetchClans();
          alert('Left clan successfully.');
        }
      } catch (error) {
        console.error('Failed to leave clan:', error);
        alert('Failed to leave clan. Please try again.');
      }
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 p-8">
        <div className="text-center">
          <div className="text-3xl font-mono animate-pulse">LOADING_CLANS.exe</div>
          <div className="mt-4 text-lg font-mono text-green-300">Accessing clan database...</div>
        </div>
      </div>
    );
  }

  if (!clanData) {
    return (
      <div className="min-h-screen bg-black text-green-400 p-8">
        <div className="text-center">Error loading clans.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="border border-green-400 rounded-lg p-6 bg-black/50 backdrop-blur mb-8">
          <h1 className="text-4xl font-mono font-bold text-green-400 mb-4">
            {'>'} HACKER_CLANS.sys
          </h1>
          <p className="font-mono text-green-300">
            Join forces with other hackers. Compete in team challenges and climb the clan rankings.
          </p>
        </div>

        {clanData.userClan ? (
          /* User's Clan */
          <div className="mb-8">
            <div className="border border-cyan-400 rounded-lg p-8 bg-black/50 backdrop-blur">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-mono font-bold text-cyan-400 mb-2">
                    {clanData.userClan.name}
                  </h2>
                  <p className="font-mono text-cyan-300">{clanData.userClan.description}</p>
                </div>
                <button
                  onClick={leaveClan}
                  className="px-4 py-2 border border-red-400 text-red-400 hover:bg-red-400 hover:text-black transition-colors font-mono"
                >
                  LEAVE_CLAN
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold text-cyan-400">
                    {clanData.userClan.memberCount}
                  </div>
                  <div className="text-sm font-mono text-cyan-300">MEMBERS</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold text-green-400">
                    {clanData.userClan.xp.toLocaleString()}
                  </div>
                  <div className="text-sm font-mono text-green-300">TOTAL XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold text-yellow-400">
                    {clanData.userClan.leaderName}
                  </div>
                  <div className="text-sm font-mono text-yellow-300">LEADER</div>
                </div>
              </div>

              {/* Clan Members */}
              <div>
                <h3 className="text-xl font-mono font-bold text-cyan-400 mb-4">CLAN_MEMBERS:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {clanData.clanMembers.map(member => (
                    <div
                      key={member.id}
                      className="border border-cyan-400/30 p-4 rounded bg-black/30"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-cyan-400">
                              {member.hackerAlias || member.name}
                            </span>
                            {member.isLeader && (
                              <span className="text-yellow-400 text-sm">👑</span>
                            )}
                          </div>
                          <div className="text-sm font-mono text-cyan-300">
                            Level {member.level} • {member.xp.toLocaleString()} XP
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono text-cyan-300">JOINED</div>
                          <div className="text-xs font-mono text-cyan-400">
                            {new Date(member.joinedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* No Clan - Show Available Clans */
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-mono font-bold text-green-400">
                AVAILABLE_CLANS
              </h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-6 py-3 bg-green-400 text-black font-mono font-bold hover:bg-green-500 transition-colors"
              >
                CREATE_CLAN
              </button>
            </div>

            {showCreateForm && (
              <div className="border border-green-400 rounded-lg p-6 bg-black/50 backdrop-blur mb-6">
                <h3 className="text-xl font-mono font-bold text-green-400 mb-4">CREATE_NEW_CLAN</h3>
                <form onSubmit={createClan} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Clan name..."
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full p-3 bg-black border border-green-400 text-green-400 font-mono focus:outline-none focus:ring-1 focus:ring-green-400"
                    required
                  />
                  <textarea
                    placeholder="Clan description..."
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    rows={4}
                    className="w-full p-3 bg-black border border-green-400 text-green-400 font-mono focus:outline-none focus:ring-1 focus:ring-green-400"
                  />
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-green-400 text-black font-mono font-bold hover:bg-green-500 transition-colors"
                    >
                      CREATE_CLAN
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-6 py-3 border border-red-400 text-red-400 font-mono font-bold hover:bg-red-400 hover:text-black transition-colors"
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clanData.availableClans.map(clan => (
                <div
                  key={clan.id}
                  className="border border-green-400/50 rounded-lg p-6 bg-black/50 backdrop-blur hover:border-green-400 transition-all"
                >
                  <h3 className="text-xl font-mono font-bold text-green-400 mb-2">
                    {clan.name}
                  </h3>
                  <p className="font-mono text-sm text-green-300 mb-4 leading-relaxed">
                    {clan.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                    <div>
                      <div className="text-lg font-mono font-bold text-green-400">
                        {clan.memberCount}
                      </div>
                      <div className="text-xs font-mono text-green-300">MEMBERS</div>
                    </div>
                    <div>
                      <div className="text-lg font-mono font-bold text-yellow-400">
                        {clan.xp.toLocaleString()}
                      </div>
                      <div className="text-xs font-mono text-yellow-300">XP</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs font-mono text-green-300">LEADER:</div>
                    <div className="text-sm font-mono text-green-400">{clan.leaderName}</div>
                  </div>

                  <button
                    onClick={() => joinClan(clan.id)}
                    className="w-full py-3 bg-green-400 text-black font-mono font-bold hover:bg-green-500 transition-colors"
                  >
                    JOIN_CLAN
                  </button>
                </div>
              ))}
            </div>

            {clanData.availableClans.length === 0 && (
              <div className="text-center text-green-300 font-mono text-lg">
                No clans available. Be the first to create one!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}