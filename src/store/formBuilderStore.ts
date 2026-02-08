import { create } from 'zustand'

export type FieldType =
  | 'short_text'
  | 'long_text'
  | 'email'
  | 'number'
  | 'multiple_choice'
  | 'checkboxes'
  | 'dropdown'
  | 'yes_no'
  | 'rating'
  | 'opinion_scale'
  | 'date'
  | 'phone'
  | 'url'
  | 'legal'
  | 'file_upload'
  | 'ranking'
  | 'matrix'
  | 'payment'

export interface FormField {
  id: string
  type: FieldType
  title: string
  description?: string
  isRequired: boolean
  properties: Record<string, any>
  orderIndex: number
}

export interface FormBuilderState {
  formId: string | null
  formTitle: string
  formDescription: string
  fields: FormField[]
  selectedFieldId: string | null

  // Actions
  setFormId: (id: string) => void
  setFormTitle: (title: string) => void
  setFormDescription: (description: string) => void
  addField: (field: FormField) => void
  updateField: (id: string, updates: Partial<FormField>) => void
  removeField: (id: string) => void
  duplicateField: (id: string) => void
  reorderFields: (startIndex: number, endIndex: number) => void
  selectField: (id: string | null) => void
  reset: () => void
}

const initialState = {
  formId: null,
  formTitle: 'Untitled Form',
  formDescription: '',
  fields: [],
  selectedFieldId: null,
}

export const useFormBuilderStore = create<FormBuilderState>((set) => ({
  ...initialState,

  setFormId: (id) => set({ formId: id }),

  setFormTitle: (title) => set({ formTitle: title }),

  setFormDescription: (description) => set({ formDescription: description }),

  addField: (field) =>
    set((state) => ({
      fields: [...state.fields, field],
      selectedFieldId: field.id,
    })),

  updateField: (id, updates) =>
    set((state) => ({
      fields: state.fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      ),
    })),

  removeField: (id) =>
    set((state) => ({
      fields: state.fields.filter((field) => field.id !== id),
      selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId,
    })),

  duplicateField: (id) =>
    set((state) => {
      const fieldIndex = state.fields.findIndex((f) => f.id === id)
      if (fieldIndex === -1) return state

      const originalField = state.fields[fieldIndex]
      if (!originalField) return state

      const duplicatedField: FormField = {
        ...originalField,
        id: `field-${Date.now()}`,
        title: originalField.title ? `${originalField.title} (copy)` : '',
        orderIndex: originalField.orderIndex + 1,
        properties: { ...originalField.properties },
      }

      const newFields = [...state.fields]
      newFields.splice(fieldIndex + 1, 0, duplicatedField)

      // Update order indices for fields after the insertion
      const updatedFields = newFields.map((field, index) => ({
        ...field,
        orderIndex: index,
      }))

      return {
        fields: updatedFields,
        selectedFieldId: duplicatedField.id,
      }
    }),

  reorderFields: (startIndex, endIndex) =>
    set((state) => {
      const result = Array.from(state.fields)
      const [removed] = result.splice(startIndex, 1)
      if (removed) {
        result.splice(endIndex, 0, removed)
      }
      return { fields: result }
    }),

  selectField: (id) => set({ selectedFieldId: id }),

  reset: () => set(initialState),
}))
