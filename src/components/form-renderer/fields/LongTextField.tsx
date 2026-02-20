import Textarea from '@/components/ui/textarea'
import { FieldInputProps } from './types'

export default function LongTextField({ field, value, onChange, onBlur, showErrors, firstError }: FieldInputProps) {
  return (
    <Textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={field.properties.placeholder || 'Type your answer here...'}
      maxLength={field.properties.maxLength}
      rows={4}
      error={showErrors ? firstError : undefined}
    />
  )
}
