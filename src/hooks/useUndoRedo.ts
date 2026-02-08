'use client'

import { useState, useCallback, useRef } from 'react'

interface UndoRedoState<T> {
  past: T[]
  present: T
  future: T[]
}

interface UseUndoRedoOptions<T> {
  initialState: T
  maxHistory?: number
}

interface UseUndoRedoReturn<T> {
  state: T
  set: (newState: T | ((prev: T) => T)) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  clear: () => void
  historySize: number
}

/**
 * Hook for managing undo/redo state
 */
export function useUndoRedo<T>({
  initialState,
  maxHistory = 50
}: UseUndoRedoOptions<T>): UseUndoRedoReturn<T> {
  const [history, setHistory] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: []
  })

  // Use ref to access latest maxHistory without causing re-renders
  const maxHistoryRef = useRef(maxHistory)
  maxHistoryRef.current = maxHistory

  const set = useCallback((newState: T | ((prev: T) => T)) => {
    setHistory(prevHistory => {
      const { past, present } = prevHistory
      const resolvedNewState = typeof newState === 'function'
        ? (newState as (prev: T) => T)(present)
        : newState

      // Don't add to history if state hasn't changed
      if (JSON.stringify(resolvedNewState) === JSON.stringify(present)) {
        return prevHistory
      }

      // Trim history if it exceeds max
      const newPast = [...past, present].slice(-maxHistoryRef.current)

      return {
        past: newPast,
        present: resolvedNewState,
        future: [] // Clear future on new action
      }
    })
  }, [])

  const undo = useCallback(() => {
    setHistory(prevHistory => {
      const { past, present, future } = prevHistory

      if (past.length === 0) return prevHistory

      const previous = past[past.length - 1]
      const newPast = past.slice(0, past.length - 1)

      return {
        past: newPast,
        present: previous!,
        future: [present, ...future]
      }
    })
  }, [])

  const redo = useCallback(() => {
    setHistory(prevHistory => {
      const { past, present, future } = prevHistory

      if (future.length === 0) return prevHistory

      const next = future[0]
      const newFuture = future.slice(1)

      return {
        past: [...past, present],
        present: next!,
        future: newFuture
      }
    })
  }, [])

  const clear = useCallback(() => {
    setHistory(prevHistory => ({
      past: [],
      present: prevHistory.present,
      future: []
    }))
  }, [])

  return {
    state: history.present,
    set,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    clear,
    historySize: history.past.length + history.future.length
  }
}

/**
 * Creates an undo/redo manager for complex state
 * Useful when you need to manage undo/redo externally (e.g., with Zustand)
 */
export class UndoRedoManager<T> {
  private past: T[] = []
  private future: T[] = []
  private maxHistory: number

  constructor(maxHistory = 50) {
    this.maxHistory = maxHistory
  }

  /**
   * Record a state change
   */
  push(state: T): void {
    this.past.push(state)

    // Trim history if it exceeds max
    if (this.past.length > this.maxHistory) {
      this.past = this.past.slice(-this.maxHistory)
    }

    // Clear future on new action
    this.future = []
  }

  /**
   * Undo to previous state
   */
  undo(currentState: T): T | null {
    if (this.past.length === 0) return null

    const previous = this.past.pop()!
    this.future.unshift(currentState)
    return previous
  }

  /**
   * Redo to next state
   */
  redo(currentState: T): T | null {
    if (this.future.length === 0) return null

    const next = this.future.shift()!
    this.past.push(currentState)
    return next
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.past.length > 0
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.future.length > 0
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.past = []
    this.future = []
  }

  /**
   * Get history size
   */
  getHistorySize(): { past: number; future: number } {
    return {
      past: this.past.length,
      future: this.future.length
    }
  }
}

export default useUndoRedo
