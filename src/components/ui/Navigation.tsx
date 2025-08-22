'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useNavigationHistory } from '@/hooks/useNavigationHistory'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'

interface NavItem {
  href: string
  label: string
  icon: string
  color: string
}

const navItems: NavItem[] = [
  { href: '/puzzles', label: 'Puzzles', icon: '🧩', color: 'text-purple-400 hover:text-purple-300' },
  { href: '/missions', label: 'Missions', icon: '📋', color: 'text-orange-400 hover:text-orange-300' },
  { href: '/leaderboard', label: 'Ranks', icon: '📊', color: 'text-yellow-400 hover:text-yellow-300' },
  { href: '/achievements', label: 'Badges', icon: '🏆', color: 'text-purple-400 hover:text-purple-300' },
  { href: '/clans', label: 'Clans', icon: '👥', color: 'text-pink-400 hover:text-pink-300' },
  { href: '/chat', label: 'Chat', icon: '💬', color: 'text-green-400 hover:text-green-300' },
  { href: '/inventory', label: 'Inventory', icon: '🛠️', color: 'text-blue-400 hover:text-blue-300' },
  { href: '/duels', label: 'Duels', icon: '⚔️', color: 'text-red-400 hover:text-red-300' },
]


export function Navigation() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { 
    history, 
    canGoBack, 
    canGoForward, 
    goBack, 
    goForward, 
    getCurrentPageLabel 
  } = useNavigationHistory()
  
  // Enable keyboard navigation
  useKeyboardNavigation()

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Close mobile menu when clicking on a link
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }


  if (status === 'loading') {
    return (
      <nav className="relative z-50 border-b border-green-400/20 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-cyan-400 rounded animate-pulse"></div>
              <div className="h-6 bg-green-400/30 rounded w-32 animate-pulse"></div>
            </div>
            <div className="h-6 bg-green-400/30 rounded w-24 animate-pulse"></div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <>
      <nav className="relative z-50 border-b border-green-400/20 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-cyan-400 rounded group-hover:scale-110 transition-transform"></div>
                <h2 className="text-xl font-mono font-bold text-green-400 tracking-wide group-hover:text-cyan-400 transition-colors">
                  CYBER_PORTAL
                </h2>
              </Link>
            </div>

            {/* Navigation Controls (Back/Forward) */}
            {session && pathname !== '/' && (
              <div className="hidden sm:flex items-center space-x-2 ml-4">
                <button
                  onClick={goBack}
                  disabled={!canGoBack}
                  className="p-2 text-cyan-400 hover:text-green-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Go back"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goForward}
                  disabled={!canGoForward}
                  className="p-2 text-cyan-400 hover:text-green-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Go forward"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="hidden md:block text-sm text-green-300/70 font-mono ml-2">
                  {getCurrentPageLabel()}
                </div>
              </div>
            )}
            
            {/* Desktop Navigation */}
            {session && (
              <div className="hidden xl:flex items-center space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 font-mono text-sm transition-colors flex items-center space-x-2 rounded hover:bg-white/5 ${
                      pathname === item.href 
                        ? 'bg-green-400/20 text-green-300 border border-green-400/30' 
                        : item.color
                    }`}
                  >
                    <span className="text-xs">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Mobile Menu Button & User Actions */}
            <div className="flex items-center space-x-3">
              {/* Mobile/Tablet Menu Button */}
              {session && (
                <button
                  onClick={toggleMobileMenu}
                  className="xl:hidden p-2 text-green-400 hover:text-cyan-400 transition-colors focus:outline-none"
                  aria-label="Toggle menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              )}

              {/* User Actions */}
              {session ? (
                <div className="flex items-center space-x-3">
                  <div className="text-cyan-400 font-mono text-sm hidden sm:block">
                    {session.user?.name || session.user?.email}
                  </div>
                  <Link
                    href="/profile"
                    className="text-cyan-400 hover:text-green-400 transition-colors font-mono text-sm px-3 py-1 border border-cyan-400/30 hover:border-green-400/50 rounded"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="bg-red-600/80 hover:bg-red-600 text-white px-3 py-1 font-mono text-sm transition-all rounded"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="text-cyan-400 hover:text-green-400 transition-colors font-mono text-sm px-3 py-1 border border-cyan-400/30 hover:border-green-400/50 rounded"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-gradient-to-r from-green-400 to-cyan-400 text-black px-4 py-1 font-mono font-bold text-sm hover:from-cyan-400 hover:to-green-400 transition-all rounded"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile/Tablet Menu Overlay */}
      {session && isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 xl:hidden"
            onClick={closeMobileMenu}
          />
          
          {/* Mobile Menu */}
          <div className="fixed top-0 right-0 w-80 max-w-[85vw] h-full bg-black/95 border-l border-green-400/20 z-50 xl:hidden">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-green-400/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-mono text-green-400 font-bold">Navigation</h3>
                  <button
                    onClick={closeMobileMenu}
                    className="text-green-400 hover:text-cyan-400 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Navigation Controls in Mobile */}
                <div className="flex items-center space-x-4 mt-4">
                  <button
                    onClick={goBack}
                    disabled={!canGoBack}
                    className="flex items-center space-x-2 p-2 text-cyan-400 hover:text-green-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded border border-cyan-400/30"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-mono text-sm">Back</span>
                  </button>
                  <button
                    onClick={goForward}
                    disabled={!canGoForward}
                    className="flex items-center space-x-2 p-2 text-cyan-400 hover:text-green-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded border border-cyan-400/30"
                  >
                    <span className="font-mono text-sm">Forward</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto py-6">
                <div className="space-y-1 px-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={`flex items-center space-x-4 p-4 rounded-lg transition-all ${
                        pathname === item.href 
                          ? 'bg-green-400/20 text-green-300 border border-green-400/30' 
                          : 'text-green-300/80 hover:bg-white/5 hover:text-green-300'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <div className="flex-1">
                        <div className="font-mono font-medium">{item.label}</div>
                        <div className="text-xs text-green-300/60 font-mono">{item.href}</div>
                      </div>
                      {pathname === item.href && (
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* History Section */}
              {history.length > 0 && (
                <div className="border-t border-green-400/20 p-6">
                  <h4 className="text-sm font-mono text-green-400 mb-3">Recent Pages</h4>
                  <div className="space-y-1">
                    {history.slice(-3).reverse().map((entry, index) => (
                      <Link
                        key={entry.timestamp}
                        href={entry.path}
                        onClick={closeMobileMenu}
                        className="block w-full text-left p-2 text-xs font-mono text-green-300/60 hover:text-green-300 transition-colors rounded"
                      >
                        {entry.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}