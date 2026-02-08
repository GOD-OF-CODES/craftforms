'use client'

import { useEffect, useCallback, useRef } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean // Cmd on Mac
  action: () => void
  description: string
  context?: 'form-builder' | 'global'
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
  context?: 'form-builder' | 'global'
}

/**
 * Hook for managing keyboard shortcuts
 */
export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
  context = 'global'
}: UseKeyboardShortcutsOptions) {
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Only allow Escape in inputs
      if (event.key !== 'Escape') return
    }

    for (const shortcut of shortcutsRef.current) {
      // Check context
      if (shortcut.context && shortcut.context !== context) continue

      // Check key match
      if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) continue

      // Check modifiers
      const ctrlOrCmd = event.ctrlKey || event.metaKey
      const needsCtrlOrCmd = shortcut.ctrl || shortcut.meta

      if (needsCtrlOrCmd && !ctrlOrCmd) continue
      if (!needsCtrlOrCmd && ctrlOrCmd) continue
      if (shortcut.shift && !event.shiftKey) continue
      if (!shortcut.shift && event.shiftKey) continue
      if (shortcut.alt && !event.altKey) continue
      if (!shortcut.alt && event.altKey) continue

      // Execute action
      event.preventDefault()
      shortcut.action()
      return
    }
  }, [enabled, context])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * Creates form builder specific shortcuts
 */
export function createFormBuilderShortcuts(handlers: {
  onSave?: () => void
  onPreview?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onDuplicate?: () => void
  onDelete?: () => void
  onEscape?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}): KeyboardShortcut[] {
  const shortcuts: KeyboardShortcut[] = []

  if (handlers.onSave) {
    shortcuts.push({
      key: 's',
      ctrl: true,
      action: handlers.onSave,
      description: 'Save form',
      context: 'form-builder'
    })
  }

  if (handlers.onPreview) {
    shortcuts.push({
      key: 'p',
      ctrl: true,
      action: handlers.onPreview,
      description: 'Preview form',
      context: 'form-builder'
    })
  }

  if (handlers.onUndo) {
    shortcuts.push({
      key: 'z',
      ctrl: true,
      action: handlers.onUndo,
      description: 'Undo',
      context: 'form-builder'
    })
  }

  if (handlers.onRedo) {
    shortcuts.push({
      key: 'z',
      ctrl: true,
      shift: true,
      action: handlers.onRedo,
      description: 'Redo',
      context: 'form-builder'
    })
    shortcuts.push({
      key: 'y',
      ctrl: true,
      action: handlers.onRedo,
      description: 'Redo',
      context: 'form-builder'
    })
  }

  if (handlers.onDuplicate) {
    shortcuts.push({
      key: 'd',
      ctrl: true,
      action: handlers.onDuplicate,
      description: 'Duplicate selected field',
      context: 'form-builder'
    })
  }

  if (handlers.onDelete) {
    shortcuts.push({
      key: 'Delete',
      action: handlers.onDelete,
      description: 'Delete selected field',
      context: 'form-builder'
    })
    shortcuts.push({
      key: 'Backspace',
      action: handlers.onDelete,
      description: 'Delete selected field',
      context: 'form-builder'
    })
  }

  if (handlers.onEscape) {
    shortcuts.push({
      key: 'Escape',
      action: handlers.onEscape,
      description: 'Close modal/panel or deselect',
      context: 'form-builder'
    })
  }

  if (handlers.onMoveUp) {
    shortcuts.push({
      key: 'ArrowUp',
      action: handlers.onMoveUp,
      description: 'Move to previous field',
      context: 'form-builder'
    })
  }

  if (handlers.onMoveDown) {
    shortcuts.push({
      key: 'ArrowDown',
      action: handlers.onMoveDown,
      description: 'Move to next field',
      context: 'form-builder'
    })
  }

  return shortcuts
}

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = []

  // Detect if Mac
  const isMac = typeof navigator !== 'undefined' &&
    navigator.platform.toLowerCase().includes('mac')

  if (shortcut.ctrl || shortcut.meta) {
    parts.push(isMac ? '⌘' : 'Ctrl')
  }
  if (shortcut.shift) {
    parts.push(isMac ? '⇧' : 'Shift')
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt')
  }

  // Format key name
  let keyName = shortcut.key
  if (keyName === 'ArrowUp') keyName = '↑'
  else if (keyName === 'ArrowDown') keyName = '↓'
  else if (keyName === 'ArrowLeft') keyName = '←'
  else if (keyName === 'ArrowRight') keyName = '→'
  else if (keyName === 'Escape') keyName = 'Esc'
  else if (keyName === 'Delete') keyName = 'Del'
  else if (keyName === 'Backspace') keyName = '⌫'
  else keyName = keyName.toUpperCase()

  parts.push(keyName)

  return parts.join(isMac ? '' : '+')
}

export default useKeyboardShortcuts
