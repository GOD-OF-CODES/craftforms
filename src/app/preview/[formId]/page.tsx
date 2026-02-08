'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FormRenderer } from '@/components/form-renderer'

interface FormField {
  id: string
  type: string
  title: string
  description?: string
  isRequired: boolean
  orderIndex: number
  properties: Record<string, unknown>
  validations?: Record<string, unknown>
  logicJumps?: Record<string, unknown>
}

interface FormScreen {
  id: string
  type: 'welcome' | 'thank_you'
  title: string
  description?: string
  buttonText?: string
  mediaUrl?: string
  properties: Record<string, unknown>
}

interface Form {
  id: string
  title: string
  description?: string
  fields: FormField[]
  screens: FormScreen[]
  settings?: Record<string, unknown>
}

export default function FormPreviewPage({
  params
}: {
  params: { formId: string }
}) {
  const router = useRouter()
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/${params.formId}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError('Form not found')
          } else if (response.status === 401) {
            setError('Please log in to preview this form')
          } else {
            setError('Failed to load form')
          }
          return
        }

        const data = await response.json()
        setForm(data.form)
      } catch (err) {
        console.error('Failed to fetch form:', err)
        setError('Failed to load form')
      } finally {
        setLoading(false)
      }
    }

    fetchForm()
  }, [params.formId])

  const handleSubmit = async (answers: Record<string, unknown>): Promise<void> => {
    // In preview mode, don't actually submit
    console.log('Preview mode - responses:', answers)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error}</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!form) {
    return null
  }

  // Find welcome and thank you screens
  const welcomeScreen = form.screens?.find(s => s.type === 'welcome')
  const thankYouScreen = form.screens?.find(s => s.type === 'thank_you')

  return (
    <div className="relative">
      {/* Preview Banner */}
      <div className="fixed top-0 left-0 right-0 bg-yellow-400 text-yellow-900 py-2 px-4 z-50 flex items-center justify-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span className="font-medium">Preview Mode</span>
        <span className="mx-2">-</span>
        <span>Responses will not be saved</span>
        <button
          onClick={() => router.back()}
          className="ml-4 px-3 py-1 bg-yellow-900 text-yellow-100 rounded text-sm hover:bg-yellow-800 transition-colors"
        >
          Exit Preview
        </button>
      </div>

      {/* Form Renderer with top padding for banner */}
      <div className="pt-10">
        <FormRenderer
          fields={form.fields || []}
          welcomeScreen={welcomeScreen ? {
            title: welcomeScreen.title,
            description: welcomeScreen.description,
            buttonText: welcomeScreen.buttonText || 'Start',
            enabled: welcomeScreen.properties?.enabled !== false
          } : undefined}
          thankYouScreen={thankYouScreen ? {
            title: thankYouScreen.title,
            description: thankYouScreen.description,
            redirectUrl: undefined, // Don't redirect in preview
            enabled: thankYouScreen.properties?.enabled !== false
          } : undefined}
          showProgressBar={form.settings?.showProgressBar !== false}
          showQuestionNumbers={form.settings?.showQuestionNumbers !== false}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
