'use client'

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react'

/**
 * Live Region for Screen Reader Announcements
 *
 * Provides a way to announce dynamic content changes to screen readers.
 */

interface LiveRegionContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void
}

const LiveRegionContext = createContext<LiveRegionContextType | null>(null)

/**
 * Hook to access the announce function
 */
export function useAnnounce() {
  const context = useContext(LiveRegionContext)
  if (!context) {
    // Return a no-op if not wrapped in provider
    return {
      announce: (message: string) => {
        console.log('[Announce]', message)
      }
    }
  }
  return context
}

/**
 * Live Region Provider
 *
 * Wrap your app with this to enable screen reader announcements.
 */
export function LiveRegionProvider({ children }: { children: ReactNode }) {
  const [politeMessage, setPoliteMessage] = useState('')
  const [assertiveMessage, setAssertiveMessage] = useState('')

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (priority === 'assertive') {
      setAssertiveMessage('')
      // Small delay to ensure the region is cleared first
      setTimeout(() => setAssertiveMessage(message), 50)
    } else {
      setPoliteMessage('')
      setTimeout(() => setPoliteMessage(message), 50)
    }
  }, [])

  // Clear messages after they've been announced
  useEffect(() => {
    if (politeMessage) {
      const timer = setTimeout(() => setPoliteMessage(''), 1000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [politeMessage])

  useEffect(() => {
    if (assertiveMessage) {
      const timer = setTimeout(() => setAssertiveMessage(''), 1000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [assertiveMessage])

  return (
    <LiveRegionContext.Provider value={{ announce }}>
      {children}
      {/* Polite announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      {/* Assertive announcements */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </LiveRegionContext.Provider>
  )
}

/**
 * Standalone Live Region Component
 *
 * Use when you need a live region without the provider context.
 */
interface LiveRegionProps {
  message: string
  priority?: 'polite' | 'assertive'
  clearAfter?: number
}

export function LiveRegion({
  message,
  priority = 'polite',
  clearAfter = 1000
}: LiveRegionProps) {
  const [currentMessage, setCurrentMessage] = useState(message)

  useEffect(() => {
    setCurrentMessage(message)
    if (message && clearAfter > 0) {
      const timer = setTimeout(() => setCurrentMessage(''), clearAfter)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [message, clearAfter])

  return (
    <div
      role={priority === 'assertive' ? 'alert' : 'status'}
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {currentMessage}
    </div>
  )
}

export default LiveRegion
