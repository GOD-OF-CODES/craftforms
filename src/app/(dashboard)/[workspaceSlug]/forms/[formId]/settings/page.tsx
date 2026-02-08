'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Textarea from '@/components/ui/textarea'
import Switch from '@/components/ui/switch'
import Select from '@/components/ui/select'
import Badge from '@/components/ui/badge'

interface FormSettings {
  id: string
  title: string
  description: string
  slug: string
  language: string
  isPublished: boolean
  isAcceptingResponses: boolean
  passwordProtected: boolean
  password: string
  responseLimit: number | null
  closeDate: string | null
  showProgressBar: boolean
  showQuestionNumbers: boolean
  allowNavigation: boolean
  randomizeQuestions: boolean
  notifyOnResponse: boolean
  notificationEmails: string
  notificationSubject: string
  sendConfirmationEmail: boolean
}

const DEFAULT_SETTINGS: FormSettings = {
  id: '',
  title: '',
  description: '',
  slug: '',
  language: 'en',
  isPublished: false,
  isAcceptingResponses: true,
  passwordProtected: false,
  password: '',
  responseLimit: null,
  closeDate: null,
  showProgressBar: true,
  showQuestionNumbers: true,
  allowNavigation: true,
  randomizeQuestions: false,
  notifyOnResponse: false,
  notificationEmails: '',
  notificationSubject: 'New response to your form',
  sendConfirmationEmail: false,
}

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'it', label: 'Italian' },
  { value: 'nl', label: 'Dutch' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ko', label: 'Korean' },
]

export default function FormSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const workspaceSlug = params.workspaceSlug as string
  const formId = params.formId as string

  const [settings, setSettings] = useState<FormSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/forms/${formId}`)
        if (response.ok) {
          const form = await response.json()
          setSettings({
            id: form.id,
            title: form.title || '',
            description: form.description || '',
            slug: form.slug || '',
            language: form.settings?.language || 'en',
            isPublished: form.isPublished,
            isAcceptingResponses: form.isAcceptingResponses,
            passwordProtected: !!form.passwordHash,
            password: '',
            responseLimit: form.responseLimit,
            closeDate: form.closeDate ? (new Date(form.closeDate).toISOString().split('T')[0] || null) : null,
            showProgressBar: form.settings?.showProgressBar !== false,
            showQuestionNumbers: form.settings?.showQuestionNumbers !== false,
            allowNavigation: form.settings?.allowNavigation !== false,
            randomizeQuestions: form.settings?.randomizeQuestions || false,
            notifyOnResponse: form.settings?.notifyOnResponse || false,
            notificationEmails: form.settings?.notificationEmails || '',
            notificationSubject: form.settings?.notificationSubject || 'New response to your form',
            sendConfirmationEmail: form.settings?.sendConfirmationEmail || false,
          })
        }
      } catch (error) {
        console.error('Failed to fetch form settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [formId])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: settings.title,
          description: settings.description,
          slug: settings.slug,
          isPublished: settings.isPublished,
          isAcceptingResponses: settings.isAcceptingResponses,
          responseLimit: settings.responseLimit,
          closeDate: settings.closeDate ? new Date(settings.closeDate) : null,
          password: settings.passwordProtected && settings.password ? settings.password : undefined,
          removePassword: !settings.passwordProtected,
          settings: {
            language: settings.language,
            showProgressBar: settings.showProgressBar,
            showQuestionNumbers: settings.showQuestionNumbers,
            allowNavigation: settings.allowNavigation,
            randomizeQuestions: settings.randomizeQuestions,
            notifyOnResponse: settings.notifyOnResponse,
            notificationEmails: settings.notificationEmails,
            notificationSubject: settings.notificationSubject,
            sendConfirmationEmail: settings.sendConfirmationEmail,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }, [formId, settings])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/${workspaceSlug}/forms/${formId}/edit`)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Form Settings</h1>
            <p className="text-gray-500">{settings.title || 'Untitled Form'}</p>
          </div>
        </div>
        <Button onClick={handleSave} isLoading={saving}>
          Save Changes
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'general', label: 'General' },
          { id: 'access', label: 'Access Control' },
          { id: 'behavior', label: 'Response Options' },
          { id: 'notifications', label: 'Notifications' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
        {activeTab === 'general' && (
          <GeneralSettings settings={settings} setSettings={setSettings} />
        )}
        {activeTab === 'access' && (
          <AccessSettings settings={settings} setSettings={setSettings} />
        )}
        {activeTab === 'behavior' && (
          <BehaviorSettings settings={settings} setSettings={setSettings} />
        )}
        {activeTab === 'notifications' && (
          <NotificationSettings settings={settings} setSettings={setSettings} />
        )}
      </div>
    </div>
  )
}

interface SettingsPanelProps {
  settings: FormSettings
  setSettings: (settings: FormSettings) => void
}

function GeneralSettings({ settings, setSettings }: SettingsPanelProps) {
  return (
    <div className="space-y-6">
      <Input
        label="Form Title"
        value={settings.title}
        onChange={(e) => setSettings({ ...settings, title: e.target.value })}
        placeholder="My Form"
      />

      <Textarea
        label="Description"
        value={settings.description}
        onChange={(e) => setSettings({ ...settings, description: e.target.value })}
        placeholder="Describe your form..."
        rows={3}
      />

      <Input
        label="Custom URL Slug"
        value={settings.slug}
        onChange={(e) => setSettings({ ...settings, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
        placeholder="my-form"
      />

      <Select
        label="Language"
        options={LANGUAGE_OPTIONS}
        value={settings.language}
        onChange={(e) => setSettings({ ...settings, language: e.target.value })}
      />
    </div>
  )
}

function AccessSettings({ settings, setSettings }: SettingsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Publish Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-900">Publish Form</h4>
          <p className="text-sm text-gray-500">Make your form publicly accessible</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={settings.isPublished ? 'success' : 'default'}>
            {settings.isPublished ? 'Published' : 'Draft'}
          </Badge>
          <Switch
            checked={settings.isPublished}
            onCheckedChange={(checked) => setSettings({ ...settings, isPublished: checked })}
          />
        </div>
      </div>

      {/* Accept Responses Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-900">Accept Responses</h4>
          <p className="text-sm text-gray-500">Allow new submissions to your form</p>
        </div>
        <Switch
          checked={settings.isAcceptingResponses}
          onCheckedChange={(checked) => setSettings({ ...settings, isAcceptingResponses: checked })}
        />
      </div>

      {/* Password Protection */}
      <div className="p-4 border border-gray-200 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Password Protection</h4>
            <p className="text-sm text-gray-500">Require a password to access the form</p>
          </div>
          <Switch
            checked={settings.passwordProtected}
            onCheckedChange={(checked) => setSettings({ ...settings, passwordProtected: checked })}
          />
        </div>
        {settings.passwordProtected && (
          <Input
            type="password"
            label="Password"
            value={settings.password}
            onChange={(e) => setSettings({ ...settings, password: e.target.value })}
            placeholder="Enter password"
          />
        )}
      </div>

      {/* Response Limit */}
      <div className="p-4 border border-gray-200 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Response Limit</h4>
            <p className="text-sm text-gray-500">Stop accepting responses after a limit</p>
          </div>
          <Switch
            checked={settings.responseLimit !== null}
            onCheckedChange={(checked) => setSettings({ ...settings, responseLimit: checked ? 100 : null })}
          />
        </div>
        {settings.responseLimit !== null && (
          <Input
            type="number"
            label="Maximum Responses"
            value={settings.responseLimit.toString()}
            onChange={(e) => setSettings({ ...settings, responseLimit: parseInt(e.target.value) || 100 })}
            min={1}
          />
        )}
      </div>

      {/* Close Date */}
      <div className="p-4 border border-gray-200 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Close Date</h4>
            <p className="text-sm text-gray-500">Stop accepting responses after a date</p>
          </div>
          <Switch
            checked={settings.closeDate !== null}
            onCheckedChange={(checked) => setSettings({ ...settings, closeDate: checked ? (new Date().toISOString().split('T')[0] || null) : null })}
          />
        </div>
        {settings.closeDate !== null && (
          <Input
            type="date"
            label="Close After"
            value={settings.closeDate}
            onChange={(e) => setSettings({ ...settings, closeDate: e.target.value })}
          />
        )}
      </div>
    </div>
  )
}

function BehaviorSettings({ settings, setSettings }: SettingsPanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-900">Show Progress Bar</h4>
          <p className="text-sm text-gray-500">Display a progress indicator</p>
        </div>
        <Switch
          checked={settings.showProgressBar}
          onCheckedChange={(checked) => setSettings({ ...settings, showProgressBar: checked })}
        />
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-900">Show Question Numbers</h4>
          <p className="text-sm text-gray-500">Display question numbers (1, 2, 3...)</p>
        </div>
        <Switch
          checked={settings.showQuestionNumbers}
          onCheckedChange={(checked) => setSettings({ ...settings, showQuestionNumbers: checked })}
        />
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-900">Allow Navigation</h4>
          <p className="text-sm text-gray-500">Enable back/forward navigation buttons</p>
        </div>
        <Switch
          checked={settings.allowNavigation}
          onCheckedChange={(checked) => setSettings({ ...settings, allowNavigation: checked })}
        />
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-900">Randomize Questions</h4>
          <p className="text-sm text-gray-500">Show questions in random order</p>
        </div>
        <Switch
          checked={settings.randomizeQuestions}
          onCheckedChange={(checked) => setSettings({ ...settings, randomizeQuestions: checked })}
        />
      </div>
    </div>
  )
}

function NotificationSettings({ settings, setSettings }: SettingsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Notify on Response */}
      <div className="p-4 border border-gray-200 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Email Notifications</h4>
            <p className="text-sm text-gray-500">Get notified when someone submits a response</p>
          </div>
          <Switch
            checked={settings.notifyOnResponse}
            onCheckedChange={(checked) => setSettings({ ...settings, notifyOnResponse: checked })}
          />
        </div>
        {settings.notifyOnResponse && (
          <>
            <Input
              label="Notification Recipients"
              value={settings.notificationEmails}
              onChange={(e) => setSettings({ ...settings, notificationEmails: e.target.value })}
              placeholder="email@example.com, another@example.com"
            />
            <Input
              label="Email Subject"
              value={settings.notificationSubject}
              onChange={(e) => setSettings({ ...settings, notificationSubject: e.target.value })}
              placeholder="New response to your form"
            />
          </>
        )}
      </div>

      {/* Confirmation Email */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-900">Send Confirmation Email</h4>
          <p className="text-sm text-gray-500">Send respondents a confirmation after submission</p>
        </div>
        <Switch
          checked={settings.sendConfirmationEmail}
          onCheckedChange={(checked) => setSettings({ ...settings, sendConfirmationEmail: checked })}
        />
      </div>
    </div>
  )
}
