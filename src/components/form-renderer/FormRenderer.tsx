'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/button'
import Progress from '@/components/ui/progress'
import FieldRenderer, { FieldConfig, buildValidationRules } from './FieldRenderer'
import ThankYouScreen from './ThankYouScreen'
import WelcomeScreen from './WelcomeScreen'
import { validateField, ValidationResult } from '@/lib/validations'
import { FieldValue } from '@/types/fields'
import {
  getNextFieldId,
  getPreviousFieldInPath,
  FieldLogic,
  LogicRule
} from '@/lib/logicEngine'

interface ThemeStyles {
  container?: React.CSSProperties
  question?: React.CSSProperties
  description?: React.CSSProperties
  input?: React.CSSProperties
  button?: React.CSSProperties
  error?: React.CSSProperties
  success?: React.CSSProperties
}

interface FormRendererProps {
  fields: FieldConfig[]
  onSubmit: (answers: Record<string, FieldValue>) => Promise<void>
  showProgressBar?: boolean
  showQuestionNumbers?: boolean
  allowNavigation?: boolean
  welcomeScreen?: {
    enabled: boolean
    title: string
    description?: string
    buttonText?: string
  }
  thankYouScreen?: {
    enabled: boolean
    title: string
    description?: string
    redirectUrl?: string
  }
  themeStyles?: ThemeStyles
  /** Extra CSS class on the progress bar wrapper (e.g. "top-10" to clear a banner) */
  progressBarClassName?: string
}

const FormRenderer = ({
  fields,
  onSubmit,
  showProgressBar = true,
  showQuestionNumbers = true,
  allowNavigation = true,
  welcomeScreen,
  thankYouScreen,
  themeStyles: _themeStyles, // Reserved for future use
  progressBarClassName
}: FormRendererProps) => {
  const [currentIndex, setCurrentIndex] = useState(welcomeScreen?.enabled ? -1 : 0)
  const [answers, setAnswers] = useState<Record<string, FieldValue>>({})
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})
  const [showValidation, setShowValidation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [navigationHistory, setNavigationHistory] = useState<string[]>([])

  const currentField = currentIndex >= 0 && currentIndex < fields.length
    ? fields[currentIndex]
    : null

  // Convert fields to format expected by logic engine
  const fieldsWithLogic = useMemo(() => {
    return fields.map(f => ({
      id: f.id,
      logic: f.properties?.logicRules ? {
        fieldId: f.id,
        rules: f.properties.logicRules as LogicRule[]
      } as FieldLogic : undefined
    }))
  }, [fields])

  // Calculate progress based on navigation history
  const progress = fields.length > 0
    ? Math.round(((navigationHistory.length + 1) / fields.length) * 100)
    : 0

  const validateCurrentField = useCallback(() => {
    if (!currentField) return true

    const rules = buildValidationRules(currentField)
    const result = validateField(
      { value: answers[currentField.id], type: currentField.type },
      rules
    )

    setValidationErrors(prev => ({
      ...prev,
      [currentField.id]: result.errors
    }))

    return result.isValid
  }, [currentField, answers])

  const handleNext = async () => {
    // If on welcome screen, just advance
    if (currentIndex === -1) {
      setDirection(1)
      setCurrentIndex(0)
      if (fields[0]) {
        setNavigationHistory([fields[0].id])
      }
      return
    }

    // Validate current field before advancing
    setShowValidation(true)
    const isValid = validateCurrentField()

    if (!isValid) {
      return
    }

    // Check for logic jumps
    const currentFieldId = currentField?.id
    if (currentFieldId) {
      const defaultNextIndex = currentIndex + 1
      const nextField = defaultNextIndex < fields.length ? fields[defaultNextIndex] : undefined
      const defaultNextFieldId = nextField?.id

      const nextFieldId = getNextFieldId(
        currentFieldId,
        fieldsWithLogic,
        answers,
        defaultNextFieldId
      )

      // Handle skip to end
      if (nextFieldId === 'end') {
        setIsSubmitting(true)
        try {
          await onSubmit(answers)
          setIsSubmitted(true)
          if (thankYouScreen && thankYouScreen.redirectUrl) {
            window.location.href = thankYouScreen.redirectUrl
          }
        } catch (error) {
          console.error('Submit error:', error)
        } finally {
          setIsSubmitting(false)
        }
        return
      }

      // Handle jump to specific field
      if (nextFieldId && nextFieldId !== defaultNextFieldId) {
        const nextIndex = fields.findIndex(f => f.id === nextFieldId)
        if (nextIndex !== -1) {
          setDirection(1)
          setShowValidation(false)
          setNavigationHistory(prev => [...prev, nextFieldId])
          setCurrentIndex(nextIndex)
          return
        }
      }
    }

    // If last field, submit
    if (currentIndex === fields.length - 1) {
      setIsSubmitting(true)
      try {
        await onSubmit(answers)
        setIsSubmitted(true)
        if (thankYouScreen && thankYouScreen.redirectUrl) {
          window.location.href = thankYouScreen.redirectUrl
        }
      } catch (error) {
        console.error('Submit error:', error)
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    // Advance to next field (no logic jump)
    setDirection(1)
    setShowValidation(false)
    const nextIndex = currentIndex + 1
    const nextFieldForHistory = fields[nextIndex]
    if (nextFieldForHistory) {
      setNavigationHistory(prev => [...prev, nextFieldForHistory.id])
    }
    setCurrentIndex(nextIndex)
  }

  const handleBack = () => {
    if (navigationHistory.length > 1) {
      // Use navigation history to go back (respects logic jumps)
      const currentFieldId = currentField?.id
      if (currentFieldId) {
        const previousFieldId = getPreviousFieldInPath(currentFieldId, navigationHistory)
        if (previousFieldId) {
          const previousIndex = fields.findIndex(f => f.id === previousFieldId)
          if (previousIndex !== -1) {
            setDirection(-1)
            setShowValidation(false)
            setNavigationHistory(prev => prev.slice(0, -1))
            setCurrentIndex(previousIndex)
            return
          }
        }
      }
    }

    if (currentIndex > 0) {
      setDirection(-1)
      setShowValidation(false)
      setNavigationHistory(prev => prev.slice(0, -1))
      setCurrentIndex(prev => prev - 1)
    } else if (currentIndex === 0 && welcomeScreen?.enabled) {
      setDirection(-1)
      setNavigationHistory([])
      setCurrentIndex(-1)
    }
  }

  const handleAnswerChange = (value: FieldValue) => {
    const field = currentField
    if (!field) return

    const fieldId = field.id

    setAnswers(prev => ({
      ...prev,
      [fieldId]: value
    }))

    // Clear validation errors when user starts typing
    const fieldErrors = validationErrors[fieldId]
    if (fieldErrors && fieldErrors.length > 0) {
      setValidationErrors(prev => ({
        ...prev,
        [fieldId]: []
      }))
    }
  }

  // Use refs so callbacks stay stable across renders
  const handleNextRef = useRef(handleNext)
  handleNextRef.current = handleNext
  const currentFieldRef = useRef(currentField)
  currentFieldRef.current = currentField

  // Stable callback so FieldRenderer's useEffect doesn't re-fire every render
  const handleValidation = useCallback((result: ValidationResult) => {
    const fieldId = currentFieldRef.current?.id
    if (!fieldId) return
    setValidationErrors(prev => {
      const existing = prev[fieldId]
      // Bail out if errors haven't actually changed
      if (existing && existing.length === result.errors.length &&
          existing.every((e, i) => e === result.errors[i])) {
        return prev
      }
      return { ...prev, [fieldId]: result.errors }
    })
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.shiftKey) return
      // Let Enter insert newlines in long text / textarea fields
      if (currentFieldRef.current?.type === 'long_text') return
      e.preventDefault()
      handleNextRef.current()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Animation helpers — use direct props instead of variants to avoid
  // React Strict Mode + Framer Motion v12 conflict where animations get stuck
  const enterY = direction > 0 ? 30 : -30
  const exitY = direction > 0 ? -30 : 30

  // Thank you screen (show default if none configured)
  if (isSubmitted && thankYouScreen?.enabled !== false) {
    return (
      <ThankYouScreen
        title={thankYouScreen?.title}
        description={thankYouScreen?.description}
      />
    )
  }

  // Welcome screen
  if (currentIndex === -1 && welcomeScreen?.enabled) {
    return (
      <WelcomeScreen
        title={welcomeScreen.title}
        description={welcomeScreen.description}
        buttonText={welcomeScreen.buttonText}
        onStart={handleNext}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Progress bar */}
      {showProgressBar && (
        <div className={`fixed left-0 right-0 z-10 ${progressBarClassName || 'top-0'}`}>
          <Progress value={progress} showLabel={false} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4 pt-8">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait" initial={false}>
            {currentField && (
              <motion.div
                key={currentField.id}
                initial={{ opacity: 0, y: enterY }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: exitY }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="space-y-6"
              >
                {/* Question */}
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    {showQuestionNumbers && (
                      <span className="text-lg font-medium text-primary">
                        {currentIndex + 1}
                        <span className="text-text-secondary">→</span>
                      </span>
                    )}
                    <div className="flex-1">
                      <h2 className="text-2xl font-semibold text-text-primary">
                        {currentField.title || 'Untitled Question'}
                        {currentField.isRequired && (
                          <span className="text-error ml-1">*</span>
                        )}
                      </h2>
                      {currentField.description && (
                        <p className="text-text-secondary mt-2">
                          {currentField.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Field input */}
                <div className="mt-6">
                  <FieldRenderer
                    field={currentField}
                    value={answers[currentField.id]}
                    onChange={handleAnswerChange}
                    showValidation={showValidation}
                    onValidation={handleValidation}
                  />
                </div>

                {/* Navigation hint */}
                <p className="text-sm text-text-secondary">
                  Press <kbd className="px-2 py-1 bg-surface rounded text-xs font-mono">Enter ↵</kbd> to continue
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur border-t border-border">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            {allowNavigation && currentIndex > (welcomeScreen?.enabled ? -1 : 0) && (
              <Button variant="ghost" onClick={handleBack}>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </Button>
            )}
          </div>

          <Button
            onClick={handleNext}
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {currentIndex === fields.length - 1 ? 'Submit' : 'Next'}
            {currentIndex !== fields.length - 1 && (
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FormRenderer
