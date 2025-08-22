'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-green-900/20"></div>
        <div className="text-center z-10">
          <div className="animate-pulse">
            <div className="text-6xl font-mono text-green-400 mb-4">{'>'} LOADING...</div>
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-8 bg-green-400 animate-pulse"></div>
              <div className="w-2 h-8 bg-cyan-400 animate-pulse delay-100"></div>
              <div className="w-2 h-8 bg-purple-400 animate-pulse delay-200"></div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="matrix-bg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Matrix Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/30 to-green-900/20"></div>
      
      {/* Animated Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid-pattern animate-pulse"></div>
      </div>


      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-6 py-16">
          <div className="text-center">
            <div className="mb-12">
              <h1 className="text-5xl md:text-6xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400 mb-6 leading-tight">
                {session ? (
                  <>
                    Welcome to the Matrix
                    <br />
                    <span className="text-2xl text-green-400">Hello, {session.user?.name || 'Hacker'}</span>
                  </>
                ) : (
                  <>
                    Enter the Matrix
                    <br />
                    <span className="text-2xl text-cyan-400">Access Point Ready</span>
                  </>
                )}
              </h1>
              
              <div className="max-w-2xl mx-auto">
                <p className="text-lg text-green-300/80 font-mono leading-relaxed mb-8">
                  {session 
                    ? "Connection established. All systems operational. Welcome to the grid." 
                    : "Next.js 15 powered cyberpunk hacking simulator with advanced security protocols."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
          
        {/* Feature Cards */}
        {session && (
          <div className="container mx-auto px-6 py-8">
            <h2 className="text-2xl font-mono font-bold text-center text-green-400 mb-8">Available Systems</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                { href: '/puzzles', title: 'Hacking Challenges', desc: 'Solve cybersecurity puzzles', icon: '🧩', color: 'border-purple-400/30 hover:border-purple-400/60' },
                { href: '/duels', title: 'PvP Duels', desc: 'Challenge other hackers', icon: '⚔️', color: 'border-red-400/30 hover:border-red-400/60' },
                { href: '/inventory', title: 'Digital Arsenal', desc: 'Collect hacking tools', icon: '🛠️', color: 'border-blue-400/30 hover:border-blue-400/60' },
                { href: '/chat', title: 'Darknet Chat', desc: 'Communicate securely', icon: '💬', color: 'border-green-400/30 hover:border-green-400/60' },
                { href: '/achievements', title: 'Achievements', desc: 'Track your progress', icon: '🏆', color: 'border-yellow-400/30 hover:border-yellow-400/60' },
                { href: '/missions', title: 'Daily Missions', desc: 'Complete objectives', icon: '📋', color: 'border-orange-400/30 hover:border-orange-400/60' },
                { href: '/clans', title: 'Clans', desc: 'Join a team', icon: '👥', color: 'border-pink-400/30 hover:border-pink-400/60' },
                { href: '/leaderboard', title: 'Leaderboard', desc: 'See top hackers', icon: '📊', color: 'border-cyan-400/30 hover:border-cyan-400/60' },
              ].map((feature, index) => (
                <Link key={feature.href} href={feature.href} className={`
                  block bg-black/50 border ${feature.color} rounded-lg p-6 
                  hover:bg-black/70 transition-all duration-300 group backdrop-blur-sm
                  hover:scale-105 hover:shadow-lg hover:shadow-green-400/10
                `}>
                  <div className="text-3xl mb-3 text-center group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-mono font-bold text-green-400 mb-2 text-center group-hover:text-cyan-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-green-300/70 font-mono text-sm text-center leading-relaxed">
                    {feature.desc}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
          
        {/* Action Buttons */}
        {!session && (
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Link
                href="/register"
                className="bg-gradient-to-r from-green-400 to-cyan-400 text-black px-8 py-3 font-mono font-bold text-lg hover:from-cyan-400 hover:to-purple-400 transition-all hover:scale-105 shadow-lg hover:shadow-cyan-400/50 rounded-lg text-center"
              >
                Join the Matrix
              </Link>
              <Link
                href="/login"
                className="border-2 border-green-400 text-green-400 px-8 py-3 font-mono font-bold text-lg hover:bg-green-400 hover:text-black transition-all hover:scale-105 hover:shadow-lg hover:shadow-green-400/50 rounded-lg text-center"
              >
                Access Terminal
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
