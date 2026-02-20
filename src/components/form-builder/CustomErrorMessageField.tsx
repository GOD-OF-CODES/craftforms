'use client'

import Input from '@/components/ui/input'
import Label from '@/components/ui/label'

interface CustomErrorMessageFieldProps {
  id: string
  value: string
  placeholder: string
  onChange: (value: string | undefined) => void
}

export default function CustomErrorMessageField({
  id,
  value,
  placeholder,
  onChange,
}: CustomErrorMessageFieldProps) {
  return (
    <>
      <div className="pt-4 border-t border-border">
        <h3 className="text-sm font-medium text-text-primary mb-3">Validation</h3>
      </div>
      <div>
        <Label htmlFor={id}>Custom Error Message</Label>
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value || undefined)}
          placeholder={placeholder}
        />
      </div>
    </>
  )
}
