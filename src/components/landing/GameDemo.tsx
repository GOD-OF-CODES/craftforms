'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// ─── SVG Icons ──────────────────────────────────────────────────

function HeartIcon({ filled = true, className = 'w-5 h-5' }: { filled?: boolean; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? 'url(#heartGrad)' : 'none'} stroke={filled ? 'none' : '#cbd5e1'} strokeWidth={2}>
      <defs>
        <linearGradient id="heartGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )
}

function StarIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="url(#starGrad)">
      <defs>
        <linearGradient id="starGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function BoltIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="url(#boltGrad)">
      <defs>
        <linearGradient id="boltGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}

function TrophyIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="trophyGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <path d="M8 21h8m-4-4v4m-4.5-8a7.5 7.5 0 0 0 9 0M5 3h14" stroke="url(#trophyGrad)" strokeWidth={2} strokeLinecap="round" />
      <path d="M5 3a2 2 0 0 0-2 2v1a5 5 0 0 0 4 4.9M19 3a2 2 0 0 1 2 2v1a5 5 0 0 1-4 4.9" stroke="url(#trophyGrad)" strokeWidth={2} strokeLinecap="round" />
      <path d="M5 3h14v4a7 7 0 0 1-14 0V3z" fill="url(#trophyGrad)" opacity={0.2} stroke="url(#trophyGrad)" strokeWidth={2} />
    </svg>
  )
}

function CheckIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function ThumbUpIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
    </svg>
  )
}

function ThumbDownIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10zM17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17" />
    </svg>
  )
}

// ─── Types ───────────────────────────────────────────────────────

interface DemoQuestion {
  id: string
  level: number
  title: string
  subtitle: string
  type: 'text' | 'multiple_choice' | 'rating' | 'yes_no'
  placeholder?: string
  options?: string[]
  ratingMax?: number
  points: number
}

interface PointPopup {
  id: number
  amount: number
  x: number
  y: number
}

// ─── Demo Data ───────────────────────────────────────────────────

const questions: DemoQuestion[] = [
  {
    id: 'name',
    level: 1,
    title: "What's your name?",
    subtitle: "We'd love to know who we're talking to!",
    type: 'text',
    placeholder: 'Type your name...',
    points: 100,
  },
  {
    id: 'purpose',
    level: 2,
    title: 'What brings you here?',
    subtitle: 'Pick the option that fits you best!',
    type: 'multiple_choice',
    options: ['Building a product', 'Collecting feedback', 'Running surveys', 'Just exploring'],
    points: 150,
  },
  {
    id: 'design',
    level: 3,
    title: 'How important is design to you?',
    subtitle: 'Rate from 1 to 5 stars!',
    type: 'rating',
    ratingMax: 5,
    points: 200,
  },
  {
    id: 'gamified',
    level: 4,
    title: 'Would you use gamified forms?',
    subtitle: 'Be honest, we can handle it!',
    type: 'yes_no',
    points: 250,
  },
  {
    id: 'feedback',
    level: 5,
    title: 'Any feedback for us?',
    subtitle: 'Last question -- you got this!',
    type: 'text',
    placeholder: 'Share your thoughts...',
    points: 300,
  },
]

const TOTAL_HEARTS = 5

// ─── Animated Dot Grid ──────────────────────────────────────────

function AnimatedDotGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Base dot grid via radial-gradient */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Pulsing ring 1 */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: '50%',
          top: '50%',
          width: 400,
          height: 400,
          marginLeft: -200,
          marginTop: -200,
          border: '1px solid rgba(168,85,247,0.15)',
        }}
        animate={{ scale: [0.2, 3], opacity: [0.4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeOut' }}
      />
      {/* Pulsing ring 2 (offset) */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: '50%',
          top: '50%',
          width: 400,
          height: 400,
          marginLeft: -200,
          marginTop: -200,
          border: '1px solid rgba(236,72,153,0.12)',
        }}
        animate={{ scale: [0.2, 3], opacity: [0.3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeOut', delay: 2 }}
      />
      {/* Pulsing ring 3 */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: '50%',
          top: '50%',
          width: 300,
          height: 300,
          marginLeft: -150,
          marginTop: -150,
          border: '1px solid rgba(56,189,248,0.10)',
        }}
        animate={{ scale: [0.3, 2.5], opacity: [0.3, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeOut', delay: 1 }}
      />
    </div>
  )
}

// ─── Particle Burst on Score ────────────────────────────────────

const BURST_COLORS = ['#A855F7', '#EC4899', '#F59E0B', '#38BDF8', '#4ADE80', '#FB923C', '#F43F5E', '#8B5CF6']

function ScoreBurst({ trigger }: { trigger: number }) {
  if (trigger === 0) return null
  return (
    <AnimatePresence>
      <motion.div
        key={trigger}
        className="absolute inset-0 pointer-events-none z-20"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        {Array.from({ length: 10 }).map((_, i) => {
          const angle = (i / 10) * Math.PI * 2
          const dist = 80 + (i % 3) * 30
          return (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 rounded-full"
              style={{ width: 6 + (i % 3) * 2, height: 6 + (i % 3) * 2, backgroundColor: BURST_COLORS[i % BURST_COLORS.length] }}
              initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              animate={{
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist,
                scale: 0,
                opacity: 0,
              }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          )
        })}
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Component ───────────────────────────────────────────────────

export default function GameDemo({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Record<string, any>>({})
  const [score, setScore] = useState(0)
  const [hearts] = useState(TOTAL_HEARTS)
  const [combo, setCombo] = useState(0)
  const [showComplete, setShowComplete] = useState(false)
  const [pointPopups, setPointPopups] = useState<PointPopup[]>([])
  const [shakeOk, setShakeOk] = useState(false)
  const [burstTrigger, setBurstTrigger] = useState(0)
  const [showLevelUp, setShowLevelUp] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const question = questions[step]
  const totalQuestions = questions.length
  const currentValue = values[question?.id ?? '']

  const addPointPopup = useCallback((amount: number) => {
    const id = Date.now()
    const x = 35 + Math.random() * 30
    const y = 30 + Math.random() * 15
    setPointPopups((prev) => [...prev, { id, amount, x, y }])
    setTimeout(() => setPointPopups((prev) => prev.filter((p) => p.id !== id)), 1200)
  }, [])

  const handleNext = useCallback(() => {
    if (!question) return

    const val = values[question.id]
    if (!val && val !== false && val !== 0) {
      setShakeOk(true)
      setTimeout(() => setShakeOk(false), 500)
      return
    }

    const comboMultiplier = 1 + combo * 0.25
    const earnedPoints = Math.round(question.points * comboMultiplier)
    setScore((prev) => prev + earnedPoints)
    setCombo((prev) => prev + 1)
    addPointPopup(earnedPoints)
    setBurstTrigger((prev) => prev + 1)

    if (step < totalQuestions - 1) {
      setShowLevelUp(true)
      setTimeout(() => setShowLevelUp(false), 800)
      setTimeout(() => setStep((prev) => prev + 1), 300)
    } else {
      setShowComplete(true)
    }
  }, [question, values, step, totalQuestions, combo, addPointPopup])

  const handleChange = useCallback(
    (value: any) => {
      if (!question) return
      setValues((prev) => ({ ...prev, [question.id]: value }))
    },
    [question]
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !showComplete) handleNext()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleNext, showComplete, onClose])

  // ─── Render Field ─────────────────────────────────────────────

  const renderField = () => {
    if (!question) return null

    switch (question.type) {
      case 'text':
        return (
          <input
            autoFocus
            type="text"
            value={currentValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={question.placeholder}
            className="w-full px-4 py-3 text-base rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-shadow"
            style={{ border: '2px solid #e5e7eb' }}
          />
        )

      case 'multiple_choice':
        return (
          <div className="space-y-2.5">
            {question.options?.map((option, idx) => {
              const isSelected = currentValue === option
              const letters = ['A', 'B', 'C', 'D']
              return (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleChange(option)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold text-sm transition-all ${
                    isSelected ? 'bg-purple-500 text-white' : 'bg-white text-gray-800 hover:bg-purple-50'
                  }`}
                  style={{
                    border: isSelected ? '2.5px solid #7c3aed' : '2px solid #e5e7eb',
                    boxShadow: isSelected ? '0 4px 12px rgba(168,85,247,0.3)' : 'none',
                  }}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {letters[idx]}
                  </span>
                  {option}
                </motion.button>
              )
            })}
          </div>
        )

      case 'rating':
        const max = question.ratingMax || 5
        return (
          <div className="flex gap-2 justify-center py-2">
            {Array.from({ length: max }).map((_, idx) => {
              const isFilled = (currentValue || 0) > idx
              return (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleChange(idx + 1)}
                  className="transition-all"
                >
                  <svg className="w-10 h-10 sm:w-12 sm:h-12" viewBox="0 0 24 24" fill={isFilled ? 'url(#ratingStarGrad)' : 'none'} stroke={isFilled ? 'none' : '#d1d5db'} strokeWidth={1.5}>
                    <defs>
                      <linearGradient id="ratingStarGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#facc15" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </motion.button>
              )
            })}
          </div>
        )

      case 'yes_no':
        return (
          <div className="flex gap-4">
            {[
              { label: 'Yes!', value: true, gradient: 'from-green-500 to-emerald-400', Icon: ThumbUpIcon },
              { label: 'Nope', value: false, gradient: 'from-red-400 to-rose-500', Icon: ThumbDownIcon },
            ].map((opt) => {
              const isSelected = currentValue === opt.value
              return (
                <motion.button
                  key={String(opt.value)}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChange(opt.value)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r ${opt.gradient} transition-all`}
                  style={{
                    boxShadow: isSelected ? '0 4px 16px rgba(0,0,0,0.2)' : 'none',
                    opacity: isSelected || currentValue === undefined ? 1 : 0.45,
                    border: isSelected ? '2.5px solid rgba(0,0,0,0.15)' : '2.5px solid transparent',
                  }}
                >
                  <opt.Icon className="w-5 h-5" />
                  {opt.label}
                </motion.button>
              )
            })}
          </div>
        )

      default:
        return null
    }
  }

  // ─── Shared Background ────────────────────────────────────────

  const GameBackground = (
    <>
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#312e81]" />

      {/* Animated dot grid + pulse rings */}
      <AnimatedDotGrid />

      {/* Subtle top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-30"
        style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.3) 0%, transparent 70%)' }}
      />
    </>
  )

  // ─── Completion Screen ────────────────────────────────────────

  if (showComplete) {
    return (
      <div className="fixed inset-0 z-[100]">
        {GameBackground}

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-full max-w-md"
          >
            {/* Trophy */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
              className="flex justify-center mb-5"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-amber-500/20 backdrop-blur-sm flex items-center justify-center" style={{ border: '2px solid rgba(250,204,21,0.3)' }}>
                <TrophyIcon className="w-12 h-12" />
              </div>
            </motion.div>

            {/* Card */}
            <div
              className="bg-white/[0.07] backdrop-blur-xl rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.12)' }}
            >
              {/* Header */}
              <div
                className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 px-6 py-5 text-center"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
              >
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Quest Complete!
                </h2>
                <p className="text-white/60 mt-1 font-medium">You crushed it!</p>
              </div>

              {/* Score summary */}
              <div className="p-6 space-y-5">
                <div className="flex justify-center gap-4 text-center">
                  <div className="flex-1 bg-white/[0.06] rounded-xl p-4" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <StarIcon className="w-6 h-6" />
                      <span className="text-2xl font-extrabold text-white">{score.toLocaleString()}</span>
                    </div>
                    <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Total Score</span>
                  </div>
                  <div className="flex-1 bg-white/[0.06] rounded-xl p-4" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <BoltIcon className="w-6 h-6" />
                      <span className="text-2xl font-extrabold text-white">{combo}x</span>
                    </div>
                    <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Max Combo</span>
                  </div>
                </div>

                <p className="text-center text-white/50 text-sm">
                  Imagine your forms being <span className="font-bold text-purple-400">this fun</span> for your users.
                </p>

                <div className="flex flex-col gap-2.5">
                  <Link
                    href="/signup"
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-all hover:shadow-lg hover:shadow-purple-500/25"
                    onClick={onClose}
                  >
                    Start Building Free
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </Link>
                  <button
                    onClick={onClose}
                    className="w-full text-sm font-semibold text-white/40 hover:text-white/70 py-2 transition-colors"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // ─── Main Full-Screen Demo ────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[100]">
      {GameBackground}

      {/* Level-up flash */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-30 pointer-events-none bg-white/10"
          />
        )}
      </AnimatePresence>

      {/* Content layer */}
      <div className="relative z-10 flex flex-col h-full">
        {/* ── Top HUD Bar ── */}
        <div className="px-4 pt-4 pb-2">
          <div
            className="max-w-lg mx-auto bg-white/[0.07] backdrop-blur-xl rounded-2xl px-4 sm:px-5 py-3 flex items-center justify-between"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {/* Hearts */}
            <div className="flex gap-1">
              {Array.from({ length: TOTAL_HEARTS }).map((_, i) => (
                <HeartIcon key={i} filled={i < hearts} className="w-5 h-5 sm:w-6 sm:h-6" />
              ))}
            </div>

            {/* Combo badge */}
            <AnimatePresence>
              {combo > 1 && (
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full"
                >
                  <BoltIcon className="w-3.5 h-3.5" />
                  {combo}x COMBO
                </motion.div>
              )}
            </AnimatePresence>

            {/* Score */}
            <motion.div
              key={score}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5"
            >
              <StarIcon className="w-4 h-4" />
              <span className="text-sm font-bold text-white">{score.toLocaleString()}</span>
            </motion.div>
          </div>
        </div>

        {/* ── Close button ── */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 w-9 h-9 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* ── Main Card ── */}
        <div className="flex-1 flex items-center justify-center px-4 relative">
          {/* Point popups */}
          <AnimatePresence>
            {pointPopups.map((popup) => (
              <motion.div
                key={popup.id}
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{ opacity: 0, y: -80, scale: 1.3 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="absolute z-30 pointer-events-none"
                style={{ left: `${popup.x}%`, top: `${popup.y}%` }}
              >
                <span className="text-emerald-400 font-extrabold text-xl">
                  +{popup.amount}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          <ScoreBurst trigger={burstTrigger} />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-md"
          >
            <div
              className="bg-white rounded-2xl overflow-hidden shadow-2xl shadow-black/20"
              style={{ border: '1px solid rgba(255,255,255,0.15)' }}
            >
              {/* Content */}
              <div className="p-5 sm:p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* Level badge */}
                    <div className="inline-flex items-center gap-1.5 bg-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg mb-4">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      LEVEL {question?.level}
                    </div>

                    {/* Question */}
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{question?.title}</h3>
                    <p className="text-sm text-gray-500 mb-5">{question?.subtitle}</p>

                    {/* Field */}
                    {renderField()}
                  </motion.div>
                </AnimatePresence>

                {/* Progress + OK */}
                <div className="flex items-center justify-between mt-6">
                  <div className="flex gap-1.5">
                    {questions.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          idx < step
                            ? 'w-8 sm:w-12 bg-gradient-to-r from-purple-500 to-pink-500'
                            : idx === step
                            ? 'w-8 sm:w-12 bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse'
                            : 'w-8 sm:w-12 bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>

                  <motion.button
                    animate={shakeOk ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    onClick={handleNext}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all hover:shadow-lg hover:shadow-green-500/25"
                  >
                    OK
                    <CheckIcon className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Keyboard hint */}
            <div className="hidden sm:flex justify-center mt-3">
              <span className="text-white/30 text-xs font-medium">
                Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/50 font-bold">Enter</kbd> to continue
                {' \u00B7 '}
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/50 font-bold">Esc</kbd> to close
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
