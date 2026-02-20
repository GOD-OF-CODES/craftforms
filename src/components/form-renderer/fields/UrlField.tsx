import Input from '@/components/ui/input'
import { FieldInputProps } from './types'

export default function UrlField({ field, value, onChange, onBlur, showErrors, firstError }: FieldInputProps) {
  return (
    <Input
      type="url"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={field.properties.placeholder || 'https://example.com'}
      error={showErrors ? firstError : undefined}
    />
  )
}
