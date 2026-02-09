'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FieldRenderer, { FieldConfig } from '@/components/form-renderer/FieldRenderer'

const demoFields: FieldConfig[] = [
  {
    id: 'demo-name',
    type: 'short_text',
    title: "What's your name?",
    isRequired: false,
    properties: { placeholder: 'Type your name...' },
  },
  {
    id: 'demo-purpose',
    type: 'multiple_choice',
    title: 'What brings you here?',
    isRequired: false,
    properties: {
      options: ['Building a product', 'Collecting feedback', 'Running surveys', 'Just exploring'],
    },
  },
  {
    id: 'demo-rating',
    type: 'rating',
    title: 'How important is design to you?',
    isRequired: false,
    properties: { ratingMax: 5 },
  },
  {
    id: 'demo-feedback',
    type: 'long_text',
    title: 'Any feedback for us?',
    isRequired: false,
    properties: { placeholder: 'Share your thoughts...' },
  },
]

const autoAnswers: (string | number)[] = [
  'Alex Chen',
  'Building a product',
  4,
  'Love the clean UX!',
]

export default function MiniFormDemo() {
  const [currentStep, setCurrentStep] = useState(0)
  const [values, setValues] = useState<Record<string, any>>({})
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [showComplete, setShowComplete] = useState(false)
  const [, setTypedText] = useState('')
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null)
  const typewriterTimer = useRef<NodeJS.Timeout | null>(null)

  const clearTimers = useCallback(() => {
    if (autoPlayTimer.current) clearTimeout(autoPlayTimer.current)
    if (typewriterTimer.current) clearTimeout(typewriterTimer.current)
  }, [])

  const stopAutoPlay = useCallback(() => {
    setIsAutoPlaying(false)
    clearTimers()
  }, [clearTimers])

  // Typewriter effect for text fields
  const typeText = useCallback((text: string, fieldId: string, onDone: () => void) => {
    let i = 0
    setTypedText('')
    const tick = () => {
      if (i < text.length) {
        i++
        const partial = text.slice(0, i)
        setTypedText(partial)
        setValues(prev => ({ ...prev, [fieldId]: partial }))
        typewriterTimer.current = setTimeout(tick, 60)
      } else {
        onDone()
      }
    }
    tick()
  }, [])

  // Auto-play logic
  useEffect(() => {
    if (!isAutoPlaying) return

    if (showComplete) {
      autoPlayTimer.current = setTimeout(() => {
        setShowComplete(false)
        setCurrentStep(0)
        setValues({})
        setTypedText('')
      }, 1500)
      return clearTimers
    }

    const field = demoFields[currentStep]
    const answer = autoAnswers[currentStep]
    if (!field) return

    if (field.type === 'short_text' || field.type === 'long_text') {
      // Start typewriter after a short pause
      autoPlayTimer.current = setTimeout(() => {
        typeText(answer as string, field.id, () => {
          autoPlayTimer.current = setTimeout(() => {
            if (currentStep < demoFields.length - 1) {
              setCurrentStep(prev => prev + 1)
              setTypedText('')
            } else {
              setShowComplete(true)
            }
          }, 800)
        })
      }, 600)
    } else {
      // For choice/rating fields, auto-select after a pause
      autoPlayTimer.current = setTimeout(() => {
        setValues(prev => ({ ...prev, [field.id]: answer }))
        autoPlayTimer.current = setTimeout(() => {
          if (currentStep < demoFields.length - 1) {
            setCurrentStep(prev => prev + 1)
          } else {
            setShowComplete(true)
          }
        }, 1000)
      }, 1000)
    }

    return clearTimers
  }, [currentStep, isAutoPlaying, showComplete, typeText, clearTimers])

  const handleChange = (fieldId: string, value: any) => {
    if (isAutoPlaying) stopAutoPlay()
    setValues(prev => ({ ...prev, [fieldId]: value }))
  }

  const handleNext = () => {
    if (currentStep < demoFields.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      setShowComplete(true)
      setTimeout(() => {
        setShowComplete(false)
        setCurrentStep(0)
        setValues({})
        setTypedText('')
        setIsAutoPlaying(true)
      }, 2000)
    }
  }

  const field = demoFields[currentStep]!
  const progress = ((currentStep + (showComplete ? 1 : 0)) / demoFields.length) * 100

  return (
    <div
      className="w-[380px] h-[520px] rounded-xl overflow-hidden border border-border bg-background shadow-2xl flex flex-col"
      onClick={() => { if (isAutoPlaying) stopAutoPlay() }}
    >
      {/* Browser chrome */}
      <div className="bg-surface border-b border-border px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 mx-3">
          <div className="bg-background border border-border rounded-md px-3 py-1 text-xs text-text-secondary truncate">
            craftforms.app/demo-survey
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-surface">
        <motion.div
          className="h-full bg-primary"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Form content */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {showComplete ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4"
              >
                <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <p className="text-lg font-semibold text-text-primary">Thank you!</p>
              <p className="text-sm text-text-secondary mt-1">Your response has been recorded</p>
            </motion.div>
          ) : (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {currentStep + 1} / {demoFields.length}
                </span>
              </div>

              {/* Question title */}
              <h3 className="text-lg font-semibold text-text-primary mb-4 leading-snug">
                {field.title}
              </h3>

              {/* Field */}
              <div className="flex-1">
                <FieldRenderer
                  field={field}
                  value={values[field.id] ?? ''}
                  onChange={(val) => handleChange(field.id, val)}
                />
              </div>

              {/* Next button */}
              {!isAutoPlaying && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNext()
                  }}
                  className="mt-4 self-end px-5 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {currentStep < demoFields.length - 1 ? 'Next' : 'Submit'}
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
