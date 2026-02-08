'use client'

import { HTMLAttributes } from 'react'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

/**
 * Skeleton loading placeholder component
 */
const Skeleton = ({
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
  className = '',
  style,
  ...props
}: SkeletonProps) => {
  const baseClasses = 'bg-border'

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg'
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'skeleton-wave',
    none: ''
  }

  const computedStyle = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
    height: height ? (typeof height === 'number' ? `${height}px` : height) : variant === 'text' ? '1em' : '100%',
    ...style
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={computedStyle}
      {...props}
    />
  )
}

/**
 * Skeleton text with multiple lines
 */
export const SkeletonText = ({
  lines = 3,
  lastLineWidth = '60%',
  className = ''
}: {
  lines?: number
  lastLineWidth?: string
  className?: string
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height={16}
          width={i === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  )
}

/**
 * Skeleton avatar
 */
export const SkeletonAvatar = ({
  size = 40,
  className = ''
}: {
  size?: number
  className?: string
}) => {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      className={className}
    />
  )
}

/**
 * Skeleton card
 */
export const SkeletonCard = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`p-4 border border-border rounded-lg ${className}`}>
      <div className="flex items-start gap-4 mb-4">
        <SkeletonAvatar />
        <div className="flex-1">
          <Skeleton variant="text" height={20} width="60%" className="mb-2" />
          <Skeleton variant="text" height={14} width="40%" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  )
}

/**
 * Skeleton table row
 */
export const SkeletonTableRow = ({
  columns = 4,
  className = ''
}: {
  columns?: number
  className?: string
}) => {
  return (
    <tr className={className}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton variant="text" height={16} width={`${60 + Math.random() * 40}%`} />
        </td>
      ))}
    </tr>
  )
}

/**
 * Skeleton form field
 */
export const SkeletonFormField = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <Skeleton variant="text" height={14} width="30%" />
      <Skeleton variant="rounded" height={40} />
    </div>
  )
}

/**
 * Skeleton form builder preview
 */
export const SkeletonFormBuilder = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`flex gap-4 h-full ${className}`}>
      {/* Left panel */}
      <div className="w-64 p-4 border-r border-border space-y-3">
        <Skeleton variant="text" height={20} width="60%" className="mb-4" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={60} />
        ))}
      </div>
      {/* Center panel */}
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
      {/* Right panel */}
      <div className="w-80 p-4 border-l border-border space-y-4">
        <Skeleton variant="text" height={20} width="50%" className="mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonFormField key={i} />
        ))}
      </div>
    </div>
  )
}

export default Skeleton
