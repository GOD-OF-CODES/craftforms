import Button from '@/components/ui/button'
import { FieldInputProps } from './types'

export default function YesNoField({ field, value, onChange }: FieldInputProps) {
  return (
    <div className="flex gap-4">
      <Button
        variant={value === true ? 'primary' : 'secondary'}
        size="lg"
        className="flex-1"
        onClick={() => onChange(true)}
      >
        {field.properties.yesLabel || 'Yes'}
      </Button>
      <Button
        variant={value === false ? 'primary' : 'secondary'}
        size="lg"
        className="flex-1"
        onClick={() => onChange(false)}
      >
        {field.properties.noLabel || 'No'}
      </Button>
    </div>
  )
}
