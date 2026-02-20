import { motion } from 'framer-motion'
import Checkbox from '@/components/ui/checkbox'
import { FieldInputProps } from './types'

export default function LegalField({ field, value, onChange }: FieldInputProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.99 }}
      onClick={() => onChange(!value)}
      className={`
        w-full flex items-start gap-4 p-4 border-2 rounded-lg text-left transition-all
        ${value
          ? 'border-primary bg-primary/10'
          : 'border-border hover:border-primary/50'
        }
      `}
    >
      <Checkbox
        checked={value || false}
        onChange={() => onChange(!value)}
      />
      <p className="text-sm text-text-primary flex-1">
        {field.properties.legalText || 'I agree to the terms and conditions'}
      </p>
    </motion.button>
  )
}
