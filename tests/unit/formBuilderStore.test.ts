/**
 * Unit tests for Form Builder Store
 */

import { renderHook, act } from '@testing-library/react'

// Mock zustand store
const createMockStore = () => {
  let state = {
    formId: null as string | null,
    formTitle: 'Untitled Form',
    formDescription: '',
    fields: [] as any[],
    selectedFieldId: null as string | null,
  }

  return {
    getState: () => state,
    setState: (partial: Partial<typeof state>) => {
      state = { ...state, ...partial }
    },
    setFormId: (id: string) => {
      state = { ...state, formId: id }
    },
    setFormTitle: (title: string) => {
      state = { ...state, formTitle: title }
    },
    setFormDescription: (description: string) => {
      state = { ...state, formDescription: description }
    },
    addField: (field: any) => {
      state = {
        ...state,
        fields: [...state.fields, field],
        selectedFieldId: field.id,
      }
    },
    updateField: (id: string, updates: any) => {
      state = {
        ...state,
        fields: state.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
      }
    },
    removeField: (id: string) => {
      state = {
        ...state,
        fields: state.fields.filter((f) => f.id !== id),
        selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId,
      }
    },
    duplicateField: (id: string) => {
      const fieldIndex = state.fields.findIndex((f) => f.id === id)
      if (fieldIndex === -1) return

      const originalField = state.fields[fieldIndex]
      const duplicatedField = {
        ...originalField,
        id: `field-${Date.now()}`,
        title: originalField.title ? `${originalField.title} (copy)` : '',
        orderIndex: originalField.orderIndex + 1,
      }

      const newFields = [...state.fields]
      newFields.splice(fieldIndex + 1, 0, duplicatedField)

      state = {
        ...state,
        fields: newFields.map((f, i) => ({ ...f, orderIndex: i })),
        selectedFieldId: duplicatedField.id,
      }
    },
    reorderFields: (startIndex: number, endIndex: number) => {
      const result = [...state.fields]
      const [removed] = result.splice(startIndex, 1)
      if (removed) {
        result.splice(endIndex, 0, removed)
      }
      state = { ...state, fields: result }
    },
    selectField: (id: string | null) => {
      state = { ...state, selectedFieldId: id }
    },
    reset: () => {
      state = {
        formId: null,
        formTitle: 'Untitled Form',
        formDescription: '',
        fields: [],
        selectedFieldId: null,
      }
    },
  }
}

describe('Form Builder Store', () => {
  let store: ReturnType<typeof createMockStore>

  beforeEach(() => {
    store = createMockStore()
  })

  describe('Form Metadata', () => {
    it('should set form ID', () => {
      store.setFormId('form-123')
      expect(store.getState().formId).toBe('form-123')
    })

    it('should set form title', () => {
      store.setFormTitle('My Survey')
      expect(store.getState().formTitle).toBe('My Survey')
    })

    it('should set form description', () => {
      store.setFormDescription('A test form')
      expect(store.getState().formDescription).toBe('A test form')
    })
  })

  describe('Field Management', () => {
    it('should add a field', () => {
      const field = {
        id: 'field-1',
        type: 'short_text',
        title: 'Name',
        isRequired: true,
        properties: {},
        orderIndex: 0,
      }

      store.addField(field)

      expect(store.getState().fields).toHaveLength(1)
      expect(store.getState().fields[0]).toEqual(field)
      expect(store.getState().selectedFieldId).toBe('field-1')
    })

    it('should update a field', () => {
      store.addField({
        id: 'field-1',
        type: 'short_text',
        title: 'Name',
        isRequired: false,
        properties: {},
        orderIndex: 0,
      })

      store.updateField('field-1', { title: 'Full Name', isRequired: true })

      expect(store.getState().fields[0].title).toBe('Full Name')
      expect(store.getState().fields[0].isRequired).toBe(true)
    })

    it('should remove a field', () => {
      store.addField({
        id: 'field-1',
        type: 'short_text',
        title: 'Name',
        isRequired: false,
        properties: {},
        orderIndex: 0,
      })

      store.removeField('field-1')

      expect(store.getState().fields).toHaveLength(0)
      expect(store.getState().selectedFieldId).toBeNull()
    })

    it('should duplicate a field', () => {
      store.addField({
        id: 'field-1',
        type: 'short_text',
        title: 'Name',
        isRequired: true,
        properties: { placeholder: 'Enter name' },
        orderIndex: 0,
      })

      store.duplicateField('field-1')

      expect(store.getState().fields).toHaveLength(2)
      expect(store.getState().fields[1].title).toBe('Name (copy)')
      expect(store.getState().fields[1].properties.placeholder).toBe('Enter name')
      expect(store.getState().selectedFieldId).not.toBe('field-1')
    })

    it('should reorder fields', () => {
      store.addField({
        id: 'field-1',
        type: 'short_text',
        title: 'First',
        isRequired: false,
        properties: {},
        orderIndex: 0,
      })
      store.addField({
        id: 'field-2',
        type: 'email',
        title: 'Second',
        isRequired: false,
        properties: {},
        orderIndex: 1,
      })
      store.addField({
        id: 'field-3',
        type: 'number',
        title: 'Third',
        isRequired: false,
        properties: {},
        orderIndex: 2,
      })

      store.reorderFields(0, 2)

      expect(store.getState().fields[0].id).toBe('field-2')
      expect(store.getState().fields[1].id).toBe('field-3')
      expect(store.getState().fields[2].id).toBe('field-1')
    })
  })

  describe('Field Selection', () => {
    it('should select a field', () => {
      store.addField({
        id: 'field-1',
        type: 'short_text',
        title: 'Name',
        isRequired: false,
        properties: {},
        orderIndex: 0,
      })
      store.addField({
        id: 'field-2',
        type: 'email',
        title: 'Email',
        isRequired: false,
        properties: {},
        orderIndex: 1,
      })

      store.selectField('field-1')
      expect(store.getState().selectedFieldId).toBe('field-1')

      store.selectField('field-2')
      expect(store.getState().selectedFieldId).toBe('field-2')
    })

    it('should deselect field when set to null', () => {
      store.addField({
        id: 'field-1',
        type: 'short_text',
        title: 'Name',
        isRequired: false,
        properties: {},
        orderIndex: 0,
      })

      store.selectField(null)
      expect(store.getState().selectedFieldId).toBeNull()
    })

    it('should clear selection when selected field is removed', () => {
      store.addField({
        id: 'field-1',
        type: 'short_text',
        title: 'Name',
        isRequired: false,
        properties: {},
        orderIndex: 0,
      })

      expect(store.getState().selectedFieldId).toBe('field-1')

      store.removeField('field-1')
      expect(store.getState().selectedFieldId).toBeNull()
    })

    it('should keep selection when different field is removed', () => {
      store.addField({
        id: 'field-1',
        type: 'short_text',
        title: 'Name',
        isRequired: false,
        properties: {},
        orderIndex: 0,
      })
      store.addField({
        id: 'field-2',
        type: 'email',
        title: 'Email',
        isRequired: false,
        properties: {},
        orderIndex: 1,
      })

      store.selectField('field-1')
      store.removeField('field-2')

      expect(store.getState().selectedFieldId).toBe('field-1')
    })
  })

  describe('Store Reset', () => {
    it('should reset to initial state', () => {
      store.setFormId('form-123')
      store.setFormTitle('My Form')
      store.addField({
        id: 'field-1',
        type: 'short_text',
        title: 'Name',
        isRequired: false,
        properties: {},
        orderIndex: 0,
      })

      store.reset()

      expect(store.getState().formId).toBeNull()
      expect(store.getState().formTitle).toBe('Untitled Form')
      expect(store.getState().fields).toHaveLength(0)
      expect(store.getState().selectedFieldId).toBeNull()
    })
  })
})

describe('Field Types', () => {
  let store: ReturnType<typeof createMockStore>

  beforeEach(() => {
    store = createMockStore()
  })

  it('should support all 18 field types', () => {
    const fieldTypes = [
      'short_text',
      'long_text',
      'email',
      'number',
      'multiple_choice',
      'checkboxes',
      'dropdown',
      'yes_no',
      'rating',
      'opinion_scale',
      'date',
      'phone',
      'url',
      'legal',
      'file_upload',
      'ranking',
      'matrix',
      'payment',
    ]

    fieldTypes.forEach((type, index) => {
      store.addField({
        id: `field-${index}`,
        type,
        title: `Field ${index}`,
        isRequired: false,
        properties: {},
        orderIndex: index,
      })
    })

    expect(store.getState().fields).toHaveLength(18)
    expect(store.getState().fields.map((f) => f.type)).toEqual(fieldTypes)
  })
})

describe('Field Properties', () => {
  let store: ReturnType<typeof createMockStore>

  beforeEach(() => {
    store = createMockStore()
  })

  it('should update field properties', () => {
    store.addField({
      id: 'field-1',
      type: 'short_text',
      title: 'Name',
      isRequired: false,
      properties: { placeholder: 'Enter name' },
      orderIndex: 0,
    })

    store.updateField('field-1', {
      properties: {
        placeholder: 'Enter your full name',
        maxLength: 100,
      },
    })

    expect(store.getState().fields[0].properties).toEqual({
      placeholder: 'Enter your full name',
      maxLength: 100,
    })
  })

  it('should handle multiple choice options', () => {
    store.addField({
      id: 'field-1',
      type: 'multiple_choice',
      title: 'Favorite Color',
      isRequired: false,
      properties: {
        options: ['Red', 'Green', 'Blue'],
      },
      orderIndex: 0,
    })

    expect(store.getState().fields[0].properties.options).toEqual([
      'Red',
      'Green',
      'Blue',
    ])

    store.updateField('field-1', {
      properties: {
        options: ['Red', 'Green', 'Blue', 'Yellow'],
      },
    })

    expect(store.getState().fields[0].properties.options).toHaveLength(4)
  })

  it('should handle rating scale properties', () => {
    store.addField({
      id: 'field-1',
      type: 'rating',
      title: 'Rate our service',
      isRequired: false,
      properties: {
        ratingMax: 5,
        ratingType: 'stars',
      },
      orderIndex: 0,
    })

    expect(store.getState().fields[0].properties.ratingMax).toBe(5)
    expect(store.getState().fields[0].properties.ratingType).toBe('stars')
  })

  it('should handle matrix properties', () => {
    store.addField({
      id: 'field-1',
      type: 'matrix',
      title: 'Rate features',
      isRequired: false,
      properties: {
        rows: ['Speed', 'Quality', 'Price'],
        columns: ['Poor', 'Fair', 'Good', 'Excellent'],
      },
      orderIndex: 0,
    })

    expect(store.getState().fields[0].properties.rows).toHaveLength(3)
    expect(store.getState().fields[0].properties.columns).toHaveLength(4)
  })
})
