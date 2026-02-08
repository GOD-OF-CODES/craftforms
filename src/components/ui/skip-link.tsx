'use client'

/**
 * Skip to Content Link
 *
 * Provides keyboard users a way to skip repetitive navigation
 * and jump directly to the main content.
 */

interface SkipLinkProps {
  href?: string
  children?: React.ReactNode
}

const SkipLink = ({
  href = '#main-content',
  children = 'Skip to main content'
}: SkipLinkProps) => {
  return (
    <a
      href={href}
      className="
        sr-only focus:not-sr-only
        focus:fixed focus:top-4 focus:left-4 focus:z-[100]
        focus:bg-primary focus:text-white
        focus:px-4 focus:py-2 focus:rounded-lg
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        transition-all
      "
    >
      {children}
    </a>
  )
}

export default SkipLink
