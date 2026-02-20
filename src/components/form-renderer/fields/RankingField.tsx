import { motion } from 'framer-motion'
import { FieldInputProps } from './types'

export default function RankingField({ field, value, onChange }: FieldInputProps) {
  const items = field.properties.items || ['Item 1', 'Item 2', 'Item 3']
  const rankedItems = value || [...items]
  return (
    <div className="space-y-2">
      <p className="text-sm text-text-secondary mb-3">Drag to reorder</p>
      {rankedItems.map((item: string, index: number) => (
        <motion.div
          key={`${item}-${index}`}
          layout
          className="flex items-center gap-3 p-3 bg-surface border border-border rounded-lg cursor-move hover:border-primary transition-colors"
          draggable
          onDragStart={(e) => {
            (e as unknown as DragEvent).dataTransfer?.setData('text/plain', String(index))
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const draggedIndex = parseInt((e as unknown as DragEvent).dataTransfer?.getData('text/plain') || '-1')
            if (draggedIndex < 0 || draggedIndex === index) return
            const newOrder = [...rankedItems]
            const [removed] = newOrder.splice(draggedIndex, 1)
            newOrder.splice(index, 0, removed)
            onChange(newOrder)
          }}
        >
          <span className="text-sm font-medium text-primary w-6 text-center">
            {index + 1}
          </span>
          <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
          <span className="text-text-primary">{item}</span>
        </motion.div>
      ))}
    </div>
  )
}
