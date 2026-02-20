'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'

interface Form {
  id: string
  title: string
  slug: string
  isPublished: boolean
  responseCount: number
  createdAt: string
  updatedAt: string
}

interface Workspace {
  id: string
  slug: string
  name: string
}

export default function WorkspacePage({
  params
}: {
  params: { workspaceSlug: string }
}) {
  const router = useRouter()
  const { addToast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [forms, setForms] = useState<Form[]>([])
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to get workspace by slug
        const wsResponse = await fetch(`/api/workspaces/by-slug/${params.workspaceSlug}`)

        if (wsResponse.ok) {
          const wsData = await wsResponse.json()
          setWorkspace(wsData.workspace)

          // Fetch forms
          const formsResponse = await fetch(`/api/workspaces/by-slug/${params.workspaceSlug}/forms`)
          if (formsResponse.ok) {
            const formsData = await formsResponse.json()
            setForms(formsData.forms || [])
          }
        } else if (wsResponse.status === 404) {
          // Workspace not found - check if user has any workspaces
          const allWsResponse = await fetch('/api/workspaces')
          if (allWsResponse.ok) {
            const allWsData = await allWsResponse.json()

            if (allWsData.workspaces && allWsData.workspaces.length > 0) {
              // Redirect to first workspace
              router.replace(`/${allWsData.workspaces[0].slug}`)
              return
            } else {
              // No workspaces - create one
              const createResponse = await fetch('/api/workspaces', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'My Workspace' })
              })

              if (createResponse.ok) {
                const newWs = await createResponse.json()
                router.replace(`/${newWs.workspace.slug}`)
                return
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.workspaceSlug, router])

  const handleCreateForm = async () => {
    if (!workspace) {
      addToast({
        title: 'Error',
        description: 'No workspace found. Please refresh the page.',
        variant: 'error'
      })
      return
    }

    if (creating) return
    setCreating(true)

    try {
      const response = await fetch(`/api/workspaces/${workspace.id}/forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Form' })
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/${params.workspaceSlug}/forms/${data.form.id}/edit`)
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to create form')
      }
    } catch (error) {
      console.error('Failed to create form:', error)
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create form',
        variant: 'error'
      })
      setCreating(false)
    }
  }

  const handleDeleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return

    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setForms(forms.filter(f => f.id !== formId))
        addToast({
          title: 'Form deleted',
          description: 'The form has been permanently removed',
          variant: 'success'
        })
      }
    } catch (error) {
      console.error('Failed to delete form:', error)
      addToast({
        title: 'Error',
        description: 'Failed to delete form',
        variant: 'error'
      })
    }
  }

  const filteredForms = forms.filter((form) =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const cardColors = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-orange-400 to-amber-500',
    'from-rose-500 to-red-500',
    'from-indigo-500 to-violet-500',
  ]

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/50 rounded-xl w-1/4" style={{ border: '3px solid #000' }}></div>
          <div className="h-12 bg-white/50 rounded-xl w-1/3" style={{ border: '3px solid #000' }}></div>
          <div className="grid grid-cols-3 gap-6">
            <div className="h-48 bg-white/50 rounded-xl" style={{ border: '3px solid #000' }}></div>
            <div className="h-48 bg-white/50 rounded-xl" style={{ border: '3px solid #000' }}></div>
            <div className="h-48 bg-white/50 rounded-xl" style={{ border: '3px solid #000' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2" style={{ textShadow: '2px 2px 0 rgba(255,255,255,0.5)' }}>
            <span className="mr-2">📋</span>Forms
          </h1>
          <p className="text-gray-800 font-semibold">Create and manage your forms</p>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <input
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none"
              style={{
                border: '2.5px solid #000',
                boxShadow: '3px 3px 0 0 rgba(0,0,0,0.85)',
              }}
            />
          </div>
          <button
            onClick={handleCreateForm}
            disabled={creating}
            className="game-btn inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50"
          >
            {creating ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Form
              </>
            )}
          </button>
        </div>

        {/* Forms Grid */}
        {filteredForms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form, index) => (
              <div
                key={form.id}
                className="bg-white rounded-2xl overflow-hidden game-card-hover"
                style={{
                  border: '3px solid #000',
                  boxShadow: '6px 6px 0 0 rgba(0,0,0,0.85)',
                  animationDelay: `${index * 0.07}s`,
                }}
              >
                {/* Card color header */}
                <div
                  className={`h-2 bg-gradient-to-r ${cardColors[index % cardColors.length]}`}
                  style={{ borderBottom: '2px solid #000' }}
                />

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Link href={`/${params.workspaceSlug}/forms/${form.id}/edit`} className="flex-1">
                      <h3 className="text-lg font-extrabold text-gray-900 mb-1 hover:text-purple-600 transition-colors">
                        {form.title}
                      </h3>
                      <p className="text-sm text-gray-400 font-mono">/{form.slug}</p>
                    </Link>
                    <div className="flex gap-1">
                      <button
                        onClick={() => router.push(`/${params.workspaceSlug}/forms/${form.id}/edit`)}
                        className="p-1.5 rounded-lg hover:bg-yellow-100 transition-colors"
                        style={{ border: '2px solid #000', boxShadow: '2px 2px 0 0 rgba(0,0,0,0.85)' }}
                        title="Edit"
                      >
                        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteForm(form.id)}
                        className="p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                        style={{ border: '2px solid #000', boxShadow: '2px 2px 0 0 rgba(0,0,0,0.85)' }}
                        title="Delete"
                      >
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg ${
                        form.isPublished
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      style={{
                        border: '2px solid #000',
                        boxShadow: '2px 2px 0 0 rgba(0,0,0,0.85)',
                      }}
                    >
                      {form.isPublished ? '✓ Published' : 'Draft'}
                    </span>
                    <Link
                      href={`/${params.workspaceSlug}/forms/${form.id}/responses`}
                      className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg bg-yellow-300 text-gray-900 hover:bg-yellow-400 transition-colors cursor-pointer"
                      style={{
                        border: '2px solid #000',
                        boxShadow: '2px 2px 0 0 rgba(0,0,0,0.85)',
                      }}
                    >
                      📝 {form.responseCount} responses
                    </Link>
                  </div>

                  <div className="pt-4" style={{ borderTop: '2px dashed rgba(0,0,0,0.15)' }}>
                    <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
                      <span>Updated {formatDate(form.updatedAt)}</span>
                      <span>Created {formatDate(form.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="bg-white rounded-2xl text-center py-16 px-8"
            style={{
              border: '3px solid #000',
              boxShadow: '6px 6px 0 0 rgba(0,0,0,0.85)',
            }}
          >
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">No forms found</h3>
            <p className="text-gray-600 font-semibold mb-6">
              {searchQuery ? 'Try a different search term' : 'Get started by creating your first form!'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleCreateForm}
                disabled={creating}
                className="game-btn inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-8 py-3 rounded-xl text-base disabled:opacity-50"
              >
                Create New Form →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
