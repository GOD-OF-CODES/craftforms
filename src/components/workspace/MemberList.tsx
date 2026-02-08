'use client'

import { useState, ChangeEvent } from 'react'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Select from '@/components/ui/select'
import Badge from '@/components/ui/badge'
import Modal from '@/components/ui/modal'
import Avatar from '@/components/ui/avatar'
import { getRoleName, getRoleDescription, WorkspaceRole } from '@/lib/permissions'

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

interface MemberListProps {
  workspaceId: string
  members: Member[]
  owner: User | null
  currentUserId: string
  currentUserRole: WorkspaceRole
  onMemberUpdate: () => void
}

export function MemberList({
  workspaceId,
  members,
  owner,
  currentUserId,
  currentUserRole,
  onMemberUpdate
}: MemberListProps) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('viewer')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'admin'

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      setError('Email is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to invite member')
      }

      setSuccess(data.invited ? `Invitation sent to ${inviteEmail}` : `${inviteEmail} added to workspace`)
      setInviteEmail('')
      setInviteRole('viewer')
      setIsInviteModalOpen(false)
      onMemberUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite member')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update member role')
      }

      setSuccess('Member role updated successfully')
      onMemberUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from this workspace?`)) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members/${memberId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove member')
      }

      setSuccess(`${memberName} has been removed from the workspace`)
      onMemberUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default'
      case 'admin': return 'info'
      case 'editor': return 'success'
      case 'viewer': return 'warning'
      default: return 'default'
    }
  }

  const canChangeRole = (memberRole: string): boolean => {
    if (!canManageMembers) return false
    if (currentUserRole === 'owner') return true
    // Admins can only change roles of editors and viewers
    return memberRole !== 'admin' && memberRole !== 'owner'
  }

  const canRemoveMember = (memberRole: string, memberId: string): boolean => {
    // Can always remove yourself (leave workspace)
    const member = members.find(m => m.id === memberId)
    if (member?.user.id === currentUserId) return currentUserRole !== 'owner'

    if (!canManageMembers) return false
    if (currentUserRole === 'owner') return true
    // Admins can only remove editors and viewers
    return memberRole !== 'admin' && memberRole !== 'owner'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
          <p className="text-sm text-gray-500">
            Manage who has access to this workspace
          </p>
        </div>
        {canManageMembers && (
          <Button onClick={() => setIsInviteModalOpen(true)}>
            Invite Member
          </Button>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Members List */}
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
        {/* Owner */}
        {owner && (
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar
                src={owner.avatarUrl || undefined}
                alt={owner.name || owner.email}
                fallback={owner.name?.[0] || owner.email[0]}
              />
              <div>
                <p className="font-medium text-gray-900">
                  {owner.name || owner.email}
                  {owner.id === currentUserId && (
                    <span className="ml-2 text-xs text-gray-500">(you)</span>
                  )}
                </p>
                <p className="text-sm text-gray-500">{owner.email}</p>
              </div>
            </div>
            <Badge variant={getRoleBadgeVariant('owner')}>
              {getRoleName('owner')}
            </Badge>
          </div>
        )}

        {/* Members */}
        {members.map((member) => (
          <div key={member.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar
                src={member.user.avatarUrl || undefined}
                alt={member.user.name || member.user.email}
                fallback={member.user.name?.[0] || member.user.email[0]}
              />
              <div>
                <p className="font-medium text-gray-900">
                  {member.user.name || member.user.email}
                  {member.user.id === currentUserId && (
                    <span className="ml-2 text-xs text-gray-500">(you)</span>
                  )}
                </p>
                <p className="text-sm text-gray-500">{member.user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {canChangeRole(member.role) ? (
                <Select
                  value={member.role}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => handleRoleChange(member.id, e.target.value)}
                  options={[
                    { value: 'viewer', label: 'Viewer' },
                    { value: 'editor', label: 'Editor' },
                    ...(currentUserRole === 'owner' ? [{ value: 'admin', label: 'Admin' }] : [])
                  ]}
                  className="w-32"
                  disabled={isLoading}
                />
              ) : (
                <Badge variant={getRoleBadgeVariant(member.role)}>
                  {getRoleName(member.role as WorkspaceRole)}
                </Badge>
              )}
              {canRemoveMember(member.role, member.id) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveMember(member.id, member.user.name || member.user.email)}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {member.user.id === currentUserId ? 'Leave' : 'Remove'}
                </Button>
              )}
            </div>
          </div>
        ))}

        {members.length === 0 && !owner && (
          <div className="p-8 text-center text-gray-500">
            No members yet. Invite team members to collaborate.
          </div>
        )}
      </div>

      {/* Role Descriptions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Role Permissions</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div><strong>Owner:</strong> {getRoleDescription('owner')}</div>
          <div><strong>Admin:</strong> {getRoleDescription('admin')}</div>
          <div><strong>Editor:</strong> {getRoleDescription('editor')}</div>
          <div><strong>Viewer:</strong> {getRoleDescription('viewer')}</div>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Team Member"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <Select
              value={inviteRole}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setInviteRole(e.target.value)}
              options={[
                { value: 'viewer', label: 'Viewer - Can view forms and responses' },
                { value: 'editor', label: 'Editor - Can create and edit forms' },
                ...(currentUserRole === 'owner' ? [{ value: 'admin', label: 'Admin - Can manage members and settings' }] : [])
              ]}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsInviteModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              isLoading={isLoading}
            >
              Send Invite
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default MemberList
