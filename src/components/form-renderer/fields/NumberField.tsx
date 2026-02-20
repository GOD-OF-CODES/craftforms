import Input from '@/components/ui/input'
import { FieldInputProps } from './types'

export default function NumberField({ field, value, onChange, onBlur, showErrors, firstError }: FieldInputProps) {
  return (
    <Input
      type="number"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
      onBlur={onBlur}
      placeholder={field.properties.placeholder || '0'}
      min={field.properties.min}
      max={field.properties.max}
      step={field.properties.decimalPlaces ? Math.pow(10, -field.properties.decimalPlaces) : 1}
      error={showErrors ? firstError : undefined}
    />
  )
}
