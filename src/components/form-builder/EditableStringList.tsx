'use client'

import Input from '@/components/ui/input'
import Button from '@/components/ui/button'

interface EditableStringListProps {
  label: string
  items: string[]
  defaults: string[]
  itemLabel: string
  onItemsChange: (items: string[]) => void
}

export default function EditableStringList({
  label,
  items,
  defaults,
  itemLabel,
  onItemsChange,
}: EditableStringListProps) {
  const currentItems = items.length > 0 ? items : defaults

  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1">{label}</label>
      <div className="space-y-2">
        {currentItems.map((item: string, index: number) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => {
                const newItems = [...currentItems]
                newItems[index] = e.target.value
                onItemsChange(newItems)
              }}
              placeholder={`${itemLabel} ${index + 1}`}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newItems = currentItems.filter((_: string, i: number) => i !== index)
                onItemsChange(newItems)
              }}
              className="flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        ))}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="w-full mt-2"
        onClick={() => {
          onItemsChange([...currentItems, `${itemLabel} ${currentItems.length + 1}`])
        }}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add {itemLabel}
      </Button>
    </div>
  )
}
