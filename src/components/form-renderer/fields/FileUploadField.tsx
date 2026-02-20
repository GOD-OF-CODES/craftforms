import { FieldInputProps } from './types'

export default function FileUploadField({ field, value, onChange, onBlur }: FieldInputProps) {
  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
        ${value ? 'border-success bg-success/10' : 'border-border hover:border-primary'}
      `}
    >
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onChange(file)
        }}
        onBlur={onBlur}
        accept={field.properties.fileTypes}
        className="hidden"
        id={`file-${field.id}`}
      />
      <label htmlFor={`file-${field.id}`} className="cursor-pointer">
        {value ? (
          <>
            <svg
              className="w-12 h-12 mx-auto mb-3 text-success"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium text-text-primary mb-1">
              {value instanceof File ? value.name : 'File uploaded'}
            </p>
            <p className="text-xs text-text-secondary">Click to change file</p>
          </>
        ) : (
          <>
            <svg
              className="w-12 h-12 mx-auto mb-3 text-text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm font-medium text-text-primary mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-text-secondary">
              {field.properties.fileTypes || 'All file types'} • Max{' '}
              {field.properties.maxSize || '10'}MB
            </p>
          </>
        )}
      </label>
    </div>
  )
}
