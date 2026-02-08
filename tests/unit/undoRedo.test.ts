/**
 * Unit tests for Undo/Redo functionality
 */

import { UndoRedoManager } from '@/hooks/useUndoRedo'

describe('UndoRedoManager', () => {
  let manager: UndoRedoManager<string>

  beforeEach(() => {
    manager = new UndoRedoManager<string>(10)
  })

  describe('Basic Operations', () => {
    it('should not allow undo with no history', () => {
      expect(manager.canUndo()).toBe(false)
      expect(manager.undo('current')).toBeNull()
    })

    it('should not allow redo with no future', () => {
      expect(manager.canRedo()).toBe(false)
      expect(manager.redo('current')).toBeNull()
    })

    it('should push state to history', () => {
      manager.push('state1')
      expect(manager.canUndo()).toBe(true)
    })

    it('should undo to previous state', () => {
      manager.push('state1')
      manager.push('state2')

      const result = manager.undo('state3')
      expect(result).toBe('state2')
      expect(manager.canRedo()).toBe(true)
    })

    it('should redo to next state', () => {
      manager.push('state1')
      manager.undo('state2')

      const result = manager.redo('state1')
      expect(result).toBe('state2')
    })
  })

  describe('History Management', () => {
    it('should clear future on new push', () => {
      manager.push('state1')
      manager.push('state2')
      manager.undo('state3')

      expect(manager.canRedo()).toBe(true)

      manager.push('state4')
      expect(manager.canRedo()).toBe(false)
    })

    it('should limit history to max size', () => {
      const smallManager = new UndoRedoManager<number>(3)

      smallManager.push(1)
      smallManager.push(2)
      smallManager.push(3)
      smallManager.push(4)
      smallManager.push(5)

      // History should only keep 3 items
      const sizes = smallManager.getHistorySize()
      expect(sizes.past).toBe(3)
    })

    it('should clear all history', () => {
      manager.push('state1')
      manager.push('state2')
      manager.undo('state3')

      manager.clear()

      expect(manager.canUndo()).toBe(false)
      expect(manager.canRedo()).toBe(false)
    })
  })

  describe('Complex Undo/Redo Sequences', () => {
    it('should handle multiple undos and redos', () => {
      manager.push('A')
      manager.push('B')
      manager.push('C')

      // Current state is 'D', history has A, B, C
      let result = manager.undo('D')
      expect(result).toBe('C')

      result = manager.undo('C')
      expect(result).toBe('B')

      result = manager.redo('B')
      expect(result).toBe('C')

      result = manager.redo('C')
      expect(result).toBe('D')
    })

    it('should maintain correct state after mixed operations', () => {
      manager.push('A')
      manager.push('B')

      manager.undo('C') // Back to B
      manager.push('D') // New branch, clears redo

      expect(manager.canRedo()).toBe(false)

      const undoResult = manager.undo('E')
      expect(undoResult).toBe('D')
    })
  })

  describe('Edge Cases', () => {
    it('should handle single item history', () => {
      manager.push('only')

      expect(manager.canUndo()).toBe(true)
      expect(manager.undo('current')).toBe('only')
      expect(manager.canUndo()).toBe(false)
    })

    it('should handle empty strings', () => {
      manager.push('')
      expect(manager.undo('current')).toBe('')
    })

    it('should handle complex objects', () => {
      const objectManager = new UndoRedoManager<{ name: string; value: number }>(10)

      objectManager.push({ name: 'first', value: 1 })
      objectManager.push({ name: 'second', value: 2 })

      const result = objectManager.undo({ name: 'current', value: 3 })
      expect(result).toEqual({ name: 'second', value: 2 })
    })

    it('should handle arrays', () => {
      const arrayManager = new UndoRedoManager<string[]>(10)

      arrayManager.push(['a', 'b'])
      arrayManager.push(['a', 'b', 'c'])

      const result = arrayManager.undo(['a', 'b', 'c', 'd'])
      expect(result).toEqual(['a', 'b', 'c'])
    })
  })

  describe('getHistorySize', () => {
    it('should return correct sizes', () => {
      manager.push('A')
      manager.push('B')
      manager.push('C')

      let sizes = manager.getHistorySize()
      expect(sizes.past).toBe(3)
      expect(sizes.future).toBe(0)

      manager.undo('D')
      manager.undo('C')

      sizes = manager.getHistorySize()
      expect(sizes.past).toBe(1)
      expect(sizes.future).toBe(2)
    })
  })
})

describe('Undo/Redo with Form Builder State', () => {
  interface FormState {
    title: string
    fields: { id: string; type: string }[]
  }

  let manager: UndoRedoManager<FormState>

  beforeEach(() => {
    manager = new UndoRedoManager<FormState>(20)
  })

  it('should undo field additions', () => {
    const initialState: FormState = {
      title: 'My Form',
      fields: [],
    }

    const stateWithField: FormState = {
      title: 'My Form',
      fields: [{ id: 'field-1', type: 'short_text' }],
    }

    manager.push(initialState)

    const result = manager.undo(stateWithField)
    expect(result?.fields).toHaveLength(0)
  })

  it('should undo field deletions', () => {
    const stateWithField: FormState = {
      title: 'My Form',
      fields: [{ id: 'field-1', type: 'short_text' }],
    }

    const stateWithoutField: FormState = {
      title: 'My Form',
      fields: [],
    }

    manager.push(stateWithField)

    const result = manager.undo(stateWithoutField)
    expect(result?.fields).toHaveLength(1)
    expect(result?.fields[0].id).toBe('field-1')
  })

  it('should undo title changes', () => {
    manager.push({ title: 'Original Title', fields: [] })
    manager.push({ title: 'Changed Title', fields: [] })

    const result = manager.undo({ title: 'New Title', fields: [] })
    expect(result?.title).toBe('Changed Title')

    const result2 = manager.undo({ title: 'Changed Title', fields: [] })
    expect(result2?.title).toBe('Original Title')
  })

  it('should support complex editing workflows', () => {
    // Add first field
    manager.push({
      title: 'Survey',
      fields: [{ id: 'field-1', type: 'short_text' }],
    })

    // Add second field
    manager.push({
      title: 'Survey',
      fields: [
        { id: 'field-1', type: 'short_text' },
        { id: 'field-2', type: 'email' },
      ],
    })

    // Change title
    manager.push({
      title: 'Customer Survey',
      fields: [
        { id: 'field-1', type: 'short_text' },
        { id: 'field-2', type: 'email' },
      ],
    })

    // Undo title change
    let current = {
      title: 'Customer Survey 2024',
      fields: [
        { id: 'field-1', type: 'short_text' },
        { id: 'field-2', type: 'email' },
      ],
    }

    current = manager.undo(current)!
    expect(current.title).toBe('Customer Survey')

    // Undo second field addition
    current = manager.undo(current)!
    expect(current.fields).toHaveLength(2)

    // Undo first field addition
    current = manager.undo(current)!
    expect(current.fields).toHaveLength(1)

    // Redo first field
    current = manager.redo(current)!
    expect(current.fields).toHaveLength(2)
  })
})
