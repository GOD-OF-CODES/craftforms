import Input from '@/components/ui/input'
import { FieldInputProps } from './types'

export default function PhoneField({ field, value, onChange, onBlur, showErrors, firstError }: FieldInputProps) {
  return (
    <Input
      type="tel"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={field.properties.placeholder || '+1 (555) 000-0000'}
      error={showErrors ? firstError : undefined}
    />
  )
}
