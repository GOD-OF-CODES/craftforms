import { HTMLAttributes } from 'react'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'game-success' | 'game-default' | 'game-warning' | 'game-info' | 'dashboard-success' | 'dashboard-default' | 'dashboard-warning' | 'dashboard-info'
}

const Badge = ({ variant = 'default', className = '', children, ...props }: BadgeProps) => {
  const isGame = variant.startsWith('game-')

  const variantStyles = {
    default: 'bg-surface text-text-primary border-border',
    success: 'bg-success/10 text-success border-success/20',
    error: 'bg-error/10 text-error border-error/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    info: 'bg-info/10 text-info border-info/20',
    'game-success': 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.85)]',
    'game-default': 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.85)]',
    'game-warning': 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.85)]',
    'game-info': 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.85)]',
    'dashboard-success': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'dashboard-default': 'bg-gray-100 text-gray-600 border-gray-200',
    'dashboard-warning': 'bg-amber-50 text-amber-700 border-amber-200',
    'dashboard-info': 'bg-blue-50 text-blue-700 border-blue-200',
  }

  const shapeClass = isGame ? 'rounded-lg font-bold' : 'rounded-full font-medium'

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 text-xs border
        ${shapeClass}
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  )
}

Badge.displayName = 'Badge'

export default Badge
