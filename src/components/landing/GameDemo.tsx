'use client'

import { useState, useCallback, useEffect, useRef, useMemo, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import * as sounds from '@/lib/sounds'

// ─── Types ───────────────────────────────────────────────────────

interface DemoQuestion {
  id: string
  level: number
  title: string
  subtitle: string
  questLine: string
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

interface AchievementDef {
  id: string
  name: string
  icon: string
  desc: string
}

interface Car {
  id: number
  style: number
  x: number
  y: number
  speed: number
  direction: 1 | -1
}

interface Projectile {
  id: number
  style: number
  x: number
  y0: number
  vx: number
  vy: number
  t: number
  rotation: number
}

interface PowerUp {
  id: number
  type: 'double' | 'freeze' | 'shield'
  x: number
  y: number
}

interface ToastItem {
  id: number
  text: string
  icon: string
}

// ─── Demo Data ───────────────────────────────────────────────────

const questions: DemoQuestion[] = [
  {
    id: 'name',
    level: 1,
    title: "What's your name?",
    subtitle: "We'd love to know who we're talking to!",
    questLine: 'A mysterious traveler appears! They want to know your name...',
    type: 'text',
    placeholder: 'Type your name...',
    points: 100,
  },
  {
    id: 'purpose',
    level: 2,
    title: 'What brings you here?',
    subtitle: 'Pick the option that fits you best!',
    questLine: 'The guild master asks: what brings you to these lands?',
    type: 'multiple_choice',
    options: ['Building a product', 'Collecting feedback', 'Running surveys', 'Just exploring'],
    points: 150,
  },
  {
    id: 'design',
    level: 3,
    title: 'How important is design to you?',
    subtitle: 'Rate from 1 to 5 stars!',
    questLine: 'The Royal Architect demands your opinion on aesthetics...',
    type: 'rating',
    ratingMax: 5,
    points: 200,
  },
  {
    id: 'gamified',
    level: 4,
    title: 'Would you use gamified forms?',
    subtitle: 'Be honest, we can handle it!',
    questLine: 'A wise oracle gazes into the future and asks...',
    type: 'yes_no',
    points: 250,
  },
  {
    id: 'feedback',
    level: 5,
    title: 'Any feedback for us?',
    subtitle: 'Last question — you got this!',
    questLine: 'The kingdom awaits your final words of wisdom!',
    type: 'text',
    placeholder: 'Share your thoughts...',
    points: 300,
  },
]

const TOTAL_HEARTS = 5
const STREAK_DURATION = 15 // seconds

const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_blood', name: 'First Blood', icon: '🗡️', desc: 'Answer your first question' },
  { id: 'speed_demon', name: 'Speed Demon', icon: '⚡', desc: 'Answer in under 3 seconds' },
  { id: 'combo_master', name: 'Combo Master', icon: '🔥', desc: 'Reach a 3x combo' },
  { id: 'perfectionist', name: 'Perfectionist', icon: '💎', desc: 'Complete with all hearts' },
  { id: 'explorer', name: 'Explorer', icon: '🗺️', desc: 'Find a secret easter egg' },
  { id: 'power_player', name: 'Power Player', icon: '🌟', desc: 'Collect a power-up' },
]

// ─── SVG Icons ──────────────────────────────────────────────────

function HeartIcon({ filled = true, className = 'w-5 h-5' }: { filled?: boolean; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? '#f43f5e' : 'none'} stroke={filled ? 'none' : '#cbd5e1'} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )
}

function StarIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#facc15">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function BoltIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#fb923c">
      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
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

function TrophyIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M8 21h8m-4-4v4m-4.5-8a7.5 7.5 0 0 0 9 0M5 3h14" stroke="#facc15" strokeWidth={2} strokeLinecap="round" />
      <path d="M5 3a2 2 0 0 0-2 2v1a5 5 0 0 0 4 4.9M19 3a2 2 0 0 1 2 2v1a5 5 0 0 1-4 4.9" stroke="#facc15" strokeWidth={2} strokeLinecap="round" />
      <path d="M5 3h14v4a7 7 0 0 1-14 0V3z" fill="#facc15" opacity={0.3} stroke="#facc15" strokeWidth={2} />
    </svg>
  )
}

// ─── Pixel Cloud ────────────────────────────────────────────────

const PixelCloud = memo(function PixelCloud({ className = '', size = 10, style }: { className?: string; size?: number; style?: React.CSSProperties }) {
  const s = size
  const c = 'rgba(255,255,255,0.9)'
  return (
    <div className={className} style={style} aria-hidden="true">
      <div
        style={{
          width: s,
          height: s,
          background: c,
          boxShadow: [
            `${s}px 0 ${c}`, `${2*s}px 0 ${c}`, `${3*s}px 0 ${c}`, `${4*s}px 0 ${c}`, `${5*s}px 0 ${c}`,
            `${-s}px ${s}px ${c}`, `0 ${s}px ${c}`, `${s}px ${s}px ${c}`, `${2*s}px ${s}px ${c}`, `${3*s}px ${s}px ${c}`, `${4*s}px ${s}px ${c}`, `${5*s}px ${s}px ${c}`, `${6*s}px ${s}px ${c}`,
            `${-s}px ${2*s}px ${c}`, `0 ${2*s}px ${c}`, `${s}px ${2*s}px ${c}`, `${2*s}px ${2*s}px ${c}`, `${3*s}px ${2*s}px ${c}`, `${4*s}px ${2*s}px ${c}`, `${5*s}px ${2*s}px ${c}`, `${6*s}px ${2*s}px ${c}`,
          ].join(', '),
        }}
      />
    </div>
  )
})

// ─── Pixel Art Car SVGs ─────────────────────────────────────────

const CarSVG = memo(function CarSVG({ style: carStyle }: { style: number }) {
  if (carStyle === 0) {
    // Red sedan
    return (
      <svg width="60" height="28" viewBox="0 0 60 28" fill="none">
        <rect x="6" y="10" width="48" height="14" rx="2" fill="#EF4444" />
        <rect x="14" y="4" width="28" height="10" rx="2" fill="#EF4444" />
        <rect x="17" y="6" width="10" height="7" rx="1" fill="#60A5FA" />
        <rect x="30" y="6" width="10" height="7" rx="1" fill="#60A5FA" />
        <rect x="50" y="14" width="4" height="3" rx="1" fill="#FBBF24" />
        <circle cx="15" cy="24" r="4" fill="#1F2937" />
        <circle cx="15" cy="24" r="2" fill="#6B7280" />
        <circle cx="45" cy="24" r="4" fill="#1F2937" />
        <circle cx="45" cy="24" r="2" fill="#6B7280" />
      </svg>
    )
  }
  if (carStyle === 1) {
    // Blue pickup
    return (
      <svg width="60" height="28" viewBox="0 0 60 28" fill="none">
        <rect x="4" y="10" width="52" height="14" rx="2" fill="#3B82F6" />
        <rect x="4" y="4" width="24" height="10" rx="2" fill="#3B82F6" />
        <rect x="30" y="10" width="24" height="10" rx="1" fill="#2563EB" stroke="#1D4ED8" strokeWidth="1" />
        <rect x="8" y="6" width="8" height="7" rx="1" fill="#60A5FA" />
        <rect x="18" y="6" width="8" height="7" rx="1" fill="#60A5FA" />
        <circle cx="14" cy="24" r="4" fill="#1F2937" />
        <circle cx="14" cy="24" r="2" fill="#6B7280" />
        <circle cx="46" cy="24" r="4" fill="#1F2937" />
        <circle cx="46" cy="24" r="2" fill="#6B7280" />
      </svg>
    )
  }
  // Yellow taxi
  return (
    <svg width="60" height="28" viewBox="0 0 60 28" fill="none">
      <rect x="6" y="10" width="48" height="14" rx="2" fill="#FBBF24" />
      <rect x="14" y="4" width="28" height="10" rx="2" fill="#FBBF24" />
      <rect x="17" y="6" width="10" height="7" rx="1" fill="#60A5FA" />
      <rect x="30" y="6" width="10" height="7" rx="1" fill="#60A5FA" />
      <rect x="22" y="11" width="16" height="3" fill="#1F2937" />
      <rect x="24" y="11" width="3" height="3" fill="#FBBF24" />
      <rect x="30" y="11" width="3" height="3" fill="#FBBF24" />
      <circle cx="15" cy="24" r="4" fill="#1F2937" />
      <circle cx="15" cy="24" r="2" fill="#6B7280" />
      <circle cx="45" cy="24" r="4" fill="#1F2937" />
      <circle cx="45" cy="24" r="2" fill="#6B7280" />
    </svg>
  )
})

// ─── Pixel Art Projectile SVGs ──────────────────────────────────

const ProjectileSVG = memo(function ProjectileSVG({ style: pStyle }: { style: number }) {
  if (pStyle === 0) {
    // Red bird
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" fill="#EF4444" />
        <circle cx="7" cy="8" r="2" fill="white" />
        <circle cx="13" cy="8" r="2" fill="white" />
        <circle cx="7.5" cy="8.5" r="1" fill="#1F2937" />
        <circle cx="13.5" cy="8.5" r="1" fill="#1F2937" />
        <path d="M10 12 L14 10 L10 14Z" fill="#F97316" />
        <path d="M4 4 L6 6 M16 4 L14 6" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
  if (pStyle === 1) {
    // Blue bird
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" fill="#3B82F6" />
        <circle cx="7" cy="8" r="2" fill="white" />
        <circle cx="13" cy="8" r="2" fill="white" />
        <circle cx="7.5" cy="8.5" r="1" fill="#1F2937" />
        <circle cx="13.5" cy="8.5" r="1" fill="#1F2937" />
        <path d="M2 8 L5 10 L2 12" fill="#2563EB" />
      </svg>
    )
  }
  // Yellow star
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 1 L12.5 7.5 L19 7.5 L14 12 L15.5 19 L10 15 L4.5 19 L6 12 L1 7.5 L7.5 7.5Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="0.5" />
      <line x1="10" y1="0" x2="10" y2="3" stroke="#FDE68A" strokeWidth="0.5" />
      <line x1="20" y1="10" x2="17" y2="10" stroke="#FDE68A" strokeWidth="0.5" />
      <line x1="0" y1="10" x2="3" y2="10" stroke="#FDE68A" strokeWidth="0.5" />
    </svg>
  )
})

// ─── Peeping Characters ─────────────────────────────────────────

const PeepingCharacter = memo(function PeepingCharacter({
  type,
  mousePos,
  visible,
  idle,
}: {
  type: 'left' | 'right' | 'bottom'
  mousePos: { x: number; y: number }
  visible: boolean
  idle: boolean
}) {
  const baseColors = { left: '#8B5CF6', right: '#10B981', bottom: '#F97316' }
  const color = baseColors[type]

  // Eye tracking
  const charPos = type === 'left' ? { x: 80, y: 400 } : type === 'right' ? { x: window?.innerWidth ? window.innerWidth - 80 : 1200, y: 400 } : { x: 640, y: 700 }
  const angle = Math.atan2(mousePos.y - charPos.y, mousePos.x - charPos.x)
  const pupilX = Math.cos(angle) * 2
  const pupilY = Math.sin(angle) * 2

  const positionClasses = type === 'left'
    ? 'left-0 top-1/2 -translate-y-1/2'
    : type === 'right'
    ? 'right-0 top-1/2 -translate-y-1/2'
    : 'bottom-[12vh] left-1/2 -translate-x-1/2'

  const slideFrom = type === 'left' ? { x: -60 } : type === 'right' ? { x: 60 } : { y: 60 }
  const slideTo = type === 'left' ? { x: -10 } : type === 'right' ? { x: 10 } : { y: 10 }

  return (
    <motion.div
      className={`absolute z-20 pointer-events-none ${positionClasses}`}
      initial={slideFrom}
      animate={visible ? slideTo : slideFrom}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <svg width="40" height="60" viewBox="0 0 40 60" fill="none">
        {/* Body */}
        <rect x="8" y="24" width="24" height="30" rx="6" fill={color} />
        {/* Head */}
        <circle cx="20" cy="18" r="14" fill={color} />
        {/* Eyes */}
        <circle cx="14" cy="16" r="4" fill="white" />
        <circle cx="26" cy="16" r="4" fill="white" />
        <circle cx={14 + pupilX} cy={16 + pupilY} r="2" fill="#1F2937" />
        <circle cx={26 + pupilX} cy={16 + pupilY} r="2" fill="#1F2937" />
        {/* Mouth */}
        <path d="M15 24 Q20 28 25 24" stroke="#1F2937" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Arms waving if idle */}
        {idle && (
          <>
            <motion.rect
              x="0" y="28" width="10" height="4" rx="2" fill={color}
              animate={{ rotate: [0, -20, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              style={{ transformOrigin: '8px 30px' }}
            />
            <motion.rect
              x="30" y="28" width="10" height="4" rx="2" fill={color}
              animate={{ rotate: [0, 20, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              style={{ transformOrigin: '32px 30px' }}
            />
          </>
        )}
      </svg>
      {/* Thought bubble on extended idle */}
      {idle && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white rounded-full px-3 py-1 text-xs font-bold text-gray-700 whitespace-nowrap"
          style={{ border: '2px solid #000', boxShadow: '2px 2px 0 rgba(0,0,0,0.85)' }}
        >
          Still there?
        </motion.div>
      )}
    </motion.div>
  )
})

// ─── Typewriter Text ────────────────────────────────────────────

const TypewriterText = memo(function TypewriterText({ text }: { text: string }) {
  const [charCount, setCharCount] = useState(0)
  useEffect(() => {
    setCharCount(0)
    const interval = setInterval(() => {
      setCharCount((prev) => {
        if (prev >= text.length) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 30)
    return () => clearInterval(interval)
  }, [text])

  return (
    <span className="text-xs text-gray-500 italic">
      {text.slice(0, charCount)}
      {charCount < text.length && <span className="animate-pulse">|</span>}
    </span>
  )
})

// ─── Streak Timer Ring ──────────────────────────────────────────

const StreakTimer = memo(function StreakTimer({ timeLeft, total }: { timeLeft: number; total: number }) {
  const pct = timeLeft / total
  const radius = 16
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - pct)
  const color = pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#eab308' : '#ef4444'

  return (
    <div className="relative w-10 h-10 flex items-center justify-center">
      <svg width="40" height="40" viewBox="0 0 40 40" className="absolute">
        <circle cx="20" cy="20" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="3" />
        <circle
          cx="20" cy="20" r={radius} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
        />
      </svg>
      <span className="text-xs font-bold text-gray-700">{Math.ceil(timeLeft)}</span>
    </div>
  )
})

// ─── Achievement Toast ──────────────────────────────────────────

const AchievementToast = memo(function AchievementToast({ toast }: { toast: ToastItem }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100 }}
      className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 mb-2"
      style={{ border: '2.5px solid #000', boxShadow: '4px 4px 0 rgba(0,0,0,0.85)' }}
    >
      <span className="text-xl">{toast.icon}</span>
      <div>
        <div className="text-xs font-bold text-gray-900">{toast.text}</div>
      </div>
    </motion.div>
  )
})

// ─── Confetti Piece ─────────────────────────────────────────────

const CONFETTI_COLORS = ['#A855F7', '#EC4899', '#F59E0B', '#38BDF8', '#4ADE80', '#FB923C', '#F43F5E', '#8B5CF6', '#FBBF24', '#10B981']

function ConfettiExplosion() {
  const pieces = useMemo(() =>
    Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      x: (Math.random() - 0.5) * 600,
      y: -(Math.random() * 400 + 100),
      rotation: Math.random() * 720 - 360,
      size: 4 + Math.random() * 6,
      delay: Math.random() * 0.3,
    })), [])

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2"
          style={{ width: p.size, height: p.size * 1.5, backgroundColor: p.color, borderRadius: 1 }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{ x: p.x, y: -p.y + 800, rotate: p.rotation, opacity: 0 }}
          transition={{ duration: 3, delay: p.delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      ))}
    </div>
  )
}

// ─── Power Up Icon ──────────────────────────────────────────────

const PowerUpIcon = memo(function PowerUpIcon({ type }: { type: 'double' | 'freeze' | 'shield' }) {
  if (type === 'double') {
    return <span className="text-lg">⭐</span>
  }
  if (type === 'freeze') {
    return <span className="text-lg">🕐</span>
  }
  return <span className="text-lg">🛡️</span>
})

// ─── Component ───────────────────────────────────────────────────

export default function GameDemo({ onClose }: { onClose: () => void }) {
  // Core state
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Record<string, string | number | boolean>>({})
  const [score, setScore] = useState(0)
  const [hearts] = useState(TOTAL_HEARTS)
  const [combo, setCombo] = useState(0)
  const [showComplete, setShowComplete] = useState(false)
  const [pointPopups, setPointPopups] = useState<PointPopup[]>([])
  const [shakeOk, setShakeOk] = useState(false)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [levelUpText, setLevelUpText] = useState('')

  // Sound
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem('craftforms_sound') !== 'off'
  })

  // Streak timer
  const [streakTime, setStreakTime] = useState(STREAK_DURATION)
  const streakRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stepStartRef = useRef(Date.now())

  // Achievements
  const [unlockedAch, setUnlockedAch] = useState<Set<string>>(new Set())
  const unlockedAchRef = useRef<Set<string>>(new Set())
  const [toasts, setToasts] = useState<ToastItem[]>([])

  // Power-ups
  const [activePowerUps, setActivePowerUps] = useState<PowerUp[]>([])
  const [doublePoints, setDoublePoints] = useState(false)
  const [timeFrozen, setTimeFrozen] = useState(false)

  // Cars & projectiles
  const [cars, setCars] = useState<Car[]>([])
  const [projectiles, setProjectiles] = useState<Projectile[]>([])
  const animFrameRef = useRef<number>(0)
  const lastTimeRef = useRef(0)
  const carSpawnRef = useRef(0)
  const projSpawnRef = useRef(0)
  const powerUpSpawnRef = useRef(0)

  // Characters
  const [mousePos, setMousePos] = useState({ x: 640, y: 400 })
  const [charVisible, setCharVisible] = useState(false)
  const [charIdle, setCharIdle] = useState(false)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const extendedIdleRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Easter eggs
  const [cloudClicked, setCloudClicked] = useState<number | null>(null)
  const [mountainClicked, setMountainClicked] = useState(false)

  // Screen shake
  const [shake, setShake] = useState(false)

  // Reduced motion
  const [reducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const question = questions[step]
  const totalQuestions = questions.length
  const currentValue = question ? values[question.id] : undefined

  // ─── Sound Init & Toggle ─────────────────────────────────────

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev
      if (next) { sounds.init(); sounds.unmute() } else { sounds.mute() }
      localStorage.setItem('craftforms_sound', next ? 'on' : 'off')
      return next
    })
  }, [])

  useEffect(() => {
    const initOnGesture = () => {
      sounds.init()
      if (!soundEnabled) sounds.mute()
      window.removeEventListener('click', initOnGesture)
    }
    window.addEventListener('click', initOnGesture)
    return () => window.removeEventListener('click', initOnGesture)
  }, [soundEnabled])

  // ─── Streak Timer ────────────────────────────────────────────

  useEffect(() => {
    if (showComplete) return
    setStreakTime(STREAK_DURATION)
    stepStartRef.current = Date.now()

    streakRef.current = setInterval(() => {
      if (timeFrozen) return
      setStreakTime((prev) => {
        if (prev <= 0) return 0
        return Math.max(0, prev - 0.1)
      })
    }, 100)

    return () => {
      if (streakRef.current) clearInterval(streakRef.current)
    }
  }, [step, showComplete, timeFrozen])

  // ─── Mouse Tracking for Characters ────────────────────────────

  useEffect(() => {
    const handler = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  // ─── Idle Detection for Characters ────────────────────────────

  const resetIdleTimers = useCallback(() => {
    setCharVisible(false)
    setCharIdle(false)
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    if (extendedIdleRef.current) clearTimeout(extendedIdleRef.current)

    idleTimerRef.current = setTimeout(() => {
      setCharVisible(true)
    }, 2500)

    extendedIdleRef.current = setTimeout(() => {
      setCharIdle(true)
    }, 10000)
  }, [])

  useEffect(() => {
    resetIdleTimers()
    const onType = () => resetIdleTimers()
    window.addEventListener('keydown', onType)
    return () => {
      window.removeEventListener('keydown', onType)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      if (extendedIdleRef.current) clearTimeout(extendedIdleRef.current)
    }
  }, [resetIdleTimers])

  // ─── Achievement Unlock ──────────────────────────────────────

  const unlockAchievement = useCallback((id: string) => {
    // Use ref for synchronous dedup (React Strict Mode calls state updaters twice)
    if (unlockedAchRef.current.has(id)) return
    unlockedAchRef.current.add(id)

    setUnlockedAch(new Set(unlockedAchRef.current))

    const ach = ACHIEVEMENTS.find((a) => a.id === id)
    if (ach) {
      sounds.achievement()
      setToasts((t) => [...t, { id: Date.now(), text: `${ach.name} — ${ach.desc}`, icon: ach.icon }])
      setTimeout(() => setToasts((t) => t.slice(1)), 3000)
    }
  }, [])

  // ─── Power-Up Spawn & Collection ─────────────────────────────

  const collectPowerUp = useCallback((pu: PowerUp) => {
    setActivePowerUps((prev) => prev.filter((p) => p.id !== pu.id))
    sounds.buttonClick()
    unlockAchievement('power_player')

    if (pu.type === 'double') {
      setDoublePoints(true)
      setTimeout(() => setDoublePoints(false), 10000)
    } else if (pu.type === 'freeze') {
      setTimeFrozen(true)
      setTimeout(() => setTimeFrozen(false), 5000)
    }
    // shield is cosmetic — just gives points
    setScore((prev) => prev + 50)
    setPointPopups((prev) => [...prev, { id: Date.now(), amount: 50, x: 50, y: 20 }])
  }, [unlockAchievement])

  // ─── Body Overflow Lock ──────────────────────────────────────

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // ─── Point Popup Helper ──────────────────────────────────────

  const addPointPopup = useCallback((amount: number) => {
    const id = Date.now() + Math.random()
    const x = 35 + Math.random() * 30
    const y = 30 + Math.random() * 15
    setPointPopups((prev) => [...prev, { id, amount, x, y }])
    setTimeout(() => setPointPopups((prev) => prev.filter((p) => p.id !== id)), 1200)
  }, [])

  // ─── Handle Next ─────────────────────────────────────────────

  const handleNext = useCallback(() => {
    if (!question) return

    const val = values[question.id]
    if (val === undefined && val !== false) {
      setShakeOk(true)
      setTimeout(() => setShakeOk(false), 500)
      return
    }

    // Speed demon check
    const elapsed = (Date.now() - stepStartRef.current) / 1000
    if (elapsed < 3) unlockAchievement('speed_demon')

    // Score calculation
    const timeBonus = 1 + streakTime / STREAK_DURATION
    const comboMultiplier = 1 + combo * 0.25
    let earnedPoints = Math.round(question.points * comboMultiplier * timeBonus)
    if (doublePoints) earnedPoints *= 2
    setScore((prev) => prev + earnedPoints)
    const newCombo = combo + 1
    setCombo(newCombo)
    addPointPopup(earnedPoints)
    sounds.scorePoint()

    // First blood
    if (step === 0) unlockAchievement('first_blood')

    // Combo master
    if (newCombo >= 3) {
      unlockAchievement('combo_master')
      setShake(true)
      sounds.combo()
      setTimeout(() => setShake(false), 400)
    }

    if (step < totalQuestions - 1) {
      setShowLevelUp(true)
      setLevelUpText(`LEVEL ${question.level + 1}`)
      sounds.levelUp()
      setTimeout(() => setShowLevelUp(false), 800)
      setTimeout(() => setStep((prev) => prev + 1), 400)
    } else {
      // Perfectionist
      if (hearts === TOTAL_HEARTS) unlockAchievement('perfectionist')
      sounds.completion()
      setShowComplete(true)
    }
  }, [question, values, step, totalQuestions, combo, addPointPopup, streakTime, doublePoints, hearts, unlockAchievement])

  // ─── Handle Value Change ─────────────────────────────────────

  const handleChange = useCallback(
    (value: string | number | boolean) => {
      if (!question) return
      setValues((prev) => ({ ...prev, [question.id]: value }))
      sounds.typingKey()
      resetIdleTimers()
    },
    [question, resetIdleTimers]
  )

  // ─── Keyboard Shortcuts ──────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !showComplete) handleNext()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleNext, showComplete, onClose])

  // ─── Animation Loop (Cars + Projectiles) ─────────────────────

  useEffect(() => {
    if (reducedMotion) return
    // Only on md+ screens
    if (typeof window !== 'undefined' && window.innerWidth < 768) return

    const GRAVITY = 0.15
    let running = true

    const loop = (time: number) => {
      if (!running) return
      if (!lastTimeRef.current) lastTimeRef.current = time
      const dt = Math.min(time - lastTimeRef.current, 50) / 16.667 // normalize to 60fps
      lastTimeRef.current = time

      // Spawn cars
      carSpawnRef.current += dt * 16.667
      if (carSpawnRef.current > (4000 + Math.random() * 4000)) {
        carSpawnRef.current = 0
        setCars((prev) => {
          if (prev.length >= 4) return prev
          const direction = Math.random() > 0.5 ? 1 : -1 as (1 | -1)
          const newCar: Car = {
            id: Date.now() + Math.random(),
            style: Math.floor(Math.random() * 3),
            x: direction === 1 ? -80 : (window?.innerWidth ?? 1400) + 80,
            y: 0,
            speed: 1.5 + Math.random() * 2,
            direction,
          }
          if (Math.random() < 0.1) sounds.carHonk()
          return [...prev, newCar]
        })
      }

      // Move cars
      setCars((prev) =>
        prev
          .map((car) => ({ ...car, x: car.x + car.speed * car.direction * dt }))
          .filter((car) => car.x > -100 && car.x < (window?.innerWidth ?? 1400) + 100)
      )

      // Spawn projectiles
      projSpawnRef.current += dt * 16.667
      if (projSpawnRef.current > (6000 + Math.random() * 6000)) {
        projSpawnRef.current = 0
        setProjectiles((prev) => {
          if (prev.length >= 2) return prev
          const fromLeft = Math.random() > 0.5
          const newProj: Projectile = {
            id: Date.now() + Math.random(),
            style: Math.floor(Math.random() * 3),
            x: fromLeft ? -30 : (window?.innerWidth ?? 1400) + 30,
            y0: 100 + Math.random() * 200,
            vx: (fromLeft ? 1 : -1) * (3 + Math.random() * 2),
            vy: -(4 + Math.random() * 3),
            t: 0,
            rotation: 0,
          }
          sounds.projectileWhoosh()
          return [...prev, newProj]
        })
      }

      // Move projectiles
      setProjectiles((prev) =>
        prev
          .map((p) => ({
            ...p,
            t: p.t + dt,
            x: p.x + p.vx * dt,
            rotation: p.rotation + 5 * dt,
          }))
          .filter((p) => {
            const y = p.y0 + p.vy * p.t + 0.5 * GRAVITY * p.t * p.t
            return y < (window?.innerHeight ?? 800) + 50 && p.x > -50 && p.x < (window?.innerWidth ?? 1400) + 50
          })
      )

      // Spawn power-ups
      powerUpSpawnRef.current += dt * 16.667
      if (powerUpSpawnRef.current > (8000 + Math.random() * 4000)) {
        powerUpSpawnRef.current = 0
        setActivePowerUps((prev) => {
          if (prev.length >= 1) return prev
          const types: Array<'double' | 'freeze' | 'shield'> = ['double', 'freeze', 'shield']
          const type = types[Math.floor(Math.random() * 3)] ?? 'double'
          return [...prev, {
            id: Date.now(),
            type,
            x: 10 + Math.random() * 80,
            y: 15 + Math.random() * 50,
          }]
        })
      }

      animFrameRef.current = requestAnimationFrame(loop)
    }

    // Pause on visibility hidden
    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(animFrameRef.current)
      } else {
        running = true
        lastTimeRef.current = 0
        animFrameRef.current = requestAnimationFrame(loop)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    animFrameRef.current = requestAnimationFrame(loop)
    return () => {
      running = false
      cancelAnimationFrame(animFrameRef.current)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reducedMotion])

  // ─── Easter Egg Handlers ─────────────────────────────────────

  const handleCloudClick = useCallback((idx: number) => {
    if (cloudClicked === idx) return
    setCloudClicked(idx)
    setScore((prev) => prev + 50)
    addPointPopup(50)
    unlockAchievement('explorer')
    sounds.buttonClick()
    setToasts((t) => [...t, { id: Date.now(), text: 'Secret found! +50', icon: '☁️' }])
    setTimeout(() => setToasts((t) => t.slice(1)), 3000)
    setTimeout(() => setCloudClicked(null), 10000)
  }, [cloudClicked, addPointPopup, unlockAchievement])

  const handleMountainClick = useCallback(() => {
    if (mountainClicked) return
    setMountainClicked(true)
    setScore((prev) => prev + 25)
    addPointPopup(25)
    unlockAchievement('explorer')
    sounds.buttonClick()
    setToasts((t) => [...t, { id: Date.now(), text: 'Secret found! +25 🚩', icon: '⛰️' }])
    setTimeout(() => setToasts((t) => t.slice(1)), 3000)
    setTimeout(() => setMountainClicked(false), 3000)
  }, [mountainClicked, addPointPopup, unlockAchievement])

  const handleCarClick = useCallback((carId: number) => {
    setCars((prev) => prev.filter((c) => c.id !== carId))
    setScore((prev) => prev + 75)
    addPointPopup(75)
    unlockAchievement('explorer')
    sounds.carHonk()
    setToasts((t) => [...t, { id: Date.now(), text: 'Secret found! +75', icon: '🚗' }])
    setTimeout(() => setToasts((t) => t.slice(1)), 3000)
  }, [addPointPopup, unlockAchievement])

  // ─── Render Field ────────────────────────────────────────────

  const renderField = () => {
    if (!question) return null

    switch (question.type) {
      case 'text':
        return (
          <input
            autoFocus
            type="text"
            value={(currentValue as string) || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={question.placeholder}
            className="w-full px-4 py-3 text-base rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-shadow"
            style={{ border: '2.5px solid #000', boxShadow: '3px 3px 0 rgba(0,0,0,0.85)' }}
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
                  onClick={() => { handleChange(option); sounds.buttonClick() }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold text-sm transition-all ${
                    isSelected ? 'bg-purple-500 text-white' : 'bg-white text-gray-800 hover:bg-purple-50'
                  }`}
                  style={{
                    border: '2.5px solid #000',
                    boxShadow: isSelected ? '4px 4px 0 rgba(0,0,0,0.85)' : '3px 3px 0 rgba(0,0,0,0.85)',
                  }}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                    style={{ border: '2px solid rgba(0,0,0,0.2)' }}
                  >
                    {letters[idx]}
                  </span>
                  {option}
                </motion.button>
              )
            })}
          </div>
        )

      case 'rating': {
        const max = question.ratingMax || 5
        return (
          <div className="flex gap-2 justify-center py-2">
            {Array.from({ length: max }).map((_, idx) => {
              const isFilled = ((currentValue as number) || 0) > idx
              return (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { handleChange(idx + 1); sounds.buttonClick() }}
                  className="transition-all"
                >
                  <svg className="w-10 h-10 sm:w-12 sm:h-12" viewBox="0 0 24 24" fill={isFilled ? '#facc15' : 'none'} stroke={isFilled ? '#f59e0b' : '#d1d5db'} strokeWidth={1.5}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </motion.button>
              )
            })}
          </div>
        )
      }

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
                  onClick={() => { handleChange(opt.value); sounds.buttonClick() }}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r ${opt.gradient} transition-all`}
                  style={{
                    border: '2.5px solid #000',
                    boxShadow: isSelected ? '4px 4px 0 rgba(0,0,0,0.85)' : '3px 3px 0 rgba(0,0,0,0.85)',
                    opacity: isSelected || currentValue === undefined ? 1 : 0.45,
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

  // ─── Game Background ─────────────────────────────────────────

  const GameBackground = (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Sky */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, #00D4FF 0%, #00B8E6 60%, #8B8FC0 100%)' }} />

      {/* Pixel Clouds */}
      <div
        className={`absolute top-[4%] animate-drift-slow ${cloudClicked === 0 ? 'opacity-0' : ''}`}
        style={{ animationDelay: '0s', cursor: 'pointer', transition: 'opacity 0.3s' }}
        onClick={() => handleCloudClick(0)}
      >
        <PixelCloud size={8} />
      </div>
      <div
        className={`absolute top-[2%] animate-drift ${cloudClicked === 1 ? 'opacity-0' : ''}`}
        style={{ animationDelay: '-12s', cursor: 'pointer', transition: 'opacity 0.3s' }}
        onClick={() => handleCloudClick(1)}
      >
        <PixelCloud size={12} />
      </div>
      <div
        className={`absolute top-[12%] animate-drift-reverse ${cloudClicked === 2 ? 'opacity-0' : ''}`}
        style={{ animationDelay: '-5s', cursor: 'pointer', transition: 'opacity 0.3s' }}
        onClick={() => handleCloudClick(2)}
      >
        <PixelCloud size={6} />
      </div>
      <PixelCloud className="absolute top-[7%] animate-drift-slow" size={10} style={{ animationDelay: '-25s' }} />
      <PixelCloud className="absolute top-[16%] animate-drift" size={7} style={{ animationDelay: '-20s' }} />

      {/* Mountains */}
      <svg
        className="absolute bottom-[12vh] left-0 w-full cursor-pointer"
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        style={{ height: '45vh' }}
        onClick={handleMountainClick}
      >
        <path
          d="M0 280 L80 220 L160 260 L240 180 L320 230 L400 160 L480 210 L560 130 L640 190 L720 140 L800 200 L880 130 L960 180 L1040 110 L1120 170 L1200 120 L1280 180 L1360 130 L1440 170 L1440 400 L0 400Z"
          fill="#8B8FC0"
        />
        <path
          d="M0 320 L100 260 L180 290 L280 210 L380 270 L460 200 L560 250 L660 180 L740 230 L840 170 L920 220 L1020 160 L1100 210 L1200 150 L1300 200 L1380 170 L1440 210 L1440 400 L0 400Z"
          fill="#7074AA"
        />
        <path
          d="M0 360 L120 300 L220 340 L340 270 L440 320 L560 260 L660 300 L780 240 L880 290 L980 230 L1080 280 L1180 230 L1300 270 L1400 240 L1440 260 L1440 400 L0 400Z"
          fill="#5C608E"
        />
        {/* Mountain peak flag on click */}
        {mountainClicked && (
          <text x="1040" y="105" fontSize="20" textAnchor="middle">🚩</text>
        )}
      </svg>

      {/* Ground */}
      <div
        className="absolute bottom-0 left-0 w-full"
        style={{
          height: '12vh',
          backgroundColor: '#5B8C5A',
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(0,0,0,0.06) 23px, rgba(0,0,0,0.06) 24px), repeating-linear-gradient(90deg, transparent, transparent 23px, rgba(0,0,0,0.06) 23px, rgba(0,0,0,0.06) 24px)',
        }}
      />

      {/* Cars on ground — desktop only */}
      {!reducedMotion && cars.map((car) => (
        <div
          key={car.id}
          className="absolute hidden md:block cursor-pointer"
          style={{
            bottom: `calc(12vh - 14px + ${car.y}px)`,
            left: car.x,
            transform: car.direction === -1 ? 'scaleX(-1)' : 'none',
            willChange: 'transform',
            pointerEvents: 'auto',
            zIndex: 15,
          }}
          onClick={() => handleCarClick(car.id)}
        >
          <CarSVG style={car.style} />
        </div>
      ))}

      {/* Projectiles — desktop only */}
      {!reducedMotion && projectiles.map((p) => {
        const GRAVITY = 0.15
        const y = p.y0 + p.vy * p.t + 0.5 * GRAVITY * p.t * p.t
        return (
          <div
            key={p.id}
            className="absolute hidden md:block pointer-events-none"
            style={{
              left: p.x,
              top: y,
              transform: `rotate(${p.rotation}deg)`,
              willChange: 'transform',
              zIndex: 15,
            }}
          >
            <ProjectileSVG style={p.style} />
          </div>
        )
      })}

      {/* Power-ups */}
      {!reducedMotion && activePowerUps.map((pu) => (
        <motion.button
          key={pu.id}
          className="absolute z-20 w-12 h-12 rounded-xl bg-white flex items-center justify-center animate-float cursor-pointer"
          style={{
            left: `${pu.x}%`,
            top: `${pu.y}%`,
            border: '2.5px solid #000',
            boxShadow: '4px 4px 0 rgba(0,0,0,0.85)',
          }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => collectPowerUp(pu)}
        >
          <PowerUpIcon type={pu.type} />
        </motion.button>
      ))}
    </div>
  )

  // ─── Peeping Characters (lg+ only) ───────────────────────────

  const CharacterElements = !reducedMotion && typeof window !== 'undefined' && window.innerWidth >= 1024 ? (
    <>
      <PeepingCharacter type="left" mousePos={mousePos} visible={charVisible} idle={charIdle} />
      <PeepingCharacter type="right" mousePos={mousePos} visible={charVisible} idle={charIdle} />
    </>
  ) : null

  // ─── Toast Container ─────────────────────────────────────────

  const ToastContainer = (
    <div className="fixed top-20 right-4 z-[110]">
      <AnimatePresence>
        {toasts.map((t) => (
          <AchievementToast key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  )

  // ─── Completion Screen ────────────────────────────────────────

  if (showComplete) {
    return (
      <div className="fixed inset-0 z-[100]" ref={containerRef}>
        {GameBackground}
        <ConfettiExplosion />
        {ToastContainer}

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
              <div
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-300 to-amber-400 flex items-center justify-center"
                style={{ border: '3px solid #000', boxShadow: '5px 5px 0 rgba(0,0,0,0.85)' }}
              >
                <TrophyIcon className="w-12 h-12" />
              </div>
            </motion.div>

            {/* Card */}
            <div
              className="bg-white rounded-2xl overflow-hidden"
              style={{ border: '3px solid #000', boxShadow: '6px 6px 0 rgba(0,0,0,0.85)' }}
            >
              {/* Header */}
              <div
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 px-6 py-5 text-center"
                style={{ borderBottom: '3px solid #000' }}
              >
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}>
                  Quest Complete!
                </h2>
                <p className="text-white/80 mt-1 font-medium">You crushed it!</p>
              </div>

              {/* Score summary */}
              <div className="p-6 space-y-5">
                <div className="flex justify-center gap-4 text-center">
                  <div
                    className="flex-1 bg-gray-50 rounded-xl p-4"
                    style={{ border: '2.5px solid #000', boxShadow: '3px 3px 0 rgba(0,0,0,0.85)' }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <StarIcon className="w-6 h-6" />
                      <span className="text-2xl font-extrabold text-gray-900">{score.toLocaleString()}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Score</span>
                  </div>
                  <div
                    className="flex-1 bg-gray-50 rounded-xl p-4"
                    style={{ border: '2.5px solid #000', boxShadow: '3px 3px 0 rgba(0,0,0,0.85)' }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <BoltIcon className="w-6 h-6" />
                      <span className="text-2xl font-extrabold text-gray-900">{combo}x</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Max Combo</span>
                  </div>
                </div>

                {/* Achievements Grid */}
                {unlockedAch.size > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Achievements</p>
                    <div className="flex flex-wrap gap-2">
                      {ACHIEVEMENTS.filter((a) => unlockedAch.has(a.id)).map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-1.5"
                          style={{ border: '2px solid #000', boxShadow: '2px 2px 0 rgba(0,0,0,0.85)' }}
                        >
                          <span className="text-sm">{a.icon}</span>
                          <span className="text-xs font-bold text-gray-700">{a.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Leaderboard teaser */}
                <div
                  className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 text-center"
                  style={{ border: '2px solid #000' }}
                >
                  <p className="text-sm text-gray-700">
                    You scored better than <span className="font-extrabold text-purple-600">87%</span> of adventurers!
                  </p>
                </div>

                <p className="text-center text-gray-500 text-sm">
                  Imagine your forms being <span className="font-bold text-purple-500">this fun</span> for your users.
                </p>

                <div className="flex flex-col gap-2.5">
                  <Link
                    href="/signup"
                    className="game-btn w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-all"
                    onClick={onClose}
                  >
                    Start Building Free
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </Link>
                  <button
                    onClick={() => {
                      setStep(0)
                      setScore(0)
                      setCombo(0)
                      setValues({})
                      setShowComplete(false)
                      setUnlockedAch(new Set())
                      unlockedAchRef.current = new Set()
                      setDoublePoints(false)
                      setTimeFrozen(false)
                      sounds.buttonClick()
                    }}
                    className="game-btn w-full bg-white text-gray-900 font-bold px-6 py-3 rounded-xl text-sm transition-all"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full text-sm font-semibold text-gray-400 hover:text-gray-600 py-2 transition-colors"
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
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-[100]"
      animate={shake ? { x: [0, -3, 3, -2, 2, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      {GameBackground}
      {CharacterElements}
      {ToastContainer}

      {/* Level-up banner */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
          >
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold text-3xl sm:text-4xl px-10 py-5 rounded-2xl"
              style={{
                border: '3px solid #000',
                boxShadow: '6px 6px 0 rgba(0,0,0,0.85)',
                textShadow: '2px 2px 0 rgba(0,0,0,0.2)',
              }}
            >
              {levelUpText}
            </div>
            {/* Radial pulse */}
            <motion.div
              className="absolute w-64 h-64 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)' }}
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content layer */}
      <div className="relative z-10 flex flex-col h-full">
        {/* ── Top HUD Bar ── */}
        <div className="px-4 pt-4 pb-2">
          <div
            className="max-w-lg mx-auto bg-white rounded-2xl px-4 sm:px-5 py-3 flex items-center justify-between"
            style={{ border: '3px solid #000', boxShadow: '6px 6px 0 rgba(0,0,0,0.85)' }}
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
                  style={{ border: '2px solid #000', boxShadow: '2px 2px 0 rgba(0,0,0,0.85)' }}
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
              className="flex items-center gap-1.5 bg-gray-50 rounded-full px-3 py-1.5"
              style={{ border: '2px solid #000', boxShadow: '2px 2px 0 rgba(0,0,0,0.85)' }}
            >
              <StarIcon className="w-4 h-4" />
              <span className="text-sm font-bold text-gray-900">{score.toLocaleString()}</span>
            </motion.div>
          </div>
        </div>

        {/* ── Sound Toggle ── */}
        <button
          onClick={toggleSound}
          className="absolute top-5 left-5 z-20 w-9 h-9 bg-white rounded-lg flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-all"
          style={{ border: '2.5px solid #000', boxShadow: '3px 3px 0 rgba(0,0,0,0.85)' }}
          title={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
        >
          {soundEnabled ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h2l4-4v14l-4-4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5v14a1 1 0 01-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )}
        </button>

        {/* ── Close button ── */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 w-9 h-9 bg-white rounded-lg flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-all"
          style={{ border: '2.5px solid #000', boxShadow: '3px 3px 0 rgba(0,0,0,0.85)' }}
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
                <span className="text-emerald-500 font-extrabold text-xl" style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.3)' }}>
                  +{popup.amount}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Active power-up indicator */}
          <AnimatePresence>
            {doublePoints && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-2 left-1/2 -translate-x-1/2 z-30 bg-yellow-300 text-gray-900 text-xs font-bold px-3 py-1 rounded-full"
                style={{ border: '2px solid #000' }}
              >
                2x POINTS ACTIVE
              </motion.div>
            )}
            {timeFrozen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-2 left-1/2 -translate-x-1/2 z-30 bg-blue-300 text-gray-900 text-xs font-bold px-3 py-1 rounded-full"
                style={{ border: '2px solid #000' }}
              >
                TIME FROZEN
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-md"
          >
            <div
              className="bg-white rounded-2xl overflow-hidden"
              style={{ border: '3px solid #000', boxShadow: '6px 6px 0 rgba(0,0,0,0.85)' }}
            >
              {/* Content */}
              <div className="p-5 sm:p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 60, rotate: 2 }}
                    animate={{ opacity: 1, x: 0, rotate: 0 }}
                    exit={{ opacity: 0, x: -60, rotate: -2 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Level badge + Streak Timer */}
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                        style={{ border: '2px solid #000', boxShadow: '3px 3px 0 rgba(0,0,0,0.85)' }}
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        LEVEL {question?.level}
                      </div>
                      <StreakTimer timeLeft={streakTime} total={STREAK_DURATION} />
                    </div>

                    {/* Quest narrative */}
                    <div className="mb-3">
                      <TypewriterText text={question?.questLine ?? ''} />
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
                    onClick={() => { handleNext(); sounds.buttonClick() }}
                    className="game-btn flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-emerald-400 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all"
                  >
                    OK
                    <CheckIcon className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Keyboard hint */}
            <div className="hidden sm:flex justify-center mt-3">
              <span
                className="bg-white/90 backdrop-blur-sm text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full"
                style={{ border: '2px solid #000' }}
              >
                Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 font-bold" style={{ border: '1.5px solid #000' }}>Enter</kbd> to continue
                {' \u00B7 '}
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 font-bold" style={{ border: '1.5px solid #000' }}>Esc</kbd> to close
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
