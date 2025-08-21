'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('INVALID_CREDENTIALS >> ACCESS_DENIED')
      } else {
        router.push('/')
      }
    } catch (error) {
      setError('SYSTEM_ERROR >> CONNECTION_FAILED')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Matrix Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/30 to-green-900/20"></div>
      
      {/* Animated Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid-pattern animate-pulse"></div>
      </div>

      <div className="max-w-md w-full mx-4 relative z-10">
        <div className="bg-black/80 border border-green-400/50 p-8 backdrop-blur-sm shadow-2xl shadow-green-400/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-cyan-400 mx-auto mb-6 animate-pulse"></div>
            <h1 className="text-4xl font-mono font-bold text-green-400 mb-3 tracking-wider">
              {'>'} ACCESS_TERMINAL
            </h1>
            <p className="text-cyan-400 font-mono text-sm tracking-wide">
              ENTER_CREDENTIALS_TO_PROCEED
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/50 border border-red-400/50 text-red-400 px-4 py-3 mb-6 font-mono text-sm">
              {'>>>'} ERROR: {error}
            </div>
          )}

          {/* Google Auth Button */}
          <div className="space-y-4 mb-8">
            <button
              onClick={() => signIn('google')}
              className="w-full bg-black border border-cyan-400/50 text-cyan-400 py-3 font-mono font-bold tracking-wide hover:border-green-400/70 hover:text-green-400 transition-all flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-cyan-400/20"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {'['} GOOGLE_AUTH_PROTOCOL {']'}
            </button>
            
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-green-400/30" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-black text-green-400 font-mono">OR_USE_MANUAL_INPUT</span>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-mono text-cyan-400 mb-2 tracking-wide">
                {'>'} EMAIL_ADDRESS:
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black border border-green-400/50 text-green-400 font-mono focus:border-cyan-400 focus:outline-none transition-all placeholder-green-600/50"
                placeholder="user@matrix.net"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-mono text-cyan-400 mb-2 tracking-wide">
                {'>'} PASSWORD_KEY:
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black border border-green-400/50 text-green-400 font-mono focus:border-cyan-400 focus:outline-none transition-all placeholder-green-600/50"
                placeholder="●●●●●●●●●●"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-400 to-cyan-400 text-black py-3 font-mono font-bold text-lg tracking-wider hover:from-cyan-400 hover:to-purple-400 transition-all transform hover:scale-105 shadow-lg hover:shadow-green-400/50 disabled:opacity-50 disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full mr-2"></div>
                  ESTABLISHING_CONNECTION...
                </span>
              ) : (
                '[ INITIATE_LOGIN_SEQUENCE ]'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="text-green-400 font-mono text-sm">
              NO_ACCOUNT_DETECTED?{' '}
              <Link 
                href="/register" 
                className="text-cyan-400 hover:text-purple-400 font-bold tracking-wide transition-colors border-b border-cyan-400/50 hover:border-purple-400/50"
              >
                {'['} CREATE_NEW_USER {']'}
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Main */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-green-400 hover:text-cyan-400 font-mono text-sm tracking-wide transition-colors"
          >
            {'<'} RETURN_TO_MAIN_TERMINAL
          </Link>
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
  )
}