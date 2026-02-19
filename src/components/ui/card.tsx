import { HTMLAttributes, forwardRef } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated' | 'game' | 'game-sm' | 'dashboard'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-surface border border-border',
      bordered: 'bg-background border-2 border-border',
      elevated: 'bg-background shadow-lg border border-border/50',
      game: 'bg-white game-card',
      'game-sm': 'bg-white game-card-sm',
      dashboard: 'bg-white dashboard-card',
    }

    return (
      <div
        ref={ref}
        className={`rounded-lg p-6 ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card
