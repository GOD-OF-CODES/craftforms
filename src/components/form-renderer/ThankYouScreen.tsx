import { motion } from 'framer-motion'

interface ThankYouScreenProps {
  title?: string
  description?: string
}

export default function ThankYouScreen({ title, description }: ThankYouScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md text-center"
      >
        <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-success"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-text-primary mb-4">
          {title || 'Thank you!'}
        </h1>
        {description && (
          <p className="text-lg text-text-secondary">
            {description}
          </p>
        )}
      </motion.div>
    </div>
  )
}
