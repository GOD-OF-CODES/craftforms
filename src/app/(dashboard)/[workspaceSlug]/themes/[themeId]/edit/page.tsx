'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Select from '@/components/ui/select'
import { GOOGLE_FONTS, getGoogleFontsUrl, getFontFamilyValue } from '@/lib/googleFonts'

interface ThemeColors {
  primary: string
  primaryText: string
  background: string
  text: string
  secondaryText: string
  error: string
  success: string
}

interface ThemeFonts {
  questionFamily: string
  questionSize: string
  questionWeight: string
  answerFamily: string
  answerSize: string
  answerWeight: string
  buttonFamily: string
  buttonSize: string
  buttonWeight: string
}

interface ThemeBackground {
  type: 'solid' | 'gradient' | 'image'
  color?: string
  gradient?: {
    from: string
    to: string
    direction: string
  }
  imageUrl?: string
  opacity?: number
  blur?: number
}

interface ThemeLayout {
  alignment: 'left' | 'center' | 'right'
  containerWidth: 'narrow' | 'medium' | 'wide' | 'full'
  spacing: 'compact' | 'normal' | 'relaxed'
  buttonShape: 'rounded' | 'pill' | 'square'
  buttonSize: 'small' | 'medium' | 'large'
}

interface Theme {
  id: string
  name: string
  colors: ThemeColors
  fonts: ThemeFonts
  backgroundImage: string | null
  background?: ThemeBackground
  layout?: ThemeLayout
  isPublic: boolean
  createdAt: string
}

const DEFAULT_COLORS: ThemeColors = {
  primary: '#6366f1',
  primaryText: '#ffffff',
  background: '#ffffff',
  text: '#1f2937',
  secondaryText: '#6b7280',
  error: '#ef4444',
  success: '#22c55e',
}

const DEFAULT_FONTS: ThemeFonts = {
  questionFamily: 'Inter',
  questionSize: '24px',
  questionWeight: '600',
  answerFamily: 'Inter',
  answerSize: '18px',
  answerWeight: '400',
  buttonFamily: 'Inter',
  buttonSize: '16px',
  buttonWeight: '500',
}

const DEFAULT_LAYOUT: ThemeLayout = {
  alignment: 'center',
  containerWidth: 'medium',
  spacing: 'normal',
  buttonShape: 'rounded',
  buttonSize: 'medium',
}

const COLOR_PRESETS = [
  { name: 'Indigo', primary: '#6366f1', background: '#ffffff' },
  { name: 'Blue', primary: '#3b82f6', background: '#ffffff' },
  { name: 'Green', primary: '#22c55e', background: '#ffffff' },
  { name: 'Purple', primary: '#a855f7', background: '#ffffff' },
  { name: 'Rose', primary: '#f43f5e', background: '#ffffff' },
  { name: 'Orange', primary: '#f97316', background: '#ffffff' },
  { name: 'Dark', primary: '#6366f1', background: '#1f2937' },
  { name: 'Night', primary: '#818cf8', background: '#0f172a' },
]

export default function ThemeEditorPage() {
  const params = useParams()
  const router = useRouter()
  const workspaceSlug = params.workspaceSlug as string
  const themeId = params.themeId as string

  const [theme, setTheme] = useState<Theme | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'background' | 'layout'>('colors')

  // Theme state
  const [name, setName] = useState('')
  const [colors, setColors] = useState<ThemeColors>(DEFAULT_COLORS)
  const [fonts, setFonts] = useState<ThemeFonts>(DEFAULT_FONTS)
  const [background, setBackground] = useState<ThemeBackground>({ type: 'solid', color: '#ffffff' })
  const [layout, setLayout] = useState<ThemeLayout>(DEFAULT_LAYOUT)

  useEffect(() => {
    const fetchTheme = async () => {
      setLoading(true)
      try {
        // First get workspace by slug
        const wsResponse = await fetch(`/api/workspaces?slug=${workspaceSlug}`)
        if (!wsResponse.ok) return

        const workspaces = await wsResponse.json()
        const workspace = workspaces.find((w: { slug: string }) => w.slug === workspaceSlug)
        if (!workspace) return

        setWorkspaceId(workspace.id)

        // Then fetch theme
        const themeResponse = await fetch(`/api/workspaces/${workspace.id}/themes/${themeId}`)
        if (themeResponse.ok) {
          const data = await themeResponse.json()
          setTheme(data)
          setName(data.name)
          setColors({ ...DEFAULT_COLORS, ...data.colors })
          setFonts({ ...DEFAULT_FONTS, ...data.fonts })
          if (data.background) setBackground(data.background)
          if (data.layout) setLayout(data.layout)
        }
      } catch (error) {
        console.error('Failed to fetch theme:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTheme()
  }, [workspaceSlug, themeId])

  // Load Google Fonts
  useEffect(() => {
    const fontsToLoad = [
      fonts.questionFamily,
      fonts.answerFamily,
      fonts.buttonFamily,
    ].filter((f, i, arr) => arr.indexOf(f) === i)

    const url = getGoogleFontsUrl(fontsToLoad)
    if (url) {
      const link = document.createElement('link')
      link.href = url
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }
  }, [fonts])

  const handleSave = useCallback(async () => {
    if (!workspaceId) return

    setSaving(true)
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/themes/${themeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          colors,
          fonts,
          background,
          layout,
        }),
      })

      if (response.ok) {
        const updated = await response.json()
        setTheme(updated)
      }
    } catch (error) {
      console.error('Failed to save theme:', error)
    } finally {
      setSaving(false)
    }
  }, [workspaceId, themeId, name, colors, fonts, background, layout])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!theme) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Theme not found</h2>
          <Button onClick={() => router.push(`/${workspaceSlug}/themes`)}>
            Back to Themes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/${workspaceSlug}/themes`)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-lg font-semibold border-none focus:outline-none focus:ring-0"
            placeholder="Theme Name"
          />
        </div>
        <Button onClick={handleSave} isLoading={saving}>
          Save Theme
        </Button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Settings Panel */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {(['colors', 'typography', 'background', 'layout'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium capitalize ${
                  activeTab === tab
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-4 space-y-6">
            {activeTab === 'colors' && (
              <ColorsPanel colors={colors} setColors={setColors} />
            )}
            {activeTab === 'typography' && (
              <TypographyPanel fonts={fonts} setFonts={setFonts} />
            )}
            {activeTab === 'background' && (
              <BackgroundPanel background={background} setBackground={setBackground} />
            )}
            {activeTab === 'layout' && (
              <LayoutPanel layout={layout} setLayout={setLayout} />
            )}
          </div>
        </div>

        {/* Live Preview */}
        <div
          className="flex-1 overflow-auto"
          style={{
            backgroundColor: background.type === 'solid' ? (background.color || colors.background) : colors.background,
            backgroundImage: background.type === 'gradient' && background.gradient
              ? `linear-gradient(${background.gradient.direction}, ${background.gradient.from}, ${background.gradient.to})`
              : background.type === 'image' && background.imageUrl
              ? `url(${background.imageUrl})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div
            className={`min-h-full flex flex-col items-${layout.alignment} justify-center p-8`}
            style={{
              maxWidth: layout.containerWidth === 'narrow' ? '480px'
                : layout.containerWidth === 'medium' ? '640px'
                : layout.containerWidth === 'wide' ? '800px'
                : '100%',
              margin: '0 auto',
              gap: layout.spacing === 'compact' ? '16px'
                : layout.spacing === 'relaxed' ? '48px'
                : '32px',
            }}
          >
            <div
              style={{
                fontFamily: getFontFamilyValue(fonts.questionFamily),
                fontSize: fonts.questionSize,
                fontWeight: fonts.questionWeight,
                color: colors.text,
                textAlign: layout.alignment,
                width: '100%',
              }}
            >
              What is your favorite color?
            </div>

            <div
              style={{
                fontFamily: getFontFamilyValue(fonts.answerFamily),
                fontSize: fonts.answerSize,
                fontWeight: fonts.answerWeight,
                color: colors.secondaryText,
                textAlign: layout.alignment,
                width: '100%',
              }}
            >
              This is a sample description for the question.
            </div>

            <div className="w-full" style={{ textAlign: layout.alignment }}>
              <input
                type="text"
                placeholder="Type your answer here..."
                className="w-full max-w-md border-b-2 bg-transparent outline-none py-2"
                style={{
                  borderColor: colors.primary,
                  fontFamily: getFontFamilyValue(fonts.answerFamily),
                  fontSize: fonts.answerSize,
                  color: colors.text,
                }}
              />
            </div>

            <div style={{ textAlign: layout.alignment, width: '100%' }}>
              <button
                style={{
                  backgroundColor: colors.primary,
                  color: colors.primaryText,
                  fontFamily: getFontFamilyValue(fonts.buttonFamily),
                  fontSize: fonts.buttonSize,
                  fontWeight: fonts.buttonWeight,
                  padding: layout.buttonSize === 'small' ? '8px 16px'
                    : layout.buttonSize === 'large' ? '16px 32px'
                    : '12px 24px',
                  borderRadius: layout.buttonShape === 'pill' ? '9999px'
                    : layout.buttonShape === 'square' ? '0'
                    : '8px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Continue
              </button>
            </div>

            <div
              style={{
                fontSize: '14px',
                color: colors.secondaryText,
              }}
            >
              Press Enter to continue
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ColorsPanelProps {
  colors: ThemeColors
  setColors: (colors: ThemeColors) => void
}

function ColorsPanel({ colors, setColors }: ColorsPanelProps) {
  const updateColor = (key: keyof ThemeColors, value: string) => {
    setColors({ ...colors, [key]: value })
  }

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Color Presets</label>
        <div className="grid grid-cols-4 gap-2">
          {COLOR_PRESETS.map(preset => (
            <button
              key={preset.name}
              onClick={() => setColors({ ...colors, primary: preset.primary, background: preset.background })}
              className="p-2 rounded-lg border border-gray-200 hover:border-gray-300"
              title={preset.name}
            >
              <div className="flex gap-1">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: preset.primary }}
                />
                <div
                  className="w-4 h-4 rounded border border-gray-200"
                  style={{ backgroundColor: preset.background }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Individual Colors */}
      <ColorInput label="Primary Color" value={colors.primary} onChange={(v) => updateColor('primary', v)} />
      <ColorInput label="Primary Text" value={colors.primaryText} onChange={(v) => updateColor('primaryText', v)} />
      <ColorInput label="Background" value={colors.background} onChange={(v) => updateColor('background', v)} />
      <ColorInput label="Text Color" value={colors.text} onChange={(v) => updateColor('text', v)} />
      <ColorInput label="Secondary Text" value={colors.secondaryText} onChange={(v) => updateColor('secondaryText', v)} />
      <ColorInput label="Error Color" value={colors.error} onChange={(v) => updateColor('error', v)} />
      <ColorInput label="Success Color" value={colors.success} onChange={(v) => updateColor('success', v)} />
    </div>
  )
}

interface ColorInputProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded cursor-pointer border border-gray-200"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
        />
      </div>
    </div>
  )
}

interface TypographyPanelProps {
  fonts: ThemeFonts
  setFonts: (fonts: ThemeFonts) => void
}

function TypographyPanel({ fonts, setFonts }: TypographyPanelProps) {
  const fontOptions = GOOGLE_FONTS.map(f => ({ value: f.family, label: f.family }))
  const weightOptions = [
    { value: '400', label: 'Regular' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semibold' },
    { value: '700', label: 'Bold' },
  ]
  const sizeOptions = [
    { value: '14px', label: '14px' },
    { value: '16px', label: '16px' },
    { value: '18px', label: '18px' },
    { value: '20px', label: '20px' },
    { value: '24px', label: '24px' },
    { value: '28px', label: '28px' },
    { value: '32px', label: '32px' },
    { value: '36px', label: '36px' },
  ]

  return (
    <div className="space-y-6">
      {/* Question Font */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Question Text</h4>
        <Select
          label="Font Family"
          options={fontOptions}
          value={fonts.questionFamily}
          onChange={(e) => setFonts({ ...fonts, questionFamily: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-2">
          <Select
            label="Size"
            options={sizeOptions}
            value={fonts.questionSize}
            onChange={(e) => setFonts({ ...fonts, questionSize: e.target.value })}
          />
          <Select
            label="Weight"
            options={weightOptions}
            value={fonts.questionWeight}
            onChange={(e) => setFonts({ ...fonts, questionWeight: e.target.value })}
          />
        </div>
      </div>

      {/* Answer Font */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Answer Text</h4>
        <Select
          label="Font Family"
          options={fontOptions}
          value={fonts.answerFamily}
          onChange={(e) => setFonts({ ...fonts, answerFamily: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-2">
          <Select
            label="Size"
            options={sizeOptions}
            value={fonts.answerSize}
            onChange={(e) => setFonts({ ...fonts, answerSize: e.target.value })}
          />
          <Select
            label="Weight"
            options={weightOptions}
            value={fonts.answerWeight}
            onChange={(e) => setFonts({ ...fonts, answerWeight: e.target.value })}
          />
        </div>
      </div>

      {/* Button Font */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Button Text</h4>
        <Select
          label="Font Family"
          options={fontOptions}
          value={fonts.buttonFamily}
          onChange={(e) => setFonts({ ...fonts, buttonFamily: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-2">
          <Select
            label="Size"
            options={sizeOptions}
            value={fonts.buttonSize}
            onChange={(e) => setFonts({ ...fonts, buttonSize: e.target.value })}
          />
          <Select
            label="Weight"
            options={weightOptions}
            value={fonts.buttonWeight}
            onChange={(e) => setFonts({ ...fonts, buttonWeight: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}

interface BackgroundPanelProps {
  background: ThemeBackground
  setBackground: (background: ThemeBackground) => void
}

function BackgroundPanel({ background, setBackground }: BackgroundPanelProps) {
  return (
    <div className="space-y-6">
      <Select
        label="Background Type"
        options={[
          { value: 'solid', label: 'Solid Color' },
          { value: 'gradient', label: 'Gradient' },
          { value: 'image', label: 'Image' },
        ]}
        value={background.type}
        onChange={(e) => setBackground({ ...background, type: e.target.value as ThemeBackground['type'] })}
      />

      {background.type === 'solid' && (
        <ColorInput
          label="Background Color"
          value={background.color || '#ffffff'}
          onChange={(v) => setBackground({ ...background, color: v })}
        />
      )}

      {background.type === 'gradient' && (
        <>
          <ColorInput
            label="Gradient Start"
            value={background.gradient?.from || '#6366f1'}
            onChange={(v) => setBackground({
              ...background,
              gradient: { ...(background.gradient || { from: '#6366f1', to: '#a855f7', direction: 'to bottom' }), from: v }
            })}
          />
          <ColorInput
            label="Gradient End"
            value={background.gradient?.to || '#a855f7'}
            onChange={(v) => setBackground({
              ...background,
              gradient: { ...(background.gradient || { from: '#6366f1', to: '#a855f7', direction: 'to bottom' }), to: v }
            })}
          />
          <Select
            label="Direction"
            options={[
              { value: 'to bottom', label: 'Top to Bottom' },
              { value: 'to right', label: 'Left to Right' },
              { value: 'to bottom right', label: 'Diagonal' },
              { value: '135deg', label: 'Reverse Diagonal' },
            ]}
            value={background.gradient?.direction || 'to bottom'}
            onChange={(e) => setBackground({
              ...background,
              gradient: { ...(background.gradient || { from: '#6366f1', to: '#a855f7', direction: 'to bottom' }), direction: e.target.value }
            })}
          />
        </>
      )}

      {background.type === 'image' && (
        <>
          <Input
            label="Image URL"
            placeholder="https://example.com/image.jpg"
            value={background.imageUrl || ''}
            onChange={(e) => setBackground({ ...background, imageUrl: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opacity: {background.opacity ?? 100}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={background.opacity ?? 100}
              onChange={(e) => setBackground({ ...background, opacity: Number(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blur: {background.blur ?? 0}px
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={background.blur ?? 0}
              onChange={(e) => setBackground({ ...background, blur: Number(e.target.value) })}
              className="w-full"
            />
          </div>
        </>
      )}
    </div>
  )
}

interface LayoutPanelProps {
  layout: ThemeLayout
  setLayout: (layout: ThemeLayout) => void
}

function LayoutPanel({ layout, setLayout }: LayoutPanelProps) {
  return (
    <div className="space-y-6">
      <Select
        label="Text Alignment"
        options={[
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ]}
        value={layout.alignment}
        onChange={(e) => setLayout({ ...layout, alignment: e.target.value as ThemeLayout['alignment'] })}
      />

      <Select
        label="Container Width"
        options={[
          { value: 'narrow', label: 'Narrow (480px)' },
          { value: 'medium', label: 'Medium (640px)' },
          { value: 'wide', label: 'Wide (800px)' },
          { value: 'full', label: 'Full Width' },
        ]}
        value={layout.containerWidth}
        onChange={(e) => setLayout({ ...layout, containerWidth: e.target.value as ThemeLayout['containerWidth'] })}
      />

      <Select
        label="Spacing"
        options={[
          { value: 'compact', label: 'Compact' },
          { value: 'normal', label: 'Normal' },
          { value: 'relaxed', label: 'Relaxed' },
        ]}
        value={layout.spacing}
        onChange={(e) => setLayout({ ...layout, spacing: e.target.value as ThemeLayout['spacing'] })}
      />

      <Select
        label="Button Shape"
        options={[
          { value: 'rounded', label: 'Rounded' },
          { value: 'pill', label: 'Pill' },
          { value: 'square', label: 'Square' },
        ]}
        value={layout.buttonShape}
        onChange={(e) => setLayout({ ...layout, buttonShape: e.target.value as ThemeLayout['buttonShape'] })}
      />

      <Select
        label="Button Size"
        options={[
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' },
        ]}
        value={layout.buttonSize}
        onChange={(e) => setLayout({ ...layout, buttonSize: e.target.value as ThemeLayout['buttonSize'] })}
      />
    </div>
  )
}
