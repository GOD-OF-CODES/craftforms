'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import Modal from '@/components/ui/modal'
import Input from '@/components/ui/input'

interface Theme {
  id: string
  name: string
  colors: {
    primary: string
    background: string
    text: string
  }
  fonts: {
    questionFamily: string
  }
  isPublic: boolean
  createdBy: string
  creator: {
    id: string
    name: string
  }
  _count: {
    forms: number
  }
  createdAt: string
}

export default function ThemesPage() {
  const params = useParams()
  const router = useRouter()
  const workspaceSlug = params.workspaceSlug as string

  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newThemeName, setNewThemeName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const fetchWorkspaceAndThemes = async () => {
      setLoading(true)
      try {
        // First get workspace by slug
        const wsResponse = await fetch(`/api/workspaces?slug=${workspaceSlug}`)
        if (!wsResponse.ok) return

        const workspaces = await wsResponse.json()
        const workspace = workspaces.find((w: { slug: string }) => w.slug === workspaceSlug)
        if (!workspace) return

        setWorkspaceId(workspace.id)

        // Then fetch themes
        const themesResponse = await fetch(`/api/workspaces/${workspace.id}/themes`)
        if (themesResponse.ok) {
          const data = await themesResponse.json()
          setThemes(data)
        }
      } catch (error) {
        console.error('Failed to fetch themes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkspaceAndThemes()
  }, [workspaceSlug])

  const handleCreateTheme = async () => {
    if (!workspaceId || !newThemeName.trim()) return

    setCreating(true)
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/themes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newThemeName }),
      })

      if (response.ok) {
        const theme = await response.json()
        router.push(`/${workspaceSlug}/themes/${theme.id}/edit`)
      }
    } catch (error) {
      console.error('Failed to create theme:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleDuplicateTheme = async (themeId: string) => {
    if (!workspaceId) return

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/themes/${themeId}/duplicate`, {
        method: 'POST',
      })

      if (response.ok) {
        const theme = await response.json()
        setThemes([theme, ...themes])
      }
    } catch (error) {
      console.error('Failed to duplicate theme:', error)
    }
  }

  const handleDeleteTheme = async (themeId: string) => {
    if (!workspaceId) return
    if (!confirm('Are you sure you want to delete this theme?')) return

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/themes/${themeId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setThemes(themes.filter(t => t.id !== themeId))
      }
    } catch (error) {
      console.error('Failed to delete theme:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Themes</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Theme
        </Button>
      </div>

      {themes.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No themes yet</h3>
          <p className="text-gray-500 mb-4">Create a custom theme to personalize your forms</p>
          <Button onClick={() => setIsCreateModalOpen(true)}>Create Your First Theme</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map(theme => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              workspaceSlug={workspaceSlug}
              onDuplicate={() => handleDuplicateTheme(theme.id)}
              onDelete={() => handleDeleteTheme(theme.id)}
            />
          ))}
        </div>
      )}

      {/* Create Theme Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          setNewThemeName('')
        }}
        title="Create New Theme"
      >
        <div className="space-y-4">
          <Input
            label="Theme Name"
            placeholder="My Custom Theme"
            value={newThemeName}
            onChange={(e) => setNewThemeName(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsCreateModalOpen(false)
                setNewThemeName('')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTheme}
              disabled={!newThemeName.trim() || creating}
              isLoading={creating}
            >
              Create Theme
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

interface ThemeCardProps {
  theme: Theme
  workspaceSlug: string
  onDuplicate: () => void
  onDelete: () => void
}

function ThemeCard({ theme, workspaceSlug, onDuplicate, onDelete }: ThemeCardProps) {
  const router = useRouter()

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* Theme Preview */}
      <div
        className="h-32 relative"
        style={{ backgroundColor: theme.colors?.background || '#ffffff' }}
      >
        <div className="absolute inset-0 p-4 flex flex-col justify-end">
          <div
            className="text-lg font-semibold mb-2"
            style={{
              color: theme.colors?.text || '#1f2937',
              fontFamily: theme.fonts?.questionFamily || 'Inter',
            }}
          >
            Sample Question
          </div>
          <div
            className="px-4 py-2 rounded inline-block w-fit text-sm"
            style={{
              backgroundColor: theme.colors?.primary || '#6366f1',
              color: '#ffffff',
            }}
          >
            Continue
          </div>
        </div>
      </div>

      {/* Theme Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900">{theme.name}</h3>
          {theme.isPublic && <Badge variant="info">Public</Badge>}
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Used by {theme._count.forms} form{theme._count.forms !== 1 ? 's' : ''}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => router.push(`/${workspaceSlug}/themes/${theme.id}/edit`)}
          >
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={onDuplicate}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </Button>
          {!theme.isPublic && (
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
