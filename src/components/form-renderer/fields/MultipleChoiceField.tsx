import { motion } from 'framer-motion'
import { FieldInputProps } from './types'

export default function MultipleChoiceField({ field, value, onChange }: FieldInputProps) {
  return (
    <div className="space-y-3">
      {(field.properties.options || []).map((option: string, idx: number) => (
        <motion.button
          key={idx}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onChange(option)}
          className={`
            w-full flex items-center gap-3 p-4 border-2 rounded-lg text-left transition-all
            ${value === option
              ? 'border-primary bg-primary/10 text-text-primary'
              : 'border-border hover:border-primary/50 text-text-primary'
            }
          `}
        >
          <div
            className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${value === option ? 'border-primary bg-primary' : 'border-border'}
            `}
          >
            {value === option && (
              <div className="w-2 h-2 rounded-full bg-white" />
            )}
          </div>
          <span className="flex-1">{option}</span>
        </motion.button>
      ))}
    </div>
  )
}
