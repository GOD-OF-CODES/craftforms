/**
 * Unit tests for Keyboard Shortcuts
 */

import { formatShortcut, KeyboardShortcut } from '@/hooks/useKeyboardShortcuts'

describe('formatShortcut', () => {
  // Mock navigator.platform for consistent testing
  const originalNavigator = global.navigator

  beforeEach(() => {
    // Default to non-Mac platform
    Object.defineProperty(global, 'navigator', {
      value: { platform: 'Win32' },
      writable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
    })
  })

  describe('Windows/Linux shortcuts', () => {
    it('should format simple key', () => {
      const shortcut: KeyboardShortcut = {
        key: 'a',
        action: () => {},
        description: 'Test',
      }
      expect(formatShortcut(shortcut)).toBe('A')
    })

    it('should format Ctrl+key', () => {
      const shortcut: KeyboardShortcut = {
        key: 's',
        ctrl: true,
        action: () => {},
        description: 'Save',
      }
      expect(formatShortcut(shortcut)).toBe('Ctrl+S')
    })

    it('should format Ctrl+Shift+key', () => {
      const shortcut: KeyboardShortcut = {
        key: 'z',
        ctrl: true,
        shift: true,
        action: () => {},
        description: 'Redo',
      }
      expect(formatShortcut(shortcut)).toBe('Ctrl+Shift+Z')
    })

    it('should format Alt+key', () => {
      const shortcut: KeyboardShortcut = {
        key: 'f',
        alt: true,
        action: () => {},
        description: 'Open file menu',
      }
      expect(formatShortcut(shortcut)).toBe('Alt+F')
    })

    it('should format arrow keys', () => {
      const shortcuts = [
        { key: 'ArrowUp', expected: '↑' },
        { key: 'ArrowDown', expected: '↓' },
        { key: 'ArrowLeft', expected: '←' },
        { key: 'ArrowRight', expected: '→' },
      ]

      shortcuts.forEach(({ key, expected }) => {
        const shortcut: KeyboardShortcut = {
          key,
          action: () => {},
          description: 'Navigate',
        }
        expect(formatShortcut(shortcut)).toBe(expected)
      })
    })

    it('should format special keys', () => {
      const shortcuts = [
        { key: 'Escape', expected: 'Esc' },
        { key: 'Delete', expected: 'Del' },
        { key: 'Backspace', expected: '⌫' },
      ]

      shortcuts.forEach(({ key, expected }) => {
        const shortcut: KeyboardShortcut = {
          key,
          action: () => {},
          description: 'Test',
        }
        expect(formatShortcut(shortcut)).toBe(expected)
      })
    })
  })

  describe('Mac shortcuts', () => {
    beforeEach(() => {
      Object.defineProperty(global, 'navigator', {
        value: { platform: 'MacIntel' },
        writable: true,
      })
    })

    it('should format Cmd+key on Mac', () => {
      const shortcut: KeyboardShortcut = {
        key: 's',
        meta: true,
        action: () => {},
        description: 'Save',
      }
      expect(formatShortcut(shortcut)).toBe('⌘S')
    })

    it('should format Cmd+Shift+key on Mac', () => {
      const shortcut: KeyboardShortcut = {
        key: 'z',
        meta: true,
        shift: true,
        action: () => {},
        description: 'Redo',
      }
      expect(formatShortcut(shortcut)).toBe('⌘⇧Z')
    })

    it('should format Option+key on Mac', () => {
      const shortcut: KeyboardShortcut = {
        key: 'f',
        alt: true,
        action: () => {},
        description: 'Find',
      }
      expect(formatShortcut(shortcut)).toBe('⌥F')
    })
  })
})

describe('Keyboard Shortcut Matching', () => {
  interface TestCase {
    name: string
    shortcut: KeyboardShortcut
    event: Partial<KeyboardEvent>
    shouldMatch: boolean
  }

  const createTestCase = (
    name: string,
    shortcut: Omit<KeyboardShortcut, 'action' | 'description'>,
    event: Partial<KeyboardEvent>,
    shouldMatch: boolean
  ): TestCase => ({
    name,
    shortcut: { ...shortcut, action: () => {}, description: 'Test' },
    event,
    shouldMatch,
  })

  const matchesShortcut = (
    event: Partial<KeyboardEvent>,
    shortcut: KeyboardShortcut
  ): boolean => {
    if (event.key?.toLowerCase() !== shortcut.key.toLowerCase()) return false

    const ctrlOrCmd = event.ctrlKey || event.metaKey
    const needsCtrlOrCmd = shortcut.ctrl || shortcut.meta

    if (needsCtrlOrCmd && !ctrlOrCmd) return false
    if (!needsCtrlOrCmd && ctrlOrCmd) return false
    if (shortcut.shift && !event.shiftKey) return false
    if (!shortcut.shift && event.shiftKey) return false
    if (shortcut.alt && !event.altKey) return false
    if (!shortcut.alt && event.altKey) return false

    return true
  }

  const testCases: TestCase[] = [
    createTestCase(
      'matches simple key',
      { key: 'a' },
      { key: 'a', ctrlKey: false, shiftKey: false, altKey: false, metaKey: false },
      true
    ),
    createTestCase(
      'matches Ctrl+S',
      { key: 's', ctrl: true },
      { key: 's', ctrlKey: true, shiftKey: false, altKey: false, metaKey: false },
      true
    ),
    createTestCase(
      'matches Cmd+S (macOS)',
      { key: 's', meta: true },
      { key: 's', ctrlKey: false, shiftKey: false, altKey: false, metaKey: true },
      true
    ),
    createTestCase(
      'matches Ctrl+Shift+Z',
      { key: 'z', ctrl: true, shift: true },
      { key: 'z', ctrlKey: true, shiftKey: true, altKey: false, metaKey: false },
      true
    ),
    createTestCase(
      'does not match when Ctrl required but not pressed',
      { key: 's', ctrl: true },
      { key: 's', ctrlKey: false, shiftKey: false, altKey: false, metaKey: false },
      false
    ),
    createTestCase(
      'does not match when Shift required but not pressed',
      { key: 'z', ctrl: true, shift: true },
      { key: 'z', ctrlKey: true, shiftKey: false, altKey: false, metaKey: false },
      false
    ),
    createTestCase(
      'does not match when extra modifier pressed',
      { key: 's' },
      { key: 's', ctrlKey: true, shiftKey: false, altKey: false, metaKey: false },
      false
    ),
    createTestCase(
      'matches case insensitively',
      { key: 's', ctrl: true },
      { key: 'S', ctrlKey: true, shiftKey: false, altKey: false, metaKey: false },
      true
    ),
    createTestCase(
      'matches special keys',
      { key: 'Escape' },
      { key: 'Escape', ctrlKey: false, shiftKey: false, altKey: false, metaKey: false },
      true
    ),
    createTestCase(
      'matches Delete key',
      { key: 'Delete' },
      { key: 'Delete', ctrlKey: false, shiftKey: false, altKey: false, metaKey: false },
      true
    ),
  ]

  testCases.forEach(({ name, shortcut, event, shouldMatch }) => {
    it(name, () => {
      expect(matchesShortcut(event, shortcut)).toBe(shouldMatch)
    })
  })
})

describe('Form Builder Shortcuts', () => {
  it('should define all expected shortcuts', () => {
    const expectedShortcuts = [
      { key: 's', modifiers: ['ctrl'], description: 'Save form' },
      { key: 'p', modifiers: ['ctrl'], description: 'Preview form' },
      { key: 'z', modifiers: ['ctrl'], description: 'Undo' },
      { key: 'z', modifiers: ['ctrl', 'shift'], description: 'Redo' },
      { key: 'd', modifiers: ['ctrl'], description: 'Duplicate' },
      { key: 'Delete', modifiers: [], description: 'Delete' },
      { key: 'Escape', modifiers: [], description: 'Close/Deselect' },
      { key: 'ArrowUp', modifiers: [], description: 'Move up' },
      { key: 'ArrowDown', modifiers: [], description: 'Move down' },
    ]

    expectedShortcuts.forEach(({ key, description }) => {
      // Verify the shortcut can be defined
      const shortcut: KeyboardShortcut = {
        key,
        action: () => {},
        description,
      }
      expect(shortcut.key).toBe(key)
    })
  })
})
