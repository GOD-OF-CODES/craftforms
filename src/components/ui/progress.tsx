import { HTMLAttributes } from 'react'

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  showLabel?: boolean
  variant?: 'default' | 'success' | 'error' | 'warning'
}

const Progress = ({
  value,
  max = 100,
  showLabel = false,
  variant = 'default',
  className = '',
  ...props
}: ProgressProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const variantStyles = {
    default: 'bg-primary',
    success: 'bg-success',
    error: 'bg-error',
    warning: 'bg-warning',
  }

  return (
    <div className={`w-full ${className}`} {...props}>
      <div className="relative w-full h-2 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ease-in-out ${variantStyles[variant]}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-xs text-text-secondary text-right">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  )
}

Progress.displayName = 'Progress'

export default Progress
