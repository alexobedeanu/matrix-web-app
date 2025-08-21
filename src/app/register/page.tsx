'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('PASSWORD_MISMATCH >> SECURITY_VIOLATION')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('WEAK_PASSWORD >> MINIMUM_6_CHARS_REQUIRED')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('USER_CREATED >> REDIRECTING_TO_ACCESS_TERMINAL')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setError(data.error || 'REGISTRATION_FAILED >> SYSTEM_ERROR')
      }
    } catch (error) {
      setError('CONNECTION_ERROR >> UNABLE_TO_REACH_SERVER')
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
        <div className="bg-black/80 border border-purple-400/50 p-8 backdrop-blur-sm shadow-2xl shadow-purple-400/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-green-400 mx-auto mb-6 animate-pulse"></div>
            <h1 className="text-4xl font-mono font-bold text-purple-400 mb-3 tracking-wider">
              {'>'} USER_REGISTRATION
            </h1>
            <p className="text-cyan-400 font-mono text-sm tracking-wide">
              INITIALIZE_NEW_ACCOUNT_MATRIX
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/50 border border-red-400/50 text-red-400 px-4 py-3 mb-6 font-mono text-sm">
              {'>>>'} ERROR: {error}
            </div>
          )}

          {/* Success Display */}
          {success && (
            <div className="bg-green-900/50 border border-green-400/50 text-green-400 px-4 py-3 mb-6 font-mono text-sm animate-pulse">
              {'>>>'} SUCCESS: {success}
            </div>
          )}

          {/* Google Auth Button */}
          <div className="space-y-4 mb-8">
            <button
              onClick={() => signIn('google')}
              className="w-full bg-black border border-purple-400/50 text-purple-400 py-3 font-mono font-bold tracking-wide hover:border-cyan-400/70 hover:text-cyan-400 transition-all flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-purple-400/20"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {'['} INSTANT_GOOGLE_REGISTRATION {']'}
            </button>
            
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-purple-400/30" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-black text-purple-400 font-mono">OR_MANUAL_CONFIGURATION</span>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-mono text-cyan-400 mb-2 tracking-wide">
                {'>'} USERNAME (OPTIONAL):
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-purple-400/50 text-purple-400 font-mono focus:border-green-400 focus:outline-none transition-all placeholder-purple-600/50"
                placeholder="hacker_name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-mono text-cyan-400 mb-2 tracking-wide">
                {'>'} EMAIL_PROTOCOL:
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black border border-purple-400/50 text-purple-400 font-mono focus:border-green-400 focus:outline-none transition-all placeholder-purple-600/50"
                placeholder="user@cybernet.io"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-mono text-cyan-400 mb-2 tracking-wide">
                {'>'} ENCRYPTION_KEY:
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black border border-purple-400/50 text-purple-400 font-mono focus:border-green-400 focus:outline-none transition-all placeholder-purple-600/50"
                placeholder="min_6_chars_security"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-mono text-cyan-400 mb-2 tracking-wide">
                {'>'} VERIFY_ENCRYPTION:
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black border border-purple-400/50 text-purple-400 font-mono focus:border-green-400 focus:outline-none transition-all placeholder-purple-600/50"
                placeholder="repeat_security_key"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-400 to-cyan-400 text-black py-3 font-mono font-bold text-lg tracking-wider hover:from-green-400 hover:to-purple-400 transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-400/50 disabled:opacity-50 disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full mr-2"></div>
                  CREATING_USER_MATRIX...
                </span>
              ) : (
                '[ EXECUTE_REGISTRATION_PROTOCOL ]'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="text-purple-400 font-mono text-sm">
              ACCOUNT_EXISTS?{' '}
              <Link 
                href="/login" 
                className="text-cyan-400 hover:text-green-400 font-bold tracking-wide transition-colors border-b border-cyan-400/50 hover:border-green-400/50"
              >
                {'['} ACCESS_EXISTING_TERMINAL {']'}
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Main */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-purple-400 hover:text-cyan-400 font-mono text-sm tracking-wide transition-colors"
          >
            {'<'} RETURN_TO_MAIN_MATRIX
          </Link>
        </div>
      </div>

      <style jsx>{`
        .grid-pattern {
          background-image: 
            linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  )
}