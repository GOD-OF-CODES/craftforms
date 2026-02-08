'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import Badge from '@/components/ui/badge'
import Input from '@/components/ui/input'
import DropdownMenu from '@/components/ui/dropdown-menu'
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
        description: 'No workspace found',
        variant: 'error'
      })
      return
    }

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
        throw new Error('Failed to create form')
      }
    } catch (error) {
      console.error('Failed to create form:', error)
      addToast({
        title: 'Error',
        description: 'Failed to create form',
        variant: 'error'
      })
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

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-6">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-text-primary mb-2">Forms</h1>
          <p className="text-text-secondary">Create and manage your forms</p>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateForm}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Form
          </Button>
        </div>

        {/* Forms Grid */}
        {filteredForms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <Card key={form.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <Link href={`/${params.workspaceSlug}/forms/${form.id}/edit`} className="flex-1">
                    <h3 className="text-lg font-semibold text-text-primary mb-1 hover:text-primary">
                      {form.title}
                    </h3>
                    <p className="text-sm text-text-secondary">/{form.slug}</p>
                  </Link>
                  <DropdownMenu
                    trigger={
                      <button className="p-1 hover:bg-border rounded transition-colors">
                        <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    }
                    items={[
                      {
                        label: 'Edit',
                        onClick: () => router.push(`/${params.workspaceSlug}/forms/${form.id}/edit`)
                      },
                      {
                        label: 'View Responses',
                        onClick: () => router.push(`/${params.workspaceSlug}/forms/${form.id}/responses`)
                      },
                      {
                        label: 'Delete',
                        variant: 'danger',
                        onClick: () => handleDeleteForm(form.id)
                      },
                    ]}
                  />
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <Badge variant={form.isPublished ? 'success' : 'default'}>
                    {form.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                  <span className="text-sm text-text-secondary">
                    {form.responseCount} responses
                  </span>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span>Updated {formatDate(form.updatedAt)}</span>
                    <span>Created {formatDate(form.createdAt)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">No forms found</h3>
            <p className="text-text-secondary mb-4">
              {searchQuery ? 'Try a different search term' : 'Get started by creating your first form'}
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateForm}>Create New Form</Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
