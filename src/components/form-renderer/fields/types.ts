export interface FieldConfig {
  id: string
  type: string
  title: string
  description?: string
  isRequired: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: Record<string, any>
}

export interface FieldInputProps {
  field: FieldConfig
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any) => void
  onBlur: () => void
  showErrors: boolean
  firstError?: string
}
