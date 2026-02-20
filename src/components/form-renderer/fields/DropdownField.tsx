import { FieldInputProps } from './types'

export default function DropdownField({ field, value, onChange, onBlur }: FieldInputProps) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      className="w-full px-4 py-3 text-base rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <option value="">Select an option...</option>
      {(field.properties.options || []).map((option: string, idx: number) => (
        <option key={idx} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}
