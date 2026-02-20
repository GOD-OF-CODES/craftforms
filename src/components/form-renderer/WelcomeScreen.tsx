import { motion } from 'framer-motion'
import Button from '@/components/ui/button'

interface WelcomeScreenProps {
  title: string
  description?: string
  buttonText?: string
  onStart: () => void
}

export default function WelcomeScreen({ title, description, buttonText, onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg text-center"
      >
        <h1 className="text-4xl font-bold text-text-primary mb-4">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-text-secondary mb-8">
            {description}
          </p>
        )}
        <Button size="lg" onClick={onStart}>
          {buttonText || 'Start'}
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
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </Button>
      </motion.div>
    </div>
  )
}
