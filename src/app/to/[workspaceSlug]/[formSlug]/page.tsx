'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FormRenderer } from '@/components/form-renderer'
import { applyThemeToDocument, generateBackgroundCSS, getThemeStyles, mergeWithDefaults, Theme } from '@/lib/themeApplier'

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
  theme?: Partial<Theme>
}

export default function PublicFormPage({
  params
}: {
  params: { workspaceSlug: string; formSlug: string }
}) {
  const router = useRouter()
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(
          `/api/public/forms/${params.workspaceSlug}/${params.formSlug}`
        )

        if (!response.ok) {
          if (response.status === 404) {
            setError('Form not found')
          } else if (response.status === 403) {
            setError('This form is not accepting responses')
          } else {
            setError('Failed to load form')
          }
          return
        }

        const data = await response.json()
        setForm(data.form)

        // Apply theme if available
        if (data.form.theme) {
          applyThemeToDocument(data.form.theme)
        }
      } catch (err) {
        console.error('Failed to fetch form:', err)
        setError('Failed to load form')
      } finally {
        setLoading(false)
      }
    }

    fetchForm()
  }, [params.workspaceSlug, params.formSlug])

  const handleSubmit = async (answers: Record<string, unknown>): Promise<void> => {
    const response = await fetch(`/api/public/submit/${form?.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers })
    })

    if (!response.ok) {
      throw new Error('Failed to submit response')
    }
    // FormRenderer handles thank you screen display
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading form...</p>
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
          <p className="text-gray-600 mb-6">
            {error === 'Form not found'
              ? 'This form may have been deleted or the URL is incorrect.'
              : 'Please try again later or contact the form owner.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  if (!form) {
    return null
  }

  // Find welcome and thank you screens
  const welcomeScreen = form.screens.find(s => s.type === 'welcome')
  const thankYouScreen = form.screens.find(s => s.type === 'thank_you')

  // Get theme-based styles
  const theme = mergeWithDefaults(form.theme)
  const backgroundStyle = generateBackgroundCSS(theme)
  const themeStyles = getThemeStyles(theme)

  return (
    <div className="min-h-screen" style={backgroundStyle}>
      <FormRenderer
      fields={form.fields}
      welcomeScreen={welcomeScreen ? {
        title: welcomeScreen.title,
        description: welcomeScreen.description,
        buttonText: welcomeScreen.buttonText || 'Start',
        enabled: welcomeScreen.properties?.enabled !== false
      } : undefined}
      thankYouScreen={thankYouScreen ? {
        title: thankYouScreen.title,
        description: thankYouScreen.description,
        redirectUrl: thankYouScreen.properties?.redirectUrl as string | undefined,
        enabled: thankYouScreen.properties?.enabled !== false
      } : undefined}
      showProgressBar={form.settings?.showProgressBar !== false}
      showQuestionNumbers={form.settings?.showQuestionNumbers !== false}
      onSubmit={handleSubmit}
      themeStyles={themeStyles}
    />
    </div>
  )
}
