import Input from '@/components/ui/input'
import { FieldInputProps } from './types'

export default function EmailField({ field, value, onChange, onBlur, showErrors, firstError }: FieldInputProps) {
  return (
    <Input
      type="email"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={field.properties.placeholder || 'name@example.com'}
      error={showErrors ? firstError : undefined}
    />
  )
}
