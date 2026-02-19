'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import LoadingSpinner from '@/components/ui/loading-spinner'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link')
      return
    }

    // TODO: Implement email verification (requires US-004: Email Service)
    // For now, simulate verification
    setTimeout(() => {
      setStatus('success')
      setMessage('Your email has been verified successfully!')
    }, 1500)
  }, [token])

  if (status === 'loading') {
    return (
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-white/70 font-medium">Verifying your email...</p>
      </div>
    )
  }

  if (status === 'error') {
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
            className="bg-gradient-to-r from-red-400 to-rose-500 px-6 py-3 flex items-center justify-center"
            style={{ borderBottom: '3px solid #000' }}
          >
            <span className="text-white font-bold text-sm">VERIFICATION FAILED</span>
          </div>
          <div className="p-8 text-center">
            <div
              className="mx-auto w-16 h-16 bg-gradient-to-br from-red-400 to-rose-500 rounded-2xl flex items-center justify-center mb-4 text-2xl"
              style={{
                border: '2.5px solid #000',
                boxShadow: '3px 3px 0 0 rgba(0,0,0,0.85)',
              }}
            >
              ❌
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Verification failed</h2>
            <p className="text-gray-600 mb-8">{message}</p>
            <Link href="/login">
              <button
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-xl text-base transition-all hover:shadow-lg active:translate-y-0.5"
                style={{
                  border: '2.5px solid #000',
                  boxShadow: '4px 4px 0 0 rgba(0,0,0,0.85)',
                }}
              >
                Back to Login
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
          <span className="text-white font-bold text-sm">VERIFIED</span>
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
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Email verified!</h2>
          <p className="text-gray-600 mb-8">{message}</p>
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

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-white/70 font-medium">Loading...</p>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
