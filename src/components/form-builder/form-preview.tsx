'use client'

import { FormField } from '@/store/formBuilderStore'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'

interface ScreenData {
  id?: string
  type: 'welcome' | 'thank_you'
  title: string
  description?: string
  buttonText?: string
  mediaUrl?: string
  properties: {
    enabled?: boolean
    showSocialShare?: boolean
    redirectUrl?: string
    redirectDelay?: number
    showResponseSummary?: boolean
  }
}

interface FormPreviewProps {
  fields: FormField[]
  selectedFieldId: string | null
  onFieldSelect: (id: string | null) => void
  welcomeScreen?: ScreenData | null
  thankYouScreen?: ScreenData | null
  selectedScreen?: 'welcome' | 'thank_you' | null
}

const FormPreview = ({ fields, selectedFieldId, onFieldSelect, welcomeScreen, thankYouScreen, selectedScreen }: FormPreviewProps) => {
  // Screen Preview Component
  const ScreenPreview = ({ screen, type }: { screen: ScreenData | null | undefined; type: 'welcome' | 'thank_you' }) => {
    const isSelected = selectedScreen === type
    const isEnabled = screen?.properties?.enabled !== false

    if (!isEnabled && !screen) {
      return (
        <div
          onClick={() => onFieldSelect(null)}
          className={`
            p-6 rounded-lg border-2 border-dashed cursor-pointer transition-all
            ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-border/60 bg-surface/50'}
          `}
        >
          <div className="text-center text-text-secondary">
            <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {type === 'welcome' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
            <p className="text-sm">Click to configure {type === 'welcome' ? 'Welcome' : 'Thank You'} screen</p>
          </div>
        </div>
      )
    }

    return (
      <div
        onClick={() => onFieldSelect(null)}
        className={`
          p-6 rounded-lg border-2 cursor-pointer transition-all
          ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-border/60 bg-surface'}
          ${!isEnabled ? 'opacity-50' : ''}
        `}
      >
        <div className="flex items-center justify-between mb-2">
          <Badge variant={type === 'welcome' ? 'info' : 'success'}>
            {type === 'welcome' ? 'Welcome Screen' : 'Thank You Screen'}
          </Badge>
          {!isEnabled && <Badge variant="warning">Disabled</Badge>}
        </div>
        <h4 className="text-lg font-semibold text-text-primary mb-1">
          {screen?.title || (type === 'welcome' ? 'Welcome!' : 'Thank you!')}
        </h4>
        {screen?.description && (
          <p className="text-sm text-text-secondary mb-3">{screen.description}</p>
        )}
        {type === 'welcome' && screen?.buttonText && (
          <Button size="sm" variant="secondary">{screen.buttonText}</Button>
        )}
      </div>
    )
  }

  if (fields.length === 0 && !welcomeScreen && !thankYouScreen) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Start Building Your Form
          </h3>
          <p className="text-text-secondary">
            Click on a field type from the left panel to add it to your form
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-background p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Welcome Screen */}
        <ScreenPreview screen={welcomeScreen} type="welcome" />

        {/* Fields */}
        {fields.map((field, index) => (
          <div
            key={field.id}
            onClick={() => onFieldSelect(field.id)}
            className={`
              p-6 rounded-lg border-2 cursor-pointer transition-all
              ${
                selectedFieldId === field.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-border/60 bg-surface'
              }
            `}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-secondary">
                  {index + 1}
                </span>
                <Badge variant="default">{field.type.replace('_', ' ')}</Badge>
              </div>
              {field.isRequired && <Badge variant="error">Required</Badge>}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-text-primary">
                {field.title || 'Untitled Question'}
              </h3>
              {field.description && (
                <p className="text-sm text-text-secondary">{field.description}</p>
              )}
            </div>

            {/* Field Type Preview */}
            <div className="mt-4">
              {field.type === 'short_text' && (
                <div className="border border-border rounded-lg p-3 text-sm text-text-secondary">
                  {field.properties.placeholder || 'Type your answer here...'}
                </div>
              )}
              {field.type === 'long_text' && (
                <div className="border border-border rounded-lg p-3 text-sm text-text-secondary min-h-[100px]">
                  {field.properties.placeholder || 'Type your answer here...'}
                </div>
              )}
              {(field.type === 'email' || field.type === 'url' || field.type === 'phone') && (
                <div className="border border-border rounded-lg p-3 text-sm text-text-secondary">
                  {field.properties.placeholder || (field.type === 'email' ? 'name@example.com' : field.type === 'phone' ? '+1 (555) 000-0000' : 'https://example.com')}
                </div>
              )}
              {field.type === 'number' && (
                <div className="border border-border rounded-lg p-3 text-sm text-text-secondary">
                  {field.properties.placeholder || '0'}
                  {(field.properties.min || field.properties.max) && (
                    <div className="text-xs mt-1">
                      {field.properties.min && `Min: ${field.properties.min}`}
                      {field.properties.min && field.properties.max && ' • '}
                      {field.properties.max && `Max: ${field.properties.max}`}
                    </div>
                  )}
                </div>
              )}
              {(field.type === 'multiple_choice' || field.type === 'checkboxes') && (
                <div className="space-y-2">
                  {(field.properties.options || ['Option 1', 'Option 2', 'Option 3']).map((option: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-surface transition-colors cursor-pointer">
                      <div className={`w-4 h-4 border-2 border-border ${field.type === 'multiple_choice' ? 'rounded-full' : 'rounded'}`} />
                      <span className="text-sm text-text-primary">{option}</span>
                    </div>
                  ))}
                  {field.type === 'checkboxes' && (field.properties.minSelections || field.properties.maxSelections) && (
                    <p className="text-xs text-text-secondary mt-2">
                      {field.properties.minSelections && `Min: ${field.properties.minSelections} selections`}
                      {field.properties.minSelections && field.properties.maxSelections && ' • '}
                      {field.properties.maxSelections && `Max: ${field.properties.maxSelections} selections`}
                    </p>
                  )}
                </div>
              )}
              {field.type === 'dropdown' && (
                <div className="border border-border rounded-lg p-3 text-sm text-text-secondary flex items-center justify-between cursor-pointer hover:bg-surface transition-colors">
                  <span>Select an option...</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}
              {field.type === 'yes_no' && (
                <div className="flex gap-3">
                  <Button variant="secondary">{field.properties.yesLabel || 'Yes'}</Button>
                  <Button variant="secondary">{field.properties.noLabel || 'No'}</Button>
                </div>
              )}
              {field.type === 'rating' && (
                <div className="flex gap-2">
                  {Array.from({ length: field.properties.ratingMax || 5 }).map((_, idx) => (
                    <button key={idx} className="w-10 h-10 flex items-center justify-center text-text-secondary hover:text-warning transition-colors">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
              {field.type === 'opinion_scale' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    {[...Array((field.properties.scaleMax || 10) - (field.properties.scaleMin || 0) + 1)].map((_, idx) => {
                      const value = (field.properties.scaleMin || 0) + idx
                      return (
                        <button
                          key={idx}
                          className="w-10 h-10 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/10 transition-colors text-sm font-medium text-text-primary"
                        >
                          {value}
                        </button>
                      )
                    })}
                  </div>
                  {(field.properties.scaleMinLabel || field.properties.scaleMaxLabel) && (
                    <div className="flex justify-between text-xs text-text-secondary">
                      <span>{field.properties.scaleMinLabel || ''}</span>
                      <span>{field.properties.scaleMaxLabel || ''}</span>
                    </div>
                  )}
                </div>
              )}
              {field.type === 'date' && (
                <div className="border border-border rounded-lg p-3 text-sm text-text-secondary">
                  MM / DD / YYYY
                </div>
              )}
              {field.type === 'phone' && (
                <div className="flex gap-2">
                  <div className="border border-border rounded-lg p-3 text-sm text-text-secondary w-24">
                    +1
                  </div>
                  <div className="flex-1 border border-border rounded-lg p-3 text-sm text-text-secondary">
                    (555) 000-0000
                  </div>
                </div>
              )}
              {field.type === 'legal' && (
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 border-2 border-border rounded flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-text-primary">
                      {field.properties.legalText || 'I agree to the terms and conditions'}
                    </p>
                  </div>
                </div>
              )}
              {field.type === 'file_upload' && (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <svg className="w-12 h-12 mx-auto mb-3 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm font-medium text-text-primary mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-text-secondary">
                    {field.properties.fileTypes || 'All file types'} • Max {field.properties.maxSize || '10'}MB
                  </p>
                </div>
              )}
              {field.type === 'ranking' && (
                <div className="space-y-2">
                  {(field.properties.items || ['Item 1', 'Item 2', 'Item 3']).map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-3 border border-border rounded-lg bg-surface cursor-move">
                      <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      <span className="flex-1 text-sm text-text-primary">{item}</span>
                      <span className="text-xs font-medium text-text-secondary">#{idx + 1}</span>
                    </div>
                  ))}
                </div>
              )}
              {field.type === 'matrix' && (
                <div className="overflow-x-auto">
                  <table className="w-full border border-border rounded-lg">
                    <thead>
                      <tr className="bg-surface">
                        <th className="border-b border-r border-border p-3 text-left text-sm font-medium text-text-primary"></th>
                        {(field.properties.columns || ['Column 1', 'Column 2']).map((col: string, idx: number) => (
                          <th key={idx} className="border-b border-border p-3 text-center text-sm font-medium text-text-primary">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(field.properties.rows || ['Row 1', 'Row 2']).map((row: string, rowIdx: number) => (
                        <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-background' : 'bg-surface'}>
                          <td className="border-r border-border p-3 text-sm text-text-primary font-medium">{row}</td>
                          {(field.properties.columns || ['Column 1', 'Column 2']).map((_: string, colIdx: number) => (
                            <td key={colIdx} className="border-border p-3 text-center">
                              <div className="w-4 h-4 border-2 border-border rounded-full mx-auto" />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {field.type === 'payment' && (
                <div className="border border-border rounded-lg p-6 bg-surface">
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        Amount: ${field.properties.amount || '0.00'}
                      </p>
                      <p className="text-xs text-text-secondary">Payment integration coming soon</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Thank You Screen */}
        <ScreenPreview screen={thankYouScreen} type="thank_you" />
      </div>
    </div>
  )
}

export default FormPreview
