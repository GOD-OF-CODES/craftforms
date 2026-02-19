import { ButtonHTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'game' | 'game-secondary' | 'game-danger' | 'dashboard-primary' | 'dashboard-secondary' | 'dashboard-danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, className = '', children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variantStyles = {
      primary: 'bg-primary hover:bg-primary-hover text-white focus-visible:outline-primary',
      secondary: 'bg-surface hover:bg-border text-text-primary border border-border',
      ghost: 'hover:bg-surface text-text-primary',
      danger: 'bg-error hover:bg-red-600 text-white focus-visible:outline-error',
      game: 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold game-btn',
      'game-secondary': 'bg-white hover:bg-gray-50 text-gray-900 font-bold game-btn',
      'game-danger': 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold game-btn',
      'dashboard-primary': 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold shadow-md shadow-indigo-500/20',
      'dashboard-secondary': 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300',
      'dashboard-danger': 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold shadow-md shadow-red-500/20',
    }

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    const isGameVariant = variant === 'game' || variant === 'game-secondary' || variant === 'game-danger'

    const MotionButton = motion.button as any

    return (
      <MotionButton
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled || isLoading}
        whileHover={isGameVariant ? undefined : { scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={isGameVariant ? undefined : { scale: disabled || isLoading ? 1 : 0.98 }}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </>
        ) : children}
      </MotionButton>
    )
  }
)

Button.displayName = 'Button'

export default Button
