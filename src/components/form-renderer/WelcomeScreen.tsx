import { motion } from 'framer-motion'

interface WelcomeScreenProps {
  title: string
  description?: string
  buttonText?: string
  onStart: () => void
}

export default function WelcomeScreen({ title, description, buttonText, onStart }: WelcomeScreenProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden p-4"
      style={{ background: '#00D4FF' }}
    >
      {/* Sky background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Mountains */}
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

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[480px]"
      >
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{
            border: '3px solid #000',
            boxShadow: '8px 8px 0 0 rgba(0,0,0,0.85)',
          }}
        >
          {/* Header bar */}
          <div
            className="bg-gradient-to-r from-orange-400 to-amber-400 px-5 py-3 flex items-center justify-center"
            style={{ borderBottom: '3px solid #000' }}
          >
            <div
              className="bg-white rounded-full px-4 py-1.5 flex items-center gap-2 text-sm font-bold"
              style={{
                border: '2px solid #000',
                boxShadow: '2px 2px 0 0 rgba(0,0,0,0.85)',
              }}
            >
              <span className="text-lg">&#127918;</span> READY TO START?
            </div>
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            {/* Icon */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6"
              style={{
                border: '2.5px solid #000',
                boxShadow: '4px 4px 0 0 rgba(0,0,0,0.85)',
              }}
            >
              <span className="text-3xl">&#9889;</span>
            </motion.div>

            <h1 className="text-2xl font-extrabold text-gray-900 mb-3">
              {title}
            </h1>
            {description && (
              <p className="text-base text-gray-500 mb-8 max-w-sm mx-auto">
                {description}
              </p>
            )}
            <button
              onClick={onStart}
              className="game-btn inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-400 text-white font-bold px-8 py-3.5 rounded-xl text-lg"
            >
              {buttonText || 'Start'}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
