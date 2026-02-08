import { ImgHTMLAttributes } from 'react'

export interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string
}

const Avatar = ({ size = 'md', fallback, src, alt, className = '', ...props }: AvatarProps) => {
  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  }

  const initials = fallback
    ? fallback
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : alt
    ? alt
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  return (
    <div
      className={`
        relative inline-flex items-center justify-center rounded-full overflow-hidden
        bg-surface border border-border
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {src ? (
        <img
          src={src}
          alt={alt || 'Avatar'}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
          }}
          {...props}
        />
      ) : (
        <span className="font-medium text-text-primary select-none">
          {initials}
        </span>
      )}
    </div>
  )
}

Avatar.displayName = 'Avatar'

export default Avatar
