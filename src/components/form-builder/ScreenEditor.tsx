'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import Input from '@/components/ui/input'
import Textarea from '@/components/ui/textarea'
import Label from '@/components/ui/label'
import Button from '@/components/ui/button'
import Switch from '@/components/ui/switch'
import Card from '@/components/ui/card'

interface ScreenProperties {
  enabled?: boolean
  showSocialShare?: boolean
  redirectUrl?: string
  redirectDelay?: number
  showResponseSummary?: boolean
}

interface Screen {
  id?: string
  type: 'welcome' | 'thank_you'
  title: string
  description?: string
  buttonText?: string
  mediaUrl?: string
  properties: ScreenProperties
}

interface ScreenEditorProps {
  formId: string
  type: 'welcome' | 'thank_you'
  initialData?: Screen | null
  onSave?: (screen: Screen) => void
}

export function ScreenEditor({ formId, type, initialData, onSave }: ScreenEditorProps) {
  const [screen, setScreen] = useState<Screen>({
    type,
    title: type === 'welcome' ? 'Welcome!' : 'Thank you!',
    description: type === 'welcome'
      ? 'Please fill out this form to help us serve you better.'
      : 'Your response has been recorded.',
    buttonText: type === 'welcome' ? 'Start' : undefined,
    mediaUrl: '',
    properties: {
      enabled: true,
      showSocialShare: type === 'thank_you',
      redirectUrl: '',
      redirectDelay: 3,
      showResponseSummary: false
    }
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    if (initialData) {
      setScreen(initialData)
    }
  }, [initialData])

  const handleChange = (field: keyof Screen, value: string | undefined) => {
    setScreen(prev => ({ ...prev, [field]: value }))
  }

  const handlePropertyChange = (field: keyof ScreenProperties, value: boolean | string | number) => {
    setScreen(prev => ({
      ...prev,
      properties: { ...prev.properties, [field]: value }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      const response = await fetch(`/api/forms/${formId}/screens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(screen)
      })

      if (!response.ok) {
        throw new Error('Failed to save screen')
      }

      const data = await response.json()
      setScreen(prev => ({ ...prev, id: data.screen.id }))
      setSaveMessage('Screen saved successfully!')
      onSave?.(data.screen)
    } catch (error) {
      console.error('Save screen error:', error)
      setSaveMessage('Failed to save screen')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  const isWelcome = type === 'welcome'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {isWelcome ? 'Welcome Screen' : 'Thank You Screen'}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Enabled</span>
          <Switch
            checked={screen.properties.enabled ?? true}
            onCheckedChange={(checked: boolean) => handlePropertyChange('enabled', checked)}
          />
        </div>
      </div>

      {screen.properties.enabled && (
        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor={`${type}-title`}>Title</Label>
            <Input
              id={`${type}-title`}
              value={screen.title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('title', e.target.value)}
              placeholder={isWelcome ? 'Welcome!' : 'Thank you!'}
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor={`${type}-description`}>Description</Label>
            <Textarea
              id={`${type}-description`}
              value={screen.description || ''}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleChange('description', e.target.value)}
              placeholder="Add a description..."
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Supports basic formatting. Keep it concise.
            </p>
          </div>

          {/* Button Text (Welcome only) */}
          {isWelcome && (
            <div>
              <Label htmlFor="welcome-button">Button Text</Label>
              <Input
                id="welcome-button"
                value={screen.buttonText || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('buttonText', e.target.value)}
                placeholder="Start"
              />
            </div>
          )}

          {/* Media URL */}
          <div>
            <Label htmlFor={`${type}-media`}>Media URL (Image or Video)</Label>
            <Input
              id={`${type}-media`}
              value={screen.mediaUrl || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('mediaUrl', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Add an image or video URL to display on the screen.
            </p>
          </div>

          {/* Thank You specific options */}
          {!isWelcome && (
            <>
              {/* Redirect URL */}
              <div>
                <Label htmlFor="redirect-url">Redirect URL (optional)</Label>
                <Input
                  id="redirect-url"
                  value={screen.properties.redirectUrl || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handlePropertyChange('redirectUrl', e.target.value)}
                  placeholder="https://example.com/thank-you"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Redirect respondents to this URL after submission.
                </p>
              </div>

              {/* Redirect Delay */}
              {screen.properties.redirectUrl && (
                <div>
                  <Label htmlFor="redirect-delay">Redirect Delay (seconds)</Label>
                  <Input
                    id="redirect-delay"
                    type="number"
                    min={0}
                    max={30}
                    value={screen.properties.redirectDelay || 3}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handlePropertyChange('redirectDelay', parseInt(e.target.value) || 0)}
                  />
                </div>
              )}

              {/* Show Social Share */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-900">Social Share Buttons</p>
                  <p className="text-sm text-gray-500">Allow respondents to share the form</p>
                </div>
                <Switch
                  checked={screen.properties.showSocialShare ?? false}
                  onCheckedChange={(checked: boolean) => handlePropertyChange('showSocialShare', checked)}
                />
              </div>

              {/* Show Response Summary */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-900">Response Summary</p>
                  <p className="text-sm text-gray-500">Show respondent their answers</p>
                </div>
                <Switch
                  checked={screen.properties.showResponseSummary ?? false}
                  onCheckedChange={(checked: boolean) => handlePropertyChange('showResponseSummary', checked)}
                />
              </div>
            </>
          )}

          {/* Preview Card */}
          <div className="pt-4">
            <Label>Preview</Label>
            <Card className="mt-2 p-6 text-center bg-gray-50">
              {screen.mediaUrl && (
                <div className="mb-4">
                  {screen.mediaUrl.includes('youtube') || screen.mediaUrl.includes('vimeo') ? (
                    <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">Video Preview</span>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={screen.mediaUrl}
                      alt="Screen media"
                      className="max-h-40 mx-auto rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  )}
                </div>
              )}
              <h4 className="text-2xl font-bold text-gray-900 mb-2">
                {screen.title || (isWelcome ? 'Welcome!' : 'Thank you!')}
              </h4>
              {screen.description && (
                <p className="text-gray-600 mb-4">{screen.description}</p>
              )}
              {isWelcome && (
                <Button size="lg">
                  {screen.buttonText || 'Start'}
                </Button>
              )}
              {!isWelcome && screen.properties.showSocialShare && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button variant="secondary" size="sm">Twitter</Button>
                  <Button variant="secondary" size="sm">Facebook</Button>
                  <Button variant="secondary" size="sm">LinkedIn</Button>
                </div>
              )}
            </Card>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-4">
            {saveMessage && (
              <p className={`text-sm ${saveMessage.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                {saveMessage}
              </p>
            )}
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              className="ml-auto"
            >
              Save {isWelcome ? 'Welcome' : 'Thank You'} Screen
            </Button>
          </div>
        </div>
      )}

      {!screen.properties.enabled && (
        <p className="text-gray-500 text-center py-8">
          This screen is disabled. Toggle the switch above to enable it.
        </p>
      )}
    </div>
  )
}

export default ScreenEditor
