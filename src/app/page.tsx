'use client'

import Link from 'next/link'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import GameDemo from '@/components/landing/GameDemo'

// ─── Animation Helpers ───────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

function AnimatedSection({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.section>
  )
}

// ─── Pixel Cloud ─────────────────────────────────────────────────

function PixelCloud({ className = '', size = 10, style }: { className?: string; size?: number; style?: React.CSSProperties }) {
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
            `${s}px 0 ${c}`,
            `${2 * s}px 0 ${c}`,
            `${3 * s}px 0 ${c}`,
            `${4 * s}px 0 ${c}`,
            `${5 * s}px 0 ${c}`,
            `${-s}px ${s}px ${c}`,
            `0 ${s}px ${c}`,
            `${s}px ${s}px ${c}`,
            `${2 * s}px ${s}px ${c}`,
            `${3 * s}px ${s}px ${c}`,
            `${4 * s}px ${s}px ${c}`,
            `${5 * s}px ${s}px ${c}`,
            `${6 * s}px ${s}px ${c}`,
            `${-s}px ${2 * s}px ${c}`,
            `0 ${2 * s}px ${c}`,
            `${s}px ${2 * s}px ${c}`,
            `${2 * s}px ${2 * s}px ${c}`,
            `${3 * s}px ${2 * s}px ${c}`,
            `${4 * s}px ${2 * s}px ${c}`,
            `${5 * s}px ${2 * s}px ${c}`,
            `${6 * s}px ${2 * s}px ${c}`,
          ].join(', '),
        }}
      />
    </div>
  )
}

// ─── Floating Decorations Row ────────────────────────────────────

function FloatingDecor() {
  return (
    <div className="relative w-full h-16 pointer-events-none select-none" aria-hidden="true">
      <span className="absolute left-[15%] animate-float text-2xl emoji-hover-spin" style={{ animationDelay: '0s' }}>🌻</span>
      <span
        className="absolute left-[30%] animate-wiggle text-2xl emoji-hover-spin"
        style={{ animationDelay: '1.2s' }}
      >
        🎮
      </span>
      <span
        className="absolute left-[45%] animate-float-slow text-2xl emoji-hover-spin"
        style={{ animationDelay: '0.5s' }}
      >
        🌸
      </span>
      <span
        className="absolute left-[62%] animate-float text-2xl animate-wiggle emoji-hover-spin"
        style={{ animationDelay: '1s' }}
      >
        ⭐
      </span>
      <span
        className="absolute left-[78%] animate-float-slow text-2xl emoji-hover-spin"
        style={{ animationDelay: '1.8s' }}
      >
        🎯
      </span>
      <span
        className="absolute left-[90%] animate-float text-2xl emoji-hover-spin"
        style={{ animationDelay: '1.5s' }}
      >
        💫
      </span>
    </div>
  )
}

// ─── Data ────────────────────────────────────────────────────────

const stats = [
  { value: '3x', label: 'Higher completion', gradient: 'from-purple-500 to-purple-400' },
  { value: '50%', label: 'Faster to complete', gradient: 'from-pink-500 to-rose-500' },
  { value: '10M+', label: 'Forms created', gradient: 'from-blue-500 to-cyan-500' },
  { value: '99.9%', label: 'Uptime guaranteed', gradient: 'from-green-500 to-emerald-400' },
]

const features = [
  {
    title: 'Lightning Fast',
    description:
      'Optimized for speed. Forms load instantly and respond in real-time to every interaction.',
    bg: 'bg-yellow-400',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: '3x Completions',
    description:
      'One question at a time dramatically reduces friction and boosts completion rates.',
    bg: 'bg-emerald-400',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    title: 'Smart Logic',
    description:
      'Create personalized paths with conditional logic that adapts to user responses.',
    bg: 'bg-purple-400',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      </svg>
    ),
  },
  {
    title: 'Enterprise Ready',
    description:
      'SOC 2 compliant, GDPR ready with enterprise-grade security and reliability.',
    bg: 'bg-gradient-to-br from-cyan-300 to-blue-400',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
]

const steps = [
  {
    number: '1',
    title: 'Design',
    description: 'Start with a template or build from scratch using our drag-and-drop builder.',
    color: 'from-purple-500 to-violet-500',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    number: '2',
    title: 'Customize',
    description: 'Add your branding, logic, and game elements to make it uniquely yours.',
    color: 'from-rose-500 to-pink-500',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
  {
    number: '3',
    title: 'Share',
    description: 'Share your form via link, embed it on your site, or send it via email.',
    color: 'from-blue-500 to-indigo-500',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
  },
  {
    number: '4',
    title: 'Analyze',
    description: 'Track responses and completion rates with real-time analytics.',
    color: 'from-green-500 to-emerald-500',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

const testimonials = [
  {
    quote:
      'CraftForms completely transformed our user research. The completion rates are insane!',
    name: 'Sarah Chen',
    role: 'Head of Product at Stripe',
    initials: 'SC',
    color: 'bg-purple-500',
  },
  {
    quote:
      'Finally, a form builder that looks as good as the rest of our product. Our users love it.',
    name: 'Marcus Johnson',
    role: 'Founder at TechStart',
    initials: 'MJ',
    color: 'bg-rose-500',
  },
  {
    quote:
      'The one-question-at-a-time approach reduced our bounce rate by 60%. Game changer.',
    name: 'Emily Rodriguez',
    role: 'Growth Lead at Vercel',
    initials: 'ER',
    color: 'bg-blue-600',
  },
]

const trustedBy = ['Stripe', 'Vercel', 'Shopify', 'Notion', 'Linear', 'Figma']

// ─── Main Page ───────────────────────────────────────────────────

export default function LandingPage() {
  const [showDemo, setShowDemo] = useState(false)
  const { scrollY } = useScroll()
  const heroParallax = useTransform(scrollY, [0, 600], [0, -60])
  const bgParallax = useTransform(scrollY, [0, 1000], [0, -25])

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: '#00D4FF' }}>
      {/* ─── Game Demo Modal ─── */}
      {showDemo && <GameDemo onClose={() => setShowDemo(false)} />}

      {/* ─── Fixed Landscape Background ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Pixel Clouds — drifting */}
        <PixelCloud className="absolute top-[4%] animate-drift-slow" size={8} style={{ animationDelay: '0s' }} />
        <PixelCloud className="absolute top-[2%] animate-drift" size={12} style={{ animationDelay: '-12s' }} />
        <PixelCloud className="absolute top-[12%] animate-drift-reverse" size={6} style={{ animationDelay: '-5s' }} />
        <PixelCloud className="absolute top-[7%] animate-drift-slow" size={10} style={{ animationDelay: '-25s' }} />
        <PixelCloud className="absolute top-[16%] animate-drift" size={7} style={{ animationDelay: '-20s' }} />

        {/* Mountain Layers */}
        <motion.svg
          className="absolute bottom-[12vh] left-0 w-full"
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
          style={{ height: '45vh', y: bgParallax }}
        >
          {/* Far mountains - lighter */}
          <path
            d="M0 280 L80 220 L160 260 L240 180 L320 230 L400 160 L480 210 L560 130 L640 190 L720 140 L800 200 L880 130 L960 180 L1040 110 L1120 170 L1200 120 L1280 180 L1360 130 L1440 170 L1440 400 L0 400Z"
            fill="#8B8FC0"
          />
          {/* Mid mountains */}
          <path
            d="M0 320 L100 260 L180 290 L280 210 L380 270 L460 200 L560 250 L660 180 L740 230 L840 170 L920 220 L1020 160 L1100 210 L1200 150 L1300 200 L1380 170 L1440 210 L1440 400 L0 400Z"
            fill="#7074AA"
          />
          {/* Near mountains - darker */}
          <path
            d="M0 360 L120 300 L220 340 L340 270 L440 320 L560 260 L660 300 L780 240 L880 290 L980 230 L1080 280 L1180 230 L1300 270 L1400 240 L1440 260 L1440 400 L0 400Z"
            fill="#5C608E"
          />
        </motion.svg>

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
      </div>

      {/* ─── Scrollable Content ─── */}
      <div className="relative z-10">
        {/* ─── Navbar ─── */}
        <div className="sticky top-4 z-50 px-4 pt-4">
          <nav className="max-w-5xl mx-auto bg-white game-card px-4 sm:px-6 py-3 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center"
                style={{
                  border: '2px solid #000',
                  boxShadow: '2px 2px 0 0 rgba(0,0,0,0.85)',
                }}
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="7" height="7" rx="1.5" />
                  <rect x="14" y="4" width="7" height="7" rx="1.5" />
                  <rect x="3" y="13" width="7" height="7" rx="1.5" />
                  <rect x="14" y="13" width="7" height="7" rx="1.5" />
                </svg>
              </div>
              <span className="text-xl font-extrabold text-gray-900">CraftForms</span>
            </Link>

            {/* Center links */}
            <div className="hidden md:flex items-center gap-6">
              <a
                href="#features"
                className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              >
                How it works
              </a>
              <a
                href="#demo"
                className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              >
                Demo
              </a>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:block text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="game-btn bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold px-5 py-2 rounded-full"
              >
                Get Started &gt;
              </Link>
            </div>
          </nav>
        </div>

        {/* ─── Hero ─── */}
        <section className="pt-16 pb-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left column */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="text-center lg:text-left"
              >
                {/* Announcement badge */}
                <motion.div variants={fadeUp} className="inline-flex items-center gap-2 mb-6">
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-300 rounded-full font-bold text-sm"
                    style={{
                      border: '2.5px solid #000',
                      boxShadow: '3px 3px 0 0 rgba(0,0,0,0.85)',
                    }}
                  >
                    ✨ Now with GAME MODE
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      New
                    </span>
                  </motion.span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                  variants={fadeUp}
                  className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] mb-6"
                >
                  Forms that feel{' '}
                  <br className="hidden sm:block" />
                  <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                    like a game
                  </span>
                </motion.h1>

                {/* Subtext */}
                <motion.p
                  variants={fadeUp}
                  className="text-lg sm:text-xl text-gray-800 font-medium max-w-lg mx-auto lg:mx-0 mb-8"
                >
                  Create gamified forms with pixel art, scores, and combos that boost completion
                  rates by{' '}
                  <span
                    className="inline-flex items-center px-2 py-0.5 bg-yellow-300 text-black font-extrabold rounded-md text-base"
                    style={{ border: '2px solid #000' }}
                  >
                    300%
                  </span>
                  .
                </motion.p>

                {/* CTA row */}
                <motion.div
                  variants={fadeUp}
                  className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6"
                >
                  <Link
                    href="/signup"
                    className="game-btn inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-8 py-3.5 rounded-xl text-lg"
                  >
                    Start Building Free &rarr;
                  </Link>
                  <button
                    onClick={() => setShowDemo(true)}
                    className="game-btn inline-flex items-center justify-center gap-2 bg-white text-gray-900 font-bold px-8 py-3.5 rounded-xl text-lg"
                  >
                    <span className="text-purple-500">▶</span> Try Demo
                  </button>
                </motion.div>

                {/* Trust bullets */}
                <motion.div
                  variants={fadeUp}
                  className="flex flex-wrap gap-4 justify-center lg:justify-start text-sm font-semibold text-gray-700"
                >
                  <span className="flex items-center gap-1">
                    <span className="text-green-500">✓</span> No credit card required
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-green-500">✓</span> Free forever plan
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-green-500">✓</span> Cancel anytime
                  </span>
                </motion.div>
              </motion.div>

              {/* Right column — Game Card Preview (Desktop) */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="hidden lg:flex justify-center"
                style={{ y: heroParallax }}
              >
                <div className="relative group" id="demo">
                  {/* Floating decorative blocks — animated */}
                  <motion.div
                    animate={{ y: [0, -14, 0], rotate: [0, 6, -6, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-4 -right-12 w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center text-xl"
                    style={{
                      border: '2.5px solid #000',
                      boxShadow: '3px 3px 0 0 rgba(0,0,0,0.85)',
                    }}
                  >
                    🏆
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, -12, 0], rotate: [0, -8, 8, 0], x: [0, 4, -4, 0] }}
                    transition={{
                      duration: 4.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.5,
                    }}
                    className="absolute top-1/3 -left-10 w-11 h-11 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center text-lg"
                    style={{
                      border: '2.5px solid #000',
                      boxShadow: '3px 3px 0 0 rgba(0,0,0,0.85)',
                    }}
                  >
                    ⭐
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, -10, 0], rotate: [0, 10, -5, 0], scale: [1, 1.08, 1] }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 1,
                    }}
                    className="absolute bottom-1/4 -right-10 w-11 h-11 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-lg"
                    style={{
                      border: '2.5px solid #000',
                      boxShadow: '3px 3px 0 0 rgba(0,0,0,0.85)',
                    }}
                  >
                    ⚡
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, -8, 0], rotate: [0, -12, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                    className="absolute -bottom-6 left-1/4 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-lg"
                    style={{
                      border: '2.5px solid #000',
                      boxShadow: '3px 3px 0 0 rgba(0,0,0,0.85)',
                    }}
                  >
                    🎮
                  </motion.div>

                  {/* Main card */}
                  <div
                    className="relative w-[400px] bg-white rounded-2xl overflow-hidden game-card-hover"
                    style={{
                      border: '3px solid #000',
                      boxShadow: '8px 8px 0 0 rgba(0,0,0,0.85)',
                    }}
                  >
                    {/* Header bar */}
                    <div
                      className="bg-gradient-to-r from-orange-400 to-amber-400 px-5 py-3 flex items-center justify-between"
                      style={{ borderBottom: '3px solid #000' }}
                    >
                      <div className="flex gap-1.5">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-red-500 text-lg">
                            ❤️
                          </span>
                        ))}
                      </div>
                      <div
                        className="bg-white rounded-full px-3 py-1 flex items-center gap-1 text-sm font-bold"
                        style={{
                          border: '2px solid #000',
                          boxShadow: '2px 2px 0 0 rgba(0,0,0,0.85)',
                        }}
                      >
                        ⭐ 1,250
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Level badge */}
                      <div
                        className="inline-block bg-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg mb-4"
                        style={{
                          border: '2px solid #000',
                          boxShadow: '3px 3px 0 0 rgba(0,0,0,0.85)',
                        }}
                      >
                        LEVEL 1
                      </div>

                      {/* Question */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        What&apos;s your name?
                      </h3>
                      <p className="text-sm text-gray-500 mb-5">
                        We&apos;d love to know who we&apos;re talking to!
                      </p>

                      {/* Input */}
                      <div
                        className="rounded-lg px-4 py-3 text-gray-400 text-sm mb-5"
                        style={{ border: '2.5px solid #D1D5DB' }}
                      >
                        Type your answer here...
                      </div>

                      {/* Progress bar + OK button */}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1.5">
                          <div className="w-12 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                          <div className="w-12 h-2 rounded-full bg-gray-200" />
                          <div className="w-12 h-2 rounded-full bg-gray-200" />
                          <div className="w-12 h-2 rounded-full bg-gray-200" />
                          <div className="w-12 h-2 rounded-full bg-gray-200" />
                        </div>
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-400 text-white text-sm font-bold px-4 py-2 rounded-lg"
                          style={{
                            border: '2px solid #000',
                            boxShadow: '3px 3px 0 0 rgba(0,0,0,0.85)',
                          }}
                        >
                          OK ✓
                        </div>
                      </div>
                    </div>

                    {/* Hover overlay */}
                    <button
                      onClick={() => setShowDemo(true)}
                      className="absolute inset-0 bg-gradient-to-b from-purple-500/80 to-pink-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                    >
                      <span className="flex items-center gap-2 text-white font-extrabold text-xl">
                        ▶ TRY DEMO
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Mobile game card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex lg:hidden justify-center"
              >
                <button
                  onClick={() => setShowDemo(true)}
                  className="w-full max-w-[360px] bg-white rounded-2xl overflow-hidden text-left relative group/mobile"
                  style={{
                    border: '3px solid #000',
                    boxShadow: '6px 6px 0 0 rgba(0,0,0,0.85)',
                  }}
                >
                  <div
                    className="bg-gradient-to-r from-orange-400 to-amber-400 px-4 py-2.5 flex items-center justify-between"
                    style={{ borderBottom: '3px solid #000' }}
                  >
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-red-500 text-sm">
                          ❤️
                        </span>
                      ))}
                    </div>
                    <div
                      className="bg-white rounded-full px-2.5 py-0.5 text-xs font-bold flex items-center gap-1"
                      style={{ border: '2px solid #000' }}
                    >
                      ⭐ 1,250
                    </div>
                  </div>
                  <div className="p-5">
                    <div
                      className="inline-block bg-purple-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg mb-3"
                      style={{
                        border: '2px solid #000',
                        boxShadow: '2px 2px 0 0 rgba(0,0,0,0.85)',
                      }}
                    >
                      LEVEL 1
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      What&apos;s your name?
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      We&apos;d love to know who we&apos;re talking to!
                    </p>
                    <div
                      className="rounded-lg px-3 py-2.5 text-gray-400 text-xs mb-4"
                      style={{ border: '2px solid #D1D5DB' }}
                    >
                      Type your answer here...
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <div className="w-8 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                        <div className="w-8 h-1.5 rounded-full bg-gray-200" />
                        <div className="w-8 h-1.5 rounded-full bg-gray-200" />
                        <div className="w-8 h-1.5 rounded-full bg-gray-200" />
                        <div className="w-8 h-1.5 rounded-full bg-gray-200" />
                      </div>
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-400 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                        style={{
                          border: '2px solid #000',
                          boxShadow: '2px 2px 0 0 rgba(0,0,0,0.85)',
                        }}
                      >
                        OK ✓
                      </div>
                    </div>
                  </div>
                  {/* Tap to try overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/80 to-pink-500/80 flex items-center justify-center opacity-0 active:opacity-100 transition-opacity duration-200">
                    <span className="flex items-center gap-2 text-white font-extrabold text-lg">
                      ▶ TRY DEMO
                    </span>
                  </div>
                </button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── Floating Decorations ─── */}
        <FloatingDecor />

        {/* ─── Trusted By ─── */}
        <section className="py-6 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-[0.2em] mb-4">
              Trusted by innovative teams worldwide
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {trustedBy.map((company) => (
                <span
                  key={company}
                  className="text-xl sm:text-2xl font-extrabold text-gray-800/40 hover:text-gray-800/70 transition-opacity cursor-default"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {company}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Stats ─── */}
        <AnimatedSection className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div variants={staggerContainer} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-6 sm:p-8 text-center game-breathe game-card-hover`}
                  style={{
                    border: '3px solid #000',
                    boxShadow: '6px 6px 0 0 rgba(0,0,0,0.85)',
                    animationDelay: `${idx * 0.5}s`,
                  }}
                >
                  <div className="text-4xl sm:text-5xl font-extrabold text-white mb-1" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}>
                    {stat.value}
                  </div>
                  <div className="text-sm sm:text-base font-semibold text-white/90">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>

        {/* ─── Features ─── */}
        <section id="features" className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={staggerContainer}
              className="text-center mb-12"
            >
              <motion.div variants={fadeUp} className="inline-block mb-4">
                <span
                  className="bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-full"
                  style={{
                    border: '2.5px solid #000',
                    boxShadow: '3px 3px 0 0 rgba(0,0,0,0.85)',
                  }}
                >
                  FEATURES
                </span>
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4"
              >
                Everything you need to
                <br />
                <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                  create amazing forms
                </span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-gray-700 max-w-2xl mx-auto">
                Powerful features that help you collect better data and create delightful
                experiences your users will love.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={staggerContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {features.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  className={`${feature.bg} rounded-2xl p-6 game-card-hover`}
                  style={{
                    border: '3px solid #000',
                    boxShadow: '6px 6px 0 0 rgba(0,0,0,0.85)',
                  }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: '8px 12px 0 0 rgba(0,0,0,0.85)',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div
                    className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4"
                    style={{
                      border: '2.5px solid #000',
                      boxShadow: '3px 3px 0 0 rgba(0,0,0,0.85)',
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-800 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section id="how-it-works" className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={staggerContainer}
              className="text-center mb-14"
            >
              <motion.div variants={fadeUp} className="inline-block mb-4">
                <span
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-2 rounded-full"
                  style={{
                    border: '2.5px solid #000',
                    boxShadow: '3px 3px 0 0 rgba(0,0,0,0.85)',
                  }}
                >
                  HOW IT WORKS
                </span>
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3"
              >
                Build forms in minutes
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-gray-700">
                Four simple steps to create professional forms that convert.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={staggerContainer}
              className="relative"
            >
              {/* Timeline connector line — desktop */}
              <div
                className="hidden lg:block absolute top-10 left-[calc(12.5%+40px)] right-[calc(12.5%+40px)] h-1 rounded-full"
                style={{
                  border: '2px dashed rgba(0,0,0,0.25)',
                  top: '40px',
                }}
              />

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
                {steps.map((step, idx) => (
                  <motion.div key={step.number} variants={fadeUp} className="text-center relative">
                    {/* Arrow connector between steps — desktop only */}
                    {idx < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-[34px] -right-3 z-20">
                        <svg width="24" height="14" viewBox="0 0 24 14" fill="none">
                          <path
                            d="M0 7h18m0 0l-5-5.5M18 7l-5 5.5"
                            stroke="#000"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}

                    <div className="relative inline-block mb-5">
                      {/* Icon box */}
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center relative z-10 animate-float`}
                        style={{
                          border: '3px solid #000',
                          boxShadow: '5px 5px 0 0 rgba(0,0,0,0.85)',
                          animationDelay: `${idx * 0.4}s`,
                        }}
                      >
                        {step.icon}
                      </motion.div>
                      {/* Number badge */}
                      <div
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center z-20"
                        style={{ border: '2.5px solid #000' }}
                      >
                        <span className="text-white text-sm font-bold">{step.number}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-extrabold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-700 leading-relaxed max-w-[200px] mx-auto">
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── Testimonials ─── */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={staggerContainer}
              className="text-center mb-12"
            >
              <motion.div variants={fadeUp} className="inline-block mb-4">
                <span
                  className="bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-full"
                  style={{
                    border: '2.5px solid #000',
                    boxShadow: '3px 3px 0 0 rgba(0,0,0,0.85)',
                  }}
                >
                  TESTIMONIALS
                </span>
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3"
              >
                Loved by thousands
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-gray-700">
                See why teams around the world choose CraftForms for their forms.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={staggerContainer}
              className="grid md:grid-cols-3 gap-6"
            >
              {testimonials.map((t) => (
                <motion.div
                  key={t.name}
                  variants={fadeUp}
                  className="bg-white rounded-2xl p-6 game-card-hover"
                  style={{
                    border: '3px solid #000',
                    boxShadow: '6px 6px 0 0 rgba(0,0,0,0.85)',
                  }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: '8px 12px 0 0 rgba(0,0,0,0.85)',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg">
                        ★
                      </span>
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-base font-semibold text-gray-900 mb-6 leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 ${t.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}
                      style={{ border: '2px solid #000' }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── Floating Decorations ─── */}
        <FloatingDecor />

        {/* ─── CTA Banner ─── */}
        <section className="py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <div
              className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl px-8 py-16 text-center overflow-hidden"
              style={{
                border: '3px solid #000',
                boxShadow: '8px 8px 0 0 rgba(0,0,0,0.85)',
              }}
            >
              {/* Floating blocks */}
              <motion.div
                animate={{ y: [0, -14, 0], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-4 left-6 text-2xl"
              >
                ⭐
              </motion.div>
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, -8, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute top-4 right-8 text-2xl"
              >
                🏆
              </motion.div>
              <motion.div
                animate={{ y: [0, -8, 0], x: [0, 5, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute bottom-6 left-12 text-2xl"
              >
                🎮
              </motion.div>
              <motion.div
                animate={{ y: [0, -12, 0], rotate: [0, 15, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                className="absolute bottom-8 right-10 text-2xl"
              >
                🎯
              </motion.div>

              <div className="relative z-10">
                <h2
                  className="text-3xl sm:text-4xl font-extrabold text-white mb-4"
                  style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}
                >
                  Ready to level up your forms?
                </h2>
                <p className="text-white/90 text-lg mb-8 max-w-lg mx-auto">
                  Join thousands of teams creating gamified forms that get more responses.
                </p>
                <Link
                  href="/signup"
                  className="game-btn inline-flex items-center justify-center gap-2 bg-white text-gray-900 font-extrabold px-8 py-4 rounded-xl text-lg"
                >
                  Start Building Free &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Footer ─── */}
        <footer className="py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Brand */}
              <Link href="/" className="flex items-center gap-2">
                <div
                  className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center"
                  style={{
                    border: '2px solid #000',
                    boxShadow: '2px 2px 0 0 rgba(0,0,0,0.85)',
                  }}
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="7" height="7" rx="1.5" />
                    <rect x="14" y="4" width="7" height="7" rx="1.5" />
                    <rect x="3" y="13" width="7" height="7" rx="1.5" />
                    <rect x="14" y="13" width="7" height="7" rx="1.5" />
                  </svg>
                </div>
                <span className="text-lg font-extrabold text-gray-900">CraftForms</span>
              </Link>

              {/* Links */}
              <div className="flex items-center gap-6 text-sm font-semibold text-gray-700">
                <a href="#features" className="hover:text-gray-900 transition-colors">
                  Features
                </a>
                <a href="#how-it-works" className="hover:text-gray-900 transition-colors">
                  How it works
                </a>
                <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-gray-900 transition-colors">
                  Terms
                </Link>
              </div>
            </div>

            <div className="mt-8 pt-6 text-center" style={{ borderTop: '1px solid rgba(0,0,0,0.15)' }}>
              <p className="text-sm text-gray-600">
                &copy; {new Date().getFullYear()} CraftForms. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* ─── Game Demo Modal ─── */}
      {showDemo && <GameDemo onClose={() => setShowDemo(false)} />}
    </div>
  )
}
