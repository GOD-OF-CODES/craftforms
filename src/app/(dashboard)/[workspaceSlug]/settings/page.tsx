'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Input from '@/components/ui/input'
import Button from '@/components/ui/button'
import Label from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'
import { MemberList } from '@/components/workspace/MemberList'
import { WorkspaceRole } from '@/lib/permissions'

interface Workspace {
  id: string
  name: string
  slug: string
  ownerId: string
}

interface User {
  id: string
  name: string | null
  email: string
  avatarUrl: string | null
}

interface Member {
  id: string
  role: string
  user: User
  createdAt: string
}

export default function WorkspaceSettingsPage({ params }: { params: { workspaceSlug: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [owner, setOwner] = useState<User | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<WorkspaceRole>('viewer')
  const [formData, setFormData] = useState({
    name: '',
    slug: params.workspaceSlug,
  })

  // Fetch workspace data
  useEffect(() => {
    const fetchWorkspaceData = async () => {
      try {
        const response = await fetch(`/api/workspaces/by-slug/${params.workspaceSlug}`)
        if (response.ok) {
          const data = await response.json()
          setWorkspace(data.workspace)
          setFormData({ name: data.workspace.name, slug: data.workspace.slug })
        } else {
          // Fallback for demo purposes
          setWorkspace({
            id: 'demo-workspace',
            name: 'My Workspace',
            slug: params.workspaceSlug,
            ownerId: session?.user?.id || ''
          })
          setFormData({ name: 'My Workspace', slug: params.workspaceSlug })
        }
      } catch (error) {
        console.error('Failed to fetch workspace:', error)
        // Fallback for demo
        setWorkspace({
          id: 'demo-workspace',
          name: 'My Workspace',
          slug: params.workspaceSlug,
          ownerId: session?.user?.id || ''
        })
        setFormData({ name: 'My Workspace', slug: params.workspaceSlug })
      }
    }
    fetchWorkspaceData()
  }, [params.workspaceSlug, session?.user?.id])

  // Fetch members
  const fetchMembers = useCallback(async () => {
    if (!workspace?.id) return

    try {
      const response = await fetch(`/api/workspaces/${workspace.id}/members`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data.members || [])
        setOwner(data.owner || null)

        // Determine current user's role
        if (data.owner?.id === session?.user?.id) {
          setCurrentUserRole('owner')
        } else {
          const currentMember = data.members?.find(
            (m: Member) => m.user.id === session?.user?.id
          )
          if (currentMember) {
            setCurrentUserRole(currentMember.role as WorkspaceRole)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch members:', error)
    }
  }, [workspace?.id, session?.user?.id])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const handleSave = async () => {
    if (!workspace?.id) return

    try {
      setLoading(true)
      const response = await fetch(`/api/workspaces/${workspace.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update workspace')
      }

      const data = await response.json()
      setWorkspace(data.workspace)

      // Redirect if slug changed
      if (formData.slug !== params.workspaceSlug) {
        router.push(`/${formData.slug}/settings`)
      }

      addToast({
        title: 'Settings Saved',
        description: 'Workspace settings updated successfully.',
        variant: 'success',
      })
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update workspace settings.',
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!workspace?.id) return

    if (deleteConfirm !== 'DELETE') {
      addToast({
        title: 'Error',
        description: 'Please type DELETE to confirm.',
        variant: 'error',
      })
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/workspaces/${workspace.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete workspace')
      }

      addToast({
        title: 'Workspace Deleted',
        description: 'Workspace has been permanently deleted.',
        variant: 'success',
      })
      router.push('/dashboard')
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete workspace.',
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Workspace Settings</h1>
        <p className="text-text-secondary">Manage your workspace configuration and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="space-y-8">
            {/* General Settings */}
            <section className="bg-surface border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">General</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="workspace-name">Workspace Name</Label>
                  <Input
                    id="workspace-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Workspace"
                  />
                  <p className="text-xs text-text-secondary mt-1">
                    The name of your workspace as it appears in the dashboard
                  </p>
                </div>

                <div>
                  <Label htmlFor="workspace-slug">Workspace Slug</Label>
                  <Input
                    id="workspace-slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="my-workspace"
                  />
                  <p className="text-xs text-text-secondary mt-1">
                    Used in URLs: example.com/<strong>{formData.slug || 'workspace-slug'}</strong>/forms
                  </p>
                </div>

                <Button onClick={handleSave} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </section>

            {/* Danger Zone */}
            {currentUserRole === 'owner' && (
              <section className="bg-surface border border-error rounded-lg p-6">
                <h2 className="text-xl font-semibold text-error mb-4">Danger Zone</h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-text-primary mb-4">
                      Deleting a workspace is permanent and cannot be undone. All forms, responses, and settings will be permanently deleted.
                    </p>

                    <Label htmlFor="delete-confirm">Type DELETE to confirm</Label>
                    <Input
                      id="delete-confirm"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="DELETE"
                      className="max-w-xs"
                    />
                  </div>

                  <Button
                    variant="danger"
                    onClick={handleDelete}
                    disabled={loading || deleteConfirm !== 'DELETE'}
                  >
                    {loading ? 'Deleting...' : 'Delete Workspace'}
                  </Button>
                </div>
              </section>
            )}
          </div>
        </TabsContent>

        <TabsContent value="members">
          {workspace ? (
            <MemberList
              workspaceId={workspace.id}
              members={members}
              owner={owner}
              currentUserId={session?.user?.id || ''}
              currentUserRole={currentUserRole}
              onMemberUpdate={fetchMembers}
            />
          ) : (
            <div className="bg-surface border border-border rounded-lg p-6">
              <p className="text-text-secondary">Loading member information...</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
