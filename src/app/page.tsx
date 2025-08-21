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

      {/* Cyber Navbar */}
      <nav className="relative z-50 border-b border-green-400/30 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-cyan-400 rounded-sm animate-pulse"></div>
              <h2 className="text-2xl font-mono font-bold text-green-400 tracking-wider">
                {'>'} CYBER_PORTAL
              </h2>
            </div>
            <div className="flex items-center gap-4">
              {session ? (
                <div className="flex items-center space-x-4">
                  <div className="text-cyan-400 font-mono text-sm">
                    USER: <span className="text-green-400">{session.user?.name || session.user?.email}</span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="bg-gradient-to-r from-red-600 to-red-400 text-black px-4 py-2 font-mono font-bold tracking-wide hover:from-red-400 hover:to-red-600 transition-all transform hover:scale-105 border border-red-400/50"
                  >
                    [LOGOUT]
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="text-cyan-400 hover:text-green-400 transition-colors font-mono tracking-wide border border-cyan-400/50 px-3 py-1 hover:border-green-400/50"
                  >
                    [LOGIN]
                  </Link>
                  <Link
                    href="/register"
                    className="bg-gradient-to-r from-green-400 to-cyan-400 text-black px-4 py-2 font-mono font-bold tracking-wide hover:from-cyan-400 hover:to-green-400 transition-all transform hover:scale-105"
                  >
                    [REGISTER]
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center">
          {/* Glitchy Title */}
          <div className="mb-12">
            <h1 className="text-7xl md:text-8xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400 mb-6 leading-tight tracking-wider animate-pulse">
              {session ? (
                <>
                  {'>'} WELCOME_TO_THE_MATRIX
                  <br />
                  <span className="text-4xl text-green-400">USER: {session.user?.name || 'HACKER'}</span>
                </>
              ) : (
                <>
                  {'>'} ENTER_THE_MATRIX
                  <br />
                  <span className="text-4xl text-cyan-400">ACCESS_POINT_READY</span>
                </>
              )}
            </h1>
            
            <div className="max-w-3xl mx-auto">
              <p className="text-xl text-green-300 font-mono leading-relaxed mb-8">
                {session 
                  ? `${'>'}${'>'}${'>'} CONNECTION_ESTABLISHED ${'>'}${'>'}${'>'} ALL_SYSTEMS_OPERATIONAL ${'>'}${'>'}${'>'} WELCOME_TO_THE_GRID` 
                  : `${'>'}${'>'}${'>'} NEXT.JS_15.CYBER_FRAMEWORK ${'>'}${'>'}${'>'} TYPESCRIPT_SECURITY_PROTOCOLS ${'>'}${'>'}${'>'} AUTHENTICATION_MATRIX_ENABLED`
                }
              </p>
            </div>
          </div>
          
          {/* Status Panel */}
          {session && (
            <div className="bg-black/70 border border-green-400/50 rounded-none p-8 mb-16 max-w-md mx-auto backdrop-blur-sm">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-cyan-400 animate-pulse"></div>
              </div>
              <h3 className="text-xl font-mono font-bold text-green-400 mb-4">{'>>>'} ACCESS_GRANTED</h3>
              <div className="text-left font-mono text-sm space-y-2">
                <p className="text-cyan-400">EMAIL: <span className="text-green-400">{session.user?.email}</span></p>
                {session.user?.name && (
                  <p className="text-cyan-400">NAME: <span className="text-green-400">{session.user.name}</span></p>
                )}
                <p className="text-cyan-400">STATUS: <span className="text-green-400 animate-pulse">ONLINE</span></p>
              </div>
            </div>
          )}
          
          {/* Cyber Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            <div className="bg-black/70 border border-cyan-400/50 p-8 hover:border-green-400/70 transition-all group backdrop-blur-sm">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-green-400 mx-auto mb-6 animate-pulse group-hover:animate-spin transition-all"></div>
              <h3 className="text-xl font-mono font-bold text-cyan-400 mb-4 group-hover:text-green-400 transition-colors">
                {'>'} QUANTUM_SPEED
              </h3>
              <p className="text-green-300 font-mono text-sm leading-relaxed">
                TURBOPACK_ENGINE.COMPILE() → BLAZING_FAST_PERFORMANCE → NEXT.JS_15.OPTIMIZED
              </p>
            </div>
            
            <div className="bg-black/70 border border-purple-400/50 p-8 hover:border-cyan-400/70 transition-all group backdrop-blur-sm">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-cyan-400 mx-auto mb-6 animate-pulse group-hover:animate-bounce transition-all"></div>
              <h3 className="text-xl font-mono font-bold text-purple-400 mb-4 group-hover:text-cyan-400 transition-colors">
                {'>'} SECURITY_MATRIX
              </h3>
              <p className="text-green-300 font-mono text-sm leading-relaxed">
                NEXTAUTH.ENCRYPT() → OAUTH2.GOOGLE_PROTOCOL → DATABASE.SECURE_STORAGE
              </p>
            </div>
            
            <div className="bg-black/70 border border-green-400/50 p-8 hover:border-purple-400/70 transition-all group backdrop-blur-sm">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-purple-400 mx-auto mb-6 animate-pulse group-hover:animate-ping transition-all"></div>
              <h3 className="text-xl font-mono font-bold text-green-400 mb-4 group-hover:text-purple-400 transition-colors">
                {'>'} NEURAL_INTERFACE
              </h3>
              <p className="text-green-300 font-mono text-sm leading-relaxed">
                TAILWIND.RESPONSIVE() → ADAPTIVE_UI_MATRIX → CROSS_PLATFORM.COMPATIBLE
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          {!session && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/register"
                className="bg-gradient-to-r from-green-400 to-cyan-400 text-black px-10 py-4 font-mono font-bold text-lg tracking-wider hover:from-cyan-400 hover:to-purple-400 transition-all transform hover:scale-110 shadow-lg hover:shadow-cyan-400/50"
              >
                {'>'} JACK_IN
              </Link>
              <Link
                href="/login"
                className="border-2 border-green-400 text-green-400 px-10 py-4 font-mono font-bold text-lg tracking-wider hover:bg-green-400 hover:text-black transition-all transform hover:scale-110 hover:shadow-lg hover:shadow-green-400/50"
              >
                {'>'} ACCESS_TERMINAL
              </Link>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .grid-pattern {
          background-image: 
            linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}
