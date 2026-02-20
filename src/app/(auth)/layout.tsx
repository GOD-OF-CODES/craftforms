'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const floatingBlocks = [
  { emoji: '🏆', gradient: 'from-orange-400 to-amber-500', size: 'w-14 h-14', pos: 'top-[8%] left-[6%]', animation: { y: [0, -16, 0], rotate: [0, 8, -8, 0] }, duration: 4, delay: 0 },
  { emoji: '⭐', gradient: 'from-pink-400 to-rose-500', size: 'w-12 h-12', pos: 'top-[14%] right-[8%]', animation: { y: [0, -12, 0], rotate: [0, -10, 10, 0], scale: [1, 1.08, 1] }, duration: 3.5, delay: 0.5 },
  { emoji: '⚡', gradient: 'from-purple-500 to-indigo-600', size: 'w-11 h-11', pos: 'top-[40%] left-[4%]', animation: { y: [0, -14, 0], x: [0, 6, -6, 0] }, duration: 5, delay: 1 },
  { emoji: '🎮', gradient: 'from-green-400 to-emerald-500', size: 'w-12 h-12', pos: 'bottom-[20%] left-[8%]', animation: { y: [0, -10, 0], rotate: [0, -12, 0] }, duration: 4.5, delay: 1.5 },
  { emoji: '🎯', gradient: 'from-cyan-400 to-blue-500', size: 'w-10 h-10', pos: 'top-[30%] right-[5%]', animation: { y: [0, -8, 0], rotate: [0, 15, -5, 0] }, duration: 3, delay: 0.8 },
  { emoji: '💎', gradient: 'from-violet-400 to-purple-500', size: 'w-11 h-11', pos: 'bottom-[15%] right-[6%]', animation: { y: [0, -12, 0], scale: [1, 1.1, 1] }, duration: 4, delay: 2 },
  { emoji: '🚀', gradient: 'from-rose-400 to-pink-500', size: 'w-10 h-10', pos: 'bottom-[35%] right-[10%]', animation: { y: [0, -18, 0], rotate: [0, 10, 0] }, duration: 3.5, delay: 0.3 },
  { emoji: '✨', gradient: 'from-yellow-400 to-orange-400', size: 'w-9 h-9', pos: 'bottom-[40%] left-[10%]', animation: { y: [0, -10, 0], scale: [1, 1.15, 1], rotate: [0, -8, 8, 0] }, duration: 5, delay: 1.2 },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{
        background: 'linear-gradient(145deg, #4F46E5 0%, #0891B2 40%, #0E7490 70%, #155E75 100%)',
      }}
    >
      {/* Subtle grid pattern overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 39px, #000 39px, #000 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, #000 39px, #000 40px)',
        }}
      />

      {/* Floating decorative blocks */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {floatingBlocks.map((block, i) => (
          <motion.div
            key={i}
            animate={block.animation}
            transition={{ duration: block.duration, repeat: Infinity, ease: 'easeInOut', delay: block.delay }}
            className={`absolute ${block.pos} ${block.size} bg-gradient-to-br ${block.gradient} rounded-xl flex items-center justify-center text-lg hidden sm:flex`}
            style={{
              border: '2.5px solid #000',
              boxShadow: '3px 3px 0 0 rgba(0,0,0,0.85)',
            }}
          >
            {block.emoji}
          </motion.div>
        ))}

        {/* Small floating dots for depth */}
        <motion.div
          animate={{ y: [0, -6, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[22%] left-[20%] w-3 h-3 bg-white/40 rounded-full hidden sm:block"
        />
        <motion.div
          animate={{ y: [0, -8, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-[60%] right-[18%] w-2 h-2 bg-white/30 rounded-full hidden sm:block"
        />
        <motion.div
          animate={{ y: [0, -5, 0], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute bottom-[25%] left-[22%] w-2.5 h-2.5 bg-yellow-300/50 rounded-full hidden sm:block"
        />
      </div>

      {/* Header with logo */}
      <div className="relative z-10 pt-6 px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-white/70 group-hover:text-white transition-colors group-hover:-translate-x-0.5 transition-transform"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
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
              <span className="text-xl font-extrabold text-white" style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.15)' }}>
                CraftForms
              </span>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Page content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </div>
    </div>
  )
}
