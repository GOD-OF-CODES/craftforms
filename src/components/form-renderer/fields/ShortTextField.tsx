import Input from '@/components/ui/input'
import { FieldInputProps } from './types'

export default function ShortTextField({ field, value, onChange, onBlur, showErrors, firstError }: FieldInputProps) {
  return (
    <Input
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={field.properties.placeholder || 'Type your answer here...'}
      maxLength={field.properties.maxLength}
      error={showErrors ? firstError : undefined}
    />
  )
}
