'use client'

import { useEffect, useRef, useCallback, RefObject } from 'react'

/**
 * Focus Trap Hook
 *
 * Traps focus within a container element for accessibility.
 * Used in modals, dialogs, and other overlay components.
 */

interface UseFocusTrapOptions {
  enabled?: boolean
  initialFocus?: RefObject<HTMLElement>
  returnFocus?: boolean
}

export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  options: UseFocusTrapOptions = {}
): RefObject<T | null> {
  const { enabled = true, initialFocus, returnFocus = true } = options
  const containerRef = useRef<T | null>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Get all focusable elements within the container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')

    const elements = containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
    return Array.from(elements).filter(el => {
      // Filter out elements that are not visible
      const style = getComputedStyle(el)
      return style.display !== 'none' && style.visibility !== 'hidden'
    })
  }, [])

  // Handle Tab key navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled || event.key !== 'Tab') return

    const focusableElements = getFocusableElements()
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    const activeElement = document.activeElement as HTMLElement

    if (!firstElement || !lastElement) return

    // Shift + Tab on first element -> go to last
    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
    }
    // Tab on last element -> go to first
    else if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
    // If focus is outside container, move it inside
    else if (!containerRef.current?.contains(activeElement)) {
      event.preventDefault()
      firstElement.focus()
    }
  }, [enabled, getFocusableElements])

  // Set initial focus when enabled
  useEffect(() => {
    if (!enabled) return

    // Store currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement

    // Set initial focus
    const setInitialFocus = () => {
      if (initialFocus?.current) {
        initialFocus.current.focus()
      } else {
        const focusableElements = getFocusableElements()
        const firstElement = focusableElements[0]
        if (firstElement) {
          firstElement.focus()
        } else {
          // Focus the container itself if no focusable elements
          containerRef.current?.focus()
        }
      }
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(setInitialFocus, 0)

    return () => {
      clearTimeout(timer)

      // Return focus when disabled/unmounted
      if (returnFocus && previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [enabled, initialFocus, returnFocus, getFocusableElements])

  // Add event listener
  useEffect(() => {
    if (!enabled) return

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [enabled, handleKeyDown])

  return containerRef
}

export default useFocusTrap
