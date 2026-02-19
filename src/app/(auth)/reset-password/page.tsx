'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Input from '@/components/ui/input'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { useToast } from '@/components/ui/toast'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

function RequestResetForm() {
  const { addToast } = useToast()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }

      setIsSubmitted(true)
      addToast({
        title: 'Reset Link Sent',
        description: 'Check your email for password reset instructions',
        variant: 'success',
      })
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="w-full max-w-md"
      >
        <motion.div
          variants={fadeUp}
          className="bg-white rounded-2xl overflow-hidden"
          style={{
            border: '3px solid #000',
            boxShadow: '8px 8px 0 0 rgba(0,0,0,0.85)',
          }}
        >
          <div
            className="bg-gradient-to-r from-green-400 to-emerald-500 px-6 py-3 flex items-center justify-center"
            style={{ borderBottom: '3px solid #000' }}
          >
            <span className="text-white font-bold text-sm">EMAIL SENT</span>
          </div>
          <div className="p-8 text-center">
            <div
              className="mx-auto w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 text-2xl"
              style={{
                border: '2.5px solid #000',
                boxShadow: '3px 3px 0 0 rgba(0,0,0,0.85)',
              }}
            >
              ✅
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Check your email</h2>
            <p className="text-gray-600 mb-2">
              We&apos;ve sent a password reset link to
            </p>
            <p className="font-bold text-gray-900 mb-6">{email}</p>
            <p className="text-sm text-gray-400 mb-6">
              Didn&apos;t receive the email? Check your spam folder or try again.
            </p>
            <Link href="/login">
              <button
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-xl text-base transition-all hover:shadow-lg active:translate-y-0.5"
                style={{
                  border: '2.5px solid #000',
                  boxShadow: '4px 4px 0 0 rgba(0,0,0,0.85)',
                }}
              >
                Back to login
              </button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    )
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
            className="bg-gradient-to-r from-orange-400 to-amber-500 text-white text-xs font-bold px-4 py-1.5 rounded-full"
            style={{
              border: '2px solid #000',
              boxShadow: '2px 2px 0 0 rgba(0,0,0,0.85)',
            }}
          >
            PASSWORD RESET
          </span>
        </motion.div>
        <h1
          className="text-3xl sm:text-4xl font-extrabold text-white mb-2"
          style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}
        >
          Reset your password
        </h1>
        <p className="text-white/80 font-medium">
          Enter your email and we&apos;ll send you a reset link
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
        <div
          className="bg-gradient-to-r from-orange-400 to-amber-500 px-6 py-3 flex items-center justify-between"
          style={{ borderBottom: '3px solid #000' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🔐</span>
            <span className="text-white font-bold text-sm">RESET</span>
          </div>
          <div
            className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 text-xs font-bold text-white"
            style={{ border: '1.5px solid rgba(255,255,255,0.3)' }}
          >
            🛡️ Secure
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
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
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-400 to-amber-500 text-white font-bold py-3 px-6 rounded-xl text-base transition-all hover:shadow-lg active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link →'
                )}
              </button>
            </motion.div>
          </form>

          <motion.div variants={fadeUp} className="mt-6 text-center">
            <Link href="/login" className="text-sm text-purple-500 hover:text-purple-600 font-medium hover:underline">
              Back to login
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function SetNewPasswordForm({ token }: { token: string }) {
  const { addToast } = useToast()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      setIsSuccess(true)
      addToast({
        title: 'Password Reset',
        description: 'Your password has been updated successfully',
        variant: 'success',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      addToast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Something went wrong',
        variant: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="w-full max-w-md"
      >
        <motion.div
          variants={fadeUp}
          className="bg-white rounded-2xl overflow-hidden"
          style={{
            border: '3px solid #000',
            boxShadow: '8px 8px 0 0 rgba(0,0,0,0.85)',
          }}
        >
          <div
            className="bg-gradient-to-r from-green-400 to-emerald-500 px-6 py-3 flex items-center justify-center"
            style={{ borderBottom: '3px solid #000' }}
          >
            <span className="text-white font-bold text-sm">SUCCESS</span>
          </div>
          <div className="p-8 text-center">
            <div
              className="mx-auto w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 text-2xl"
              style={{
                border: '2.5px solid #000',
                boxShadow: '3px 3px 0 0 rgba(0,0,0,0.85)',
              }}
            >
              🎉
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Password updated!</h2>
            <p className="text-gray-600 mb-8">
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <Link href="/login">
              <button
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-xl text-base transition-all hover:shadow-lg active:translate-y-0.5"
                style={{
                  border: '2.5px solid #000',
                  boxShadow: '4px 4px 0 0 rgba(0,0,0,0.85)',
                }}
              >
                Continue to Login →
              </button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    )
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
            className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-full"
            style={{
              border: '2px solid #000',
              boxShadow: '2px 2px 0 0 rgba(0,0,0,0.85)',
            }}
          >
            NEW PASSWORD
          </span>
        </motion.div>
        <h1
          className="text-3xl sm:text-4xl font-extrabold text-white mb-2"
          style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}
        >
          Set new password
        </h1>
        <p className="text-white/80 font-medium">
          Enter your new password below
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
        <div
          className="bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 flex items-center justify-between"
          style={{ borderBottom: '3px solid #000' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🔑</span>
            <span className="text-white font-bold text-sm">NEW PASSWORD</span>
          </div>
          <div
            className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 text-xs font-bold text-white"
            style={{ border: '1.5px solid rgba(255,255,255,0.3)' }}
          >
            🛡️ Secure
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div variants={fadeUp}>
              <Input
                label="New password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                autoComplete="new-password"
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <Input
                label="Confirm password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
                autoComplete="new-password"
                error={error}
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-3 px-6 rounded-xl text-base transition-all hover:shadow-lg active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    Resetting...
                  </span>
                ) : (
                  'Reset Password →'
                )}
              </button>
            </motion.div>
          </form>

          <motion.div variants={fadeUp} className="mt-6 text-center">
            <Link href="/login" className="text-sm text-purple-500 hover:text-purple-600 font-medium hover:underline">
              Back to login
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  return token ? <SetNewPasswordForm token={token} /> : <RequestResetForm />
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-white/70 font-medium">Loading...</p>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
