'use client'

import { FormField } from '@/store/formBuilderStore'

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
            rounded-2xl cursor-pointer transition-all overflow-hidden
            ${isSelected ? 'ring-4 ring-purple-400' : ''}
          `}
          style={{
            border: '3px dashed rgba(0,0,0,0.3)',
            boxShadow: isSelected ? '6px 6px 0 0 rgba(0,0,0,0.85)' : '4px 4px 0 0 rgba(0,0,0,0.3)',
          }}
        >
          <div className="p-6 bg-white/80">
            <div className="text-center text-gray-500">
              <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {type === 'welcome' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              <p className="text-sm font-semibold">Click to configure {type === 'welcome' ? 'Welcome' : 'Thank You'} screen</p>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div
        onClick={() => onFieldSelect(null)}
        className={`
          rounded-2xl cursor-pointer transition-all overflow-hidden
          ${isSelected ? 'ring-4 ring-purple-400' : ''}
          ${!isEnabled ? 'opacity-50' : ''}
        `}
        style={{
          border: '3px solid #000',
          boxShadow: isSelected ? '8px 8px 0 0 rgba(0,0,0,0.85)' : '6px 6px 0 0 rgba(0,0,0,0.85)',
        }}
      >
        {/* Header */}
        <div
          className={`px-4 py-2 flex items-center justify-between ${
            type === 'welcome'
              ? 'bg-gradient-to-r from-orange-400 to-amber-400'
              : 'bg-gradient-to-r from-green-400 to-emerald-400'
          }`}
          style={{ borderBottom: '3px solid #000' }}
        >
          <span
            className="bg-white rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1"
            style={{ border: '2px solid #000', boxShadow: '2px 2px 0 0 rgba(0,0,0,0.85)' }}
          >
            {type === 'welcome' ? '\u{1F3AE} Welcome Screen' : '\u{1F3C6} Thank You Screen'}
          </span>
          {!isEnabled && (
            <span
              className="bg-yellow-300 rounded-full px-2 py-0.5 text-xs font-bold"
              style={{ border: '1.5px solid #000' }}
            >
              Disabled
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-6 bg-white">
          <h4 className="text-lg font-bold text-gray-900 mb-1">
            {screen?.title || (type === 'welcome' ? 'Welcome!' : 'Thank you!')}
          </h4>
          {screen?.description && (
            <p className="text-sm text-gray-500 mb-3">{screen.description}</p>
          )}
          {type === 'welcome' && screen?.buttonText && (
            <span
              className="inline-flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-400 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{ border: '2px solid #000', boxShadow: '2px 2px 0 0 rgba(0,0,0,0.85)' }}
            >
              {screen.buttonText}
            </span>
          )}
        </div>
      </div>
    )
  }

  if (fields.length === 0 && !welcomeScreen && !thankYouScreen) {
    return (
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: '#00D4FF' }}>
        <div
          className="text-center max-w-md bg-white rounded-2xl p-8"
          style={{
            border: '3px solid #000',
            boxShadow: '8px 8px 0 0 rgba(0,0,0,0.85)',
          }}
        >
          <div
            className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              border: '2.5px solid #000',
              boxShadow: '4px 4px 0 0 rgba(0,0,0,0.85)',
            }}
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 mb-2">
            Start Building Your Form
          </h3>
          <p className="text-gray-500 font-medium">
            Click on a field type from the left panel to add it to your form
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto" style={{ background: '#00D4FF' }}>
      <div className="max-w-[480px] mx-auto space-y-5">
        {/* Welcome Screen */}
        <ScreenPreview screen={welcomeScreen} type="welcome" />

        {/* Fields */}
        {fields.map((field, index) => (
          <div
            key={field.id}
            onClick={() => onFieldSelect(field.id)}
            className={`
              rounded-2xl cursor-pointer transition-all overflow-hidden
              ${selectedFieldId === field.id ? 'ring-4 ring-purple-400' : ''}
            `}
            style={{
              border: '3px solid #000',
              boxShadow: selectedFieldId === field.id
                ? '8px 8px 0 0 rgba(0,0,0,0.85)'
                : '6px 6px 0 0 rgba(0,0,0,0.85)',
            }}
          >
            {/* Header */}
            <div
              className="bg-gradient-to-r from-orange-400 to-amber-400 px-4 py-2 flex items-center justify-between"
              style={{ borderBottom: '3px solid #000' }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="bg-purple-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg"
                  style={{ border: '1.5px solid #000', boxShadow: '2px 2px 0 0 rgba(0,0,0,0.85)' }}
                >
                  LEVEL {index + 1}
                </span>
                <span
                  className="bg-white rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{ border: '1.5px solid #000' }}
                >
                  {field.type.replace('_', ' ')}
                </span>
              </div>
              {field.isRequired && (
                <span
                  className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ border: '1.5px solid #000' }}
                >
                  Required
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-5 bg-white">
              <div className="space-y-2 mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {field.title || 'Untitled Question'}
                </h3>
                {field.description && (
                  <p className="text-sm text-gray-500">{field.description}</p>
                )}
              </div>

              {/* Field Type Preview */}
              <div>
                {field.type === 'short_text' && (
                  <div
                    className="rounded-lg px-4 py-3 text-sm text-gray-400"
                    style={{ border: '2.5px solid #D1D5DB' }}
                  >
                    {field.properties.placeholder || 'Type your answer here...'}
                  </div>
                )}
                {field.type === 'long_text' && (
                  <div
                    className="rounded-lg px-4 py-3 text-sm text-gray-400 min-h-[80px]"
                    style={{ border: '2.5px solid #D1D5DB' }}
                  >
                    {field.properties.placeholder || 'Type your answer here...'}
                  </div>
                )}
                {(field.type === 'email' || field.type === 'url' || field.type === 'phone') && (
                  <div
                    className="rounded-lg px-4 py-3 text-sm text-gray-400"
                    style={{ border: '2.5px solid #D1D5DB' }}
                  >
                    {field.properties.placeholder || (field.type === 'email' ? 'name@example.com' : field.type === 'phone' ? '+1 (555) 000-0000' : 'https://example.com')}
                  </div>
                )}
                {field.type === 'number' && (
                  <div>
                    <div
                      className="rounded-lg px-4 py-3 text-sm text-gray-400"
                      style={{ border: '2.5px solid #D1D5DB' }}
                    >
                      {field.properties.placeholder || '0'}
                    </div>
                    {(field.properties.min || field.properties.max) && (
                      <div className="text-xs text-gray-400 mt-1">
                        {field.properties.min && `Min: ${field.properties.min}`}
                        {field.properties.min && field.properties.max && ' \u2022 '}
                        {field.properties.max && `Max: ${field.properties.max}`}
                      </div>
                    )}
                  </div>
                )}
                {(field.type === 'multiple_choice' || field.type === 'checkboxes') && (
                  <div className="space-y-2">
                    {(field.properties.options || ['Option 1', 'Option 2', 'Option 3']).map((option: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors cursor-pointer rounded-lg"
                        style={{ border: '2.5px solid #D1D5DB' }}
                      >
                        <div
                          className={`w-4 h-4 border-2 ${field.type === 'multiple_choice' ? 'rounded-full' : 'rounded'}`}
                          style={{ borderColor: '#6366F1' }}
                        />
                        <span className="text-sm text-gray-800 font-medium">{option}</span>
                      </div>
                    ))}
                    {field.type === 'checkboxes' && (field.properties.minSelections || field.properties.maxSelections) && (
                      <p className="text-xs text-gray-400 mt-1">
                        {field.properties.minSelections && `Min: ${field.properties.minSelections} selections`}
                        {field.properties.minSelections && field.properties.maxSelections && ' \u2022 '}
                        {field.properties.maxSelections && `Max: ${field.properties.maxSelections} selections`}
                      </p>
                    )}
                  </div>
                )}
                {field.type === 'dropdown' && (
                  <div
                    className="rounded-lg px-4 py-3 text-sm text-gray-400 flex items-center justify-between cursor-pointer"
                    style={{ border: '2.5px solid #D1D5DB' }}
                  >
                    <span>Select an option...</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                )}
                {field.type === 'yes_no' && (
                  <div className="flex gap-3">
                    <span
                      className="flex-1 text-center bg-white text-gray-700 text-sm font-bold px-4 py-2.5 rounded-lg cursor-pointer"
                      style={{ border: '2.5px solid #D1D5DB' }}
                    >
                      {field.properties.yesLabel || 'Yes'}
                    </span>
                    <span
                      className="flex-1 text-center bg-white text-gray-700 text-sm font-bold px-4 py-2.5 rounded-lg cursor-pointer"
                      style={{ border: '2.5px solid #D1D5DB' }}
                    >
                      {field.properties.noLabel || 'No'}
                    </span>
                  </div>
                )}
                {field.type === 'rating' && (
                  <div className="flex gap-2">
                    {Array.from({ length: field.properties.ratingMax || 5 }).map((_, idx) => (
                      <span key={idx} className="text-2xl text-gray-300 cursor-pointer hover:text-yellow-400 transition-colors">
                        {'\u2B50'}
                      </span>
                    ))}
                  </div>
                )}
                {field.type === 'opinion_scale' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      {[...Array((field.properties.scaleMax || 10) - (field.properties.scaleMin || 0) + 1)].map((_, idx) => {
                        const scaleValue = (field.properties.scaleMin || 0) + idx
                        return (
                          <span
                            key={idx}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-gray-600 cursor-pointer"
                            style={{ border: '2px solid #D1D5DB' }}
                          >
                            {scaleValue}
                          </span>
                        )
                      })}
                    </div>
                    {(field.properties.scaleMinLabel || field.properties.scaleMaxLabel) && (
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{field.properties.scaleMinLabel || ''}</span>
                        <span>{field.properties.scaleMaxLabel || ''}</span>
                      </div>
                    )}
                  </div>
                )}
                {field.type === 'date' && (
                  <div
                    className="rounded-lg px-4 py-3 text-sm text-gray-400"
                    style={{ border: '2.5px solid #D1D5DB' }}
                  >
                    MM / DD / YYYY
                  </div>
                )}
                {field.type === 'legal' && (
                  <div
                    className="rounded-lg p-4"
                    style={{ border: '2.5px solid #D1D5DB' }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 border-2 rounded flex-shrink-0 mt-0.5" style={{ borderColor: '#6366F1' }} />
                      <p className="text-sm text-gray-700">
                        {field.properties.legalText || 'I agree to the terms and conditions'}
                      </p>
                    </div>
                  </div>
                )}
                {field.type === 'file_upload' && (
                  <div
                    className="rounded-lg p-6 text-center"
                    style={{ border: '2.5px dashed #D1D5DB' }}
                  >
                    <svg className="w-10 h-10 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">
                      {field.properties.fileTypes || 'All file types'} {'\u2022'} Max {field.properties.maxSize || '10'}MB
                    </p>
                  </div>
                )}
                {field.type === 'ranking' && (
                  <div className="space-y-2">
                    {(field.properties.items || ['Item 1', 'Item 2', 'Item 3']).map((item: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg cursor-move"
                        style={{ border: '2px solid #D1D5DB' }}
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        <span className="flex-1 text-sm text-gray-800 font-medium">{item}</span>
                        <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
                {field.type === 'matrix' && (
                  <div className="overflow-x-auto">
                    <table
                      className="w-full rounded-lg overflow-hidden"
                      style={{ border: '2px solid #D1D5DB' }}
                    >
                      <thead>
                        <tr className="bg-purple-50">
                          <th className="p-3 text-left text-sm font-bold text-purple-700" style={{ borderRight: '1px solid #D1D5DB', borderBottom: '2px solid #D1D5DB' }}></th>
                          {(field.properties.columns || ['Column 1', 'Column 2']).map((col: string, idx: number) => (
                            <th key={idx} className="p-3 text-center text-sm font-bold text-purple-700" style={{ borderBottom: '2px solid #D1D5DB' }}>
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(field.properties.rows || ['Row 1', 'Row 2']).map((row: string, rowIdx: number) => (
                          <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="p-3 text-sm text-gray-800 font-medium" style={{ borderRight: '1px solid #D1D5DB' }}>{row}</td>
                            {(field.properties.columns || ['Column 1', 'Column 2']).map((_: string, colIdx: number) => (
                              <td key={colIdx} className="p-3 text-center">
                                <div className="w-4 h-4 border-2 rounded-full mx-auto" style={{ borderColor: '#6366F1' }} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {field.type === 'payment' && (
                  <div
                    className="rounded-lg p-5 bg-gray-50"
                    style={{ border: '2px solid #D1D5DB' }}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          Amount: ${field.properties.amount || '0.00'}
                        </p>
                        <p className="text-xs text-gray-400">Payment integration coming soon</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom bar with progress segment and OK button */}
              <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '2px solid #E5E7EB' }}>
                <div className="flex gap-1.5">
                  {fields.map((_, segIdx) => (
                    <div
                      key={segIdx}
                      className={`h-2 w-8 rounded-full ${
                        segIdx <= index
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span
                  className="bg-gradient-to-r from-green-500 to-emerald-400 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={{ border: '2px solid #000', boxShadow: '2px 2px 0 0 rgba(0,0,0,0.85)' }}
                >
                  OK {'\u2713'}
                </span>
              </div>
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
