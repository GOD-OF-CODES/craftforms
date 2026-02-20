'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

// ─── Pixel Cloud (same as landing page) ─────────────────────────

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

// ─── Animation Helpers ──────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

// ─── Section Colors ─────────────────────────────────────────────

const sectionColors = [
  'bg-purple-500',
  'bg-pink-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-cyan-500',
  'bg-rose-500',
  'bg-indigo-500',
]

// ─── Page ───────────────────────────────────────────────────────

export default function TermsPage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: '#00D4FF' }}>
      {/* ─── Fixed Landscape Background ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <PixelCloud className="absolute top-[4%] animate-drift-slow" size={8} style={{ animationDelay: '0s' }} />
        <PixelCloud className="absolute top-[2%] animate-drift" size={12} style={{ animationDelay: '-12s' }} />
        <PixelCloud className="absolute top-[12%] animate-drift-reverse" size={6} style={{ animationDelay: '-5s' }} />
        <PixelCloud className="absolute top-[7%] animate-drift-slow" size={10} style={{ animationDelay: '-25s' }} />
        <PixelCloud className="absolute top-[16%] animate-drift" size={7} style={{ animationDelay: '-20s' }} />

        <svg
          className="absolute bottom-[12vh] left-0 w-full"
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
          style={{ height: '45vh' }}
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
        </svg>

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

        {/* ─── Content ─── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-3xl mx-auto px-4 py-16"
        >
          <motion.div
            variants={fadeUp}
            className="bg-white rounded-2xl p-8 sm:p-12"
            style={{
              border: '3px solid #000',
              boxShadow: '8px 8px 0 0 rgba(0,0,0,0.85)',
            }}
          >
            {/* Title badge */}
            <div className="mb-6">
              <span
                className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-2 rounded-full"
                style={{
                  border: '2.5px solid #000',
                  boxShadow: '3px 3px 0 0 rgba(0,0,0,0.85)',
                }}
              >
                LEGAL
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Terms of Service</h1>
            <p className="text-sm text-gray-500 font-semibold mb-8">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <div className="space-y-8">
              {[
                {
                  title: 'Acceptance of Terms',
                  content: 'By accessing or using CraftForms, you agree to be bound by these terms of service. If you do not agree, please do not use the service.',
                },
                {
                  title: 'Use of Service',
                  content: 'CraftForms provides tools to create, distribute, and analyze forms and surveys. You may use the service for lawful purposes only. You are responsible for all content you create and all data you collect through your forms.',
                },
                {
                  title: 'Accounts',
                  content: 'You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account.',
                },
                {
                  title: 'Content Ownership',
                  content: 'You retain ownership of all forms and data you create on CraftForms. We do not claim any intellectual property rights over your content. You grant us a limited license to host and display your content as necessary to provide the service.',
                },
                {
                  title: 'Prohibited Uses',
                  content: 'You may not use CraftForms to collect sensitive information without proper consent, distribute spam or malicious content, attempt to gain unauthorized access to our systems, or violate any applicable laws or regulations.',
                },
                {
                  title: 'Termination',
                  content: 'We may suspend or terminate your access to CraftForms if you violate these terms. You may delete your account at any time. Upon termination, your data will be deleted in accordance with our privacy policy.',
                },
                {
                  title: 'Limitation of Liability',
                  content: 'CraftForms is provided \u201cas is\u201d without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.',
                },
                {
                  title: 'Contact',
                  content: 'If you have questions about these terms, please reach out to us at legal@craftforms.io.',
                },
              ].map((section, idx) => (
                <motion.section key={section.title} variants={fadeUp}>
                  <h2 className="text-lg font-extrabold text-gray-900 mb-2 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 ${sectionColors[idx]} text-white text-xs font-bold rounded-lg`}
                      style={{ border: '2px solid #000' }}
                    >
                      {idx + 1}
                    </span>
                    {section.title}
                  </h2>
                  <p className="text-gray-700 leading-relaxed pl-9">
                    {section.content}
                  </p>
                </motion.section>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* ─── Footer ─── */}
        <footer className="py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
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

              <div className="flex items-center gap-6 text-sm font-semibold text-gray-700">
                <Link href="/" className="hover:text-gray-900 transition-colors">
                  Home
                </Link>
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
    </div>
  )
}
