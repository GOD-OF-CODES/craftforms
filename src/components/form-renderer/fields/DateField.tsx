import Input from '@/components/ui/input'
import { FieldInputProps } from './types'

export default function DateField({ field, value, onChange, onBlur, showErrors, firstError }: FieldInputProps) {
  return (
    <Input
      type="date"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      min={field.properties.minDate}
      max={field.properties.maxDate}
      error={showErrors ? firstError : undefined}
    />
  )
}
