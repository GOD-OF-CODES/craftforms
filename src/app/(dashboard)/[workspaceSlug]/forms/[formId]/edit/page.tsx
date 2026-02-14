'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useFormBuilderStore, FieldType } from '@/store/formBuilderStore'
import FieldPalette from '@/components/form-builder/field-palette'
import FormPreview from '@/components/form-builder/form-preview'
import SettingsPanel from '@/components/form-builder/settings-panel'
import ScreenEditor from '@/components/form-builder/ScreenEditor'
import Input from '@/components/ui/input'
import Button from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

type ScreenType = 'welcome' | 'thank_you' | null

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

export default function FormBuilderPage({ params }: { params: { workspaceSlug: string; formId: string } }) {
  const { addToast } = useToast()
  const [selectedScreen, setSelectedScreen] = useState<ScreenType>(null)
  const [welcomeScreen, setWelcomeScreen] = useState<ScreenData | null>(null)
  const [thankYouScreen, setThankYouScreen] = useState<ScreenData | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [formSlug, setFormSlug] = useState<string>('')
  const [showShareDialog, setShowShareDialog] = useState(false)
  const shareInputRef = useRef<HTMLInputElement>(null)
  const {
    formTitle,
    fields,
    selectedFieldId,
    setFormId,
    setFormTitle,
    addField,
    updateField,
    removeField,
    selectField,
  } = useFormBuilderStore()

  useEffect(() => {
    setFormId(params.formId)

    // Load form data including published status
    const loadFormData = async () => {
      try {
        const response = await fetch(`/api/forms/${params.formId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.form?.isPublished) {
            setIsPublished(true)
          }
          if (data.form?.slug) {
            setFormSlug(data.form.slug)
          }
          if (data.form?.title) {
            setFormTitle(data.form.title)
          }
        }
      } catch (error) {
        console.error('Failed to load form:', error)
      }
    }

    // Load screens data
    const loadScreens = async () => {
      try {
        const response = await fetch(`/api/forms/${params.formId}/screens`)
        if (response.ok) {
          const data = await response.json()
          const screens = data.screens || []
          const welcome = screens.find((s: ScreenData) => s.type === 'welcome')
          const thankYou = screens.find((s: ScreenData) => s.type === 'thank_you')
          if (welcome) setWelcomeScreen(welcome)
          if (thankYou) setThankYouScreen(thankYou)
        }
      } catch (error) {
        console.error('Failed to load screens:', error)
      }
    }

    loadFormData()
    loadScreens()
  }, [params.formId, setFormId, setFormTitle])

  const handleAddField = (type: FieldType) => {
    // Clear screen selection when adding a field
    setSelectedScreen(null)

    const newField = {
      id: `field-${Date.now()}`,
      type,
      title: '',
      isRequired: false,
      properties: {},
      orderIndex: fields.length,
    }
    addField(newField)
  }

  const handleScreenSelect = (screenType: 'welcome' | 'thank_you') => {
    setSelectedScreen(screenType)
    selectField(null) // Clear field selection
  }

  const handleFieldSelect = (fieldId: string | null) => {
    setSelectedScreen(null) // Clear screen selection
    selectField(fieldId)
  }

  const selectedField = fields.find((f) => f.id === selectedFieldId) || null

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save form metadata
      const formResponse = await fetch(`/api/forms/${params.formId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
        }),
      })

      if (!formResponse.ok) {
        throw new Error('Failed to save form')
      }

      // Save fields
      for (const field of fields) {
        const fieldResponse = await fetch(`/api/forms/${params.formId}/fields/${field.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: field.type,
            title: field.title,
            description: field.description,
            required: field.isRequired,
            properties: field.properties,
            orderIndex: field.orderIndex,
          }),
        })

        // If field doesn't exist or update failed, try to create it
        if (!fieldResponse.ok) {
          await fetch(`/api/forms/${params.formId}/fields`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: field.id,
              type: field.type,
              title: field.title,
              description: field.description,
              required: field.isRequired,
              properties: field.properties,
              orderIndex: field.orderIndex,
            }),
          })
        }
      }

      addToast({
        title: 'Form Saved',
        description: 'Your form has been saved successfully.',
        variant: 'success',
      })
    } catch (error) {
      console.error('Failed to save form:', error)
      addToast({
        title: 'Error',
        description: 'Failed to save form. Please try again.',
        variant: 'error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = () => {
    // Open form preview in new tab
    window.open(`/preview/${params.formId}`, '_blank')
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      const response = await fetch(`/api/forms/${params.formId}/publish`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to publish form')
      }

      const data = await response.json()
      setIsPublished(true)
      setFormSlug(data.form.slug)
      setShowShareDialog(true)

      addToast({
        title: 'Form Published!',
        description: 'Your form is now live. Share the link with your audience.',
        variant: 'success',
      })
    } catch (error) {
      console.error('Failed to publish form:', error)
      addToast({
        title: 'Error',
        description: 'Failed to publish form. Please try again.',
        variant: 'error',
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const handleUnpublish = async () => {
    setIsPublishing(true)
    try {
      const response = await fetch(`/api/forms/${params.formId}/unpublish`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to unpublish form')
      }

      setIsPublished(false)
      addToast({
        title: 'Form Unpublished',
        description: 'Your form is no longer publicly accessible.',
        variant: 'success',
      })
    } catch (error) {
      console.error('Failed to unpublish form:', error)
      addToast({
        title: 'Error',
        description: 'Failed to unpublish form. Please try again.',
        variant: 'error',
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/to/${params.workspaceSlug}/${formSlug}`
    : `/to/${params.workspaceSlug}/${formSlug}`

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      addToast({
        title: 'Link Copied',
        description: 'Share link copied to clipboard.',
        variant: 'success',
      })
    } catch {
      // Fallback: select the input text
      shareInputRef.current?.select()
    }
  }

  const handleScreenSave = (screen: ScreenData) => {
    if (screen.type === 'welcome') {
      setWelcomeScreen(screen)
    } else {
      setThankYouScreen(screen)
    }
    addToast({
      title: 'Screen Saved',
      description: `${screen.type === 'welcome' ? 'Welcome' : 'Thank You'} screen saved successfully.`,
      variant: 'success',
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-surface px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <Input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="text-lg font-semibold border-none bg-transparent px-0 focus:ring-0"
              placeholder="Untitled Form"
            />
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/${params.workspaceSlug}/forms/${params.formId}/responses`}>
              <Button variant="ghost">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Responses
              </Button>
            </Link>
            <Button variant="ghost" onClick={handlePreview}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </Button>
            {isPublished && (
              <Button variant="ghost" onClick={() => setShowShareDialog(true)}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </Button>
            )}
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              )}
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            {isPublished ? (
              <Button variant="secondary" onClick={handleUnpublish} disabled={isPublishing}>
                {isPublishing ? 'Unpublishing...' : 'Unpublish'}
              </Button>
            ) : (
              <Button variant="secondary" onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? 'Publishing...' : 'Publish'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      {showShareDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowShareDialog(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Share your form</h2>
              <button onClick={() => setShowShareDialog(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Anyone with this link can fill out your form.</p>
            <div className="flex items-center gap-2">
              <input
                ref={shareInputRef}
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button onClick={handleCopyShareLink}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </Button>
            </div>
            <div className="mt-4 flex gap-2">
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Open form in new tab
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Three Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Field Palette */}
        <FieldPalette
          onFieldTypeSelect={handleAddField}
          onScreenSelect={handleScreenSelect}
        />

        {/* Center: Preview */}
        <FormPreview
          fields={fields}
          selectedFieldId={selectedFieldId}
          onFieldSelect={handleFieldSelect}
          welcomeScreen={welcomeScreen}
          thankYouScreen={thankYouScreen}
          selectedScreen={selectedScreen}
        />

        {/* Right: Settings Panel or Screen Editor */}
        {selectedScreen ? (
          <div className="w-80 bg-surface border-l border-border p-6 overflow-y-auto">
            <ScreenEditor
              formId={params.formId}
              type={selectedScreen}
              initialData={selectedScreen === 'welcome' ? welcomeScreen : thankYouScreen}
              onSave={handleScreenSave}
            />
          </div>
        ) : (
          <SettingsPanel
            field={selectedField}
            allFields={fields}
            onFieldUpdate={(updates) => {
              if (selectedFieldId) {
                updateField(selectedFieldId, updates)
              }
            }}
            onFieldDelete={() => {
              if (selectedFieldId) {
                removeField(selectedFieldId)
                addToast({
                  description: 'Field deleted successfully.',
                  variant: 'success',
                })
              }
            }}
          />
        )}
      </div>
    </div>
  )
}
