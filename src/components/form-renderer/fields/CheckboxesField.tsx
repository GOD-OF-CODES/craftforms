import { motion } from 'framer-motion'
import Checkbox from '@/components/ui/checkbox'
import { FieldInputProps } from './types'

export default function CheckboxesField({ field, value, onChange }: FieldInputProps) {
  const selectedValues = Array.isArray(value) ? value : []
  return (
    <div className="space-y-3">
      {(field.properties.options || []).map((option: string, idx: number) => (
        <motion.button
          key={idx}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => {
            const newValue = selectedValues.includes(option)
              ? selectedValues.filter((v: string) => v !== option)
              : [...selectedValues, option]
            onChange(newValue)
          }}
          className={`
            w-full flex items-center gap-3 p-4 border-2 rounded-lg text-left transition-all
            ${selectedValues.includes(option)
              ? 'border-primary bg-primary/10 text-text-primary'
              : 'border-border hover:border-primary/50 text-text-primary'
            }
          `}
        >
          <Checkbox
            checked={selectedValues.includes(option)}
            onChange={() => {}}
          />
          <span className="flex-1">{option}</span>
        </motion.button>
      ))}
      {field.properties.minSelections || field.properties.maxSelections ? (
        <p className="text-xs text-text-secondary">
          {field.properties.minSelections && `Select at least ${field.properties.minSelections}`}
          {field.properties.minSelections && field.properties.maxSelections && ', '}
          {field.properties.maxSelections && `at most ${field.properties.maxSelections}`}
        </p>
      ) : null}
    </div>
  )
}
