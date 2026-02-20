import { motion } from 'framer-motion'
import { FieldInputProps } from './types'

export default function OpinionScaleField({ field, value, onChange }: FieldInputProps) {
  const scaleMin = field.properties.scaleMin || 0
  const scaleMax = field.properties.scaleMax || 10
  return (
    <div>
      <div className="flex items-center justify-between gap-1">
        {Array.from({ length: scaleMax - scaleMin + 1 }).map((_, idx) => {
          const scaleValue = scaleMin + idx
          return (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(scaleValue)}
              className={`
                w-10 h-10 rounded-lg border-2 transition-all text-sm font-medium
                ${value === scaleValue
                  ? 'border-primary bg-primary text-white'
                  : 'border-border hover:border-primary text-text-primary'
                }
              `}
            >
              {scaleValue}
            </motion.button>
          )
        })}
      </div>
      {(field.properties.scaleMinLabel || field.properties.scaleMaxLabel) && (
        <div className="flex justify-between text-xs text-text-secondary mt-2">
          <span>{field.properties.scaleMinLabel || ''}</span>
          <span>{field.properties.scaleMaxLabel || ''}</span>
        </div>
      )}
    </div>
  )
}
