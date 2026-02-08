'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface ValidationErrorProps {
  errors: string[]
}

const ValidationError = ({ errors }: ValidationErrorProps) => {
  return (
    <AnimatePresence>
      {errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="mt-2 space-y-1"
        >
          {errors.map((error, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-error"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ValidationError
