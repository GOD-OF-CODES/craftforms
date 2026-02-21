export interface FieldConfig {
  id: string
  type: string
  title: string
  description?: string
  isRequired: boolean
  properties: Record<string, any>
}

export interface FieldInputProps {
  field: FieldConfig
  value: any
  onChange: (value: any) => void
  onBlur: () => void
  showErrors: boolean
  firstError?: string
}
