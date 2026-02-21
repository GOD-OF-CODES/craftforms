'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Input from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const oauthErrors: Record<string, string> = {
  OAuthAccountNotLinked: 'This email is already associated with another sign-in method. Please use your original sign-in method.',
  OAuthCallback: 'Something went wrong during sign-in. Please try again.',
  OAuthCreateAccount: 'Could not create your account. Please try again.',
  Callback: 'Something went wrong during sign-in. Please try again.',
  AccessDenied: 'Access was denied. Please try again.',
  Configuration: 'There is a server configuration issue. Please contact support.',
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  )
}

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      const message = oauthErrors[errorParam] || 'An error occurred during sign-in. Please try again.'
      setError(message)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
        addToast({
          title: 'Login Failed',
          description: 'Invalid email or password',
          variant: 'error',
        })
      } else {
        addToast({
          title: 'Login Successful',
          description: 'Welcome back!',
          variant: 'success',
        })
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      setError('An error occurred during login')
      addToast({
        description: 'An error occurred during login',
        variant: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setIsDemoLoading(true)
    setError('')
    try {
      const demoRes = await fetch('/api/auth/demo-login', { method: 'POST' })
      if (!demoRes.ok) {
        throw new Error('Failed to create demo account')
      }
      const { email: demoEmail, password: demoPassword } = await demoRes.json()

      const result = await signIn('credentials', {
        email: demoEmail,
        password: demoPassword,
        redirect: false,
      })

      if (result?.error) {
        setError('Demo login failed. Please try again.')
      } else {
        addToast({
          title: 'Welcome to the Demo!',
          description: 'Explore the form builder with sample data.',
          variant: 'success',
        })
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('Failed to start demo. Please try again.')
    } finally {
      setIsDemoLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl: '/dashboard' })
    } catch (error) {
      addToast({
        description: `Failed to sign in with ${provider}`,
        variant: 'error',
      })
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="w-full max-w-md"
    >
      {/* Heading */}
      <motion.div variants={fadeUp} className="text-center mb-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
          className="inline-flex items-center gap-2 mb-4"
        >
          <span
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1.5 rounded-full"
            style={{
              border: '2px solid #000',
              boxShadow: '2px 2px 0 0 rgba(0,0,0,0.85)',
            }}
          >
            WELCOME BACK
          </span>
        </motion.div>
        <h1
          className="text-3xl sm:text-4xl font-extrabold text-white mb-2"
          style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)' }}
        >
          Sign in to play
        </h1>
        <p className="text-white/80 font-medium">
          Continue building amazing forms
        </p>
      </motion.div>

      {/* Game-styled form card */}
      <motion.div
        variants={fadeUp}
        className="bg-white rounded-2xl overflow-hidden"
        style={{
          border: '3px solid #000',
          boxShadow: '8px 8px 0 0 rgba(0,0,0,0.85)',
        }}
      >
        {/* Colored header strip */}
        <div
          className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 px-6 py-3 flex items-center justify-between"
          style={{ borderBottom: '3px solid #000' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🔑</span>
            <span className="text-white font-bold text-sm">LOGIN</span>
          </div>
          <div
            className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 text-xs font-bold text-white"
            style={{ border: '1.5px solid rgba(255,255,255,0.3)' }}
          >
            🎮 Let&apos;s Go!
          </div>
        </div>

        {/* Form content */}
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium"
                style={{ border: '2px solid #FCA5A5' }}
              >
                {error}
              </motion.div>
            )}

            <motion.div variants={fadeUp}>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <div className="mt-2 text-right">
                <Link
                  href="/reset-password"
                  className="text-sm text-purple-500 hover:text-purple-600 font-medium hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-xl text-base transition-all hover:shadow-lg active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  border: '2.5px solid #000',
                  boxShadow: '4px 4px 0 0 rgba(0,0,0,0.85)',
                }}
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In →'
                )}
              </button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div variants={fadeUp} className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full" style={{ borderTop: '2px dashed #E5E7EB' }} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-400 font-semibold">or continue with</span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2.5 px-4 rounded-xl transition-all hover:shadow-md active:translate-y-0.5 disabled:opacity-50"
                style={{
                  border: '2.5px solid #000',
                  boxShadow: '3px 3px 0 0 rgba(0,0,0,0.85)',
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>

              <button
                type="button"
                onClick={() => handleOAuthSignIn('github')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2.5 px-4 rounded-xl transition-all hover:shadow-md active:translate-y-0.5 disabled:opacity-50"
                style={{
                  border: '2.5px solid #000',
                  boxShadow: '3px 3px 0 0 rgba(0,0,0,0.85)',
                }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                GitHub
              </button>
            </div>
          </motion.div>

          {/* Sign up link */}
          <motion.p variants={fadeUp} className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-purple-500 hover:text-purple-600 font-bold hover:underline">
              Sign up
            </Link>
          </motion.p>

          {/* Demo Login */}
          <motion.div variants={fadeUp} className="mt-5 pt-5" style={{ borderTop: '2px dashed #E5E7EB' }}>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading || isDemoLoading}
              className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all hover:shadow-lg active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                border: '2.5px solid #000',
                boxShadow: '3px 3px 0 0 rgba(0,0,0,0.85)',
              }}
            >
              {isDemoLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading demo...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  ▶ Try Demo Account
                </span>
              )}
            </button>
            <p className="mt-2 text-center text-xs text-gray-400 font-medium">
              Explore with sample forms and responses
            </p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
