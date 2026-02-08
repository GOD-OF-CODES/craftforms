'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Workspace {
  id: string
  name: string
  slug: string
}

interface WorkspaceSwitcherProps {
  currentWorkspace: Workspace
  workspaces: Workspace[]
}

export default function WorkspaceSwitcher({ currentWorkspace, workspaces }: WorkspaceSwitcherProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  const handleSwitch = (workspace: Workspace) => {
    router.push(`/${workspace.slug}`)
    setIsOpen(false)
  }

  const handleCreateNew = () => {
    setIsOpen(false)
    setShowCreateModal(true)
    setNewWorkspaceName('')
    setError('')
  }

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      setError('Please enter a workspace name')
      return
    }

    setIsCreating(true)
    setError('')

    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWorkspaceName.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create workspace')
      }

      const newWorkspace = await response.json()
      setShowCreateModal(false)
      router.push(`/${newWorkspace.slug}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workspace')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-surface border border-border rounded-lg hover:bg-background transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-semibold">
            {currentWorkspace.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-text-primary">{currentWorkspace.name}</p>
            <p className="text-xs text-text-secondary">Switch workspace</p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto">
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-semibold text-text-secondary uppercase">
                Your Workspaces
              </p>
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => handleSwitch(workspace)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background transition-colors ${
                    workspace.id === currentWorkspace.id ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                    {workspace.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-text-primary">{workspace.name}</p>
                    <p className="text-xs text-text-secondary">/{workspace.slug}</p>
                  </div>
                  {workspace.id === currentWorkspace.id && (
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-border p-2">
              <button
                onClick={handleCreateNew}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background transition-colors text-left"
              >
                <div className="w-8 h-8 bg-background border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-text-primary">Create New Workspace</p>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative bg-surface rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Create New Workspace
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="workspace-name" className="block text-sm font-medium text-text-secondary mb-1">
                  Workspace Name
                </label>
                <input
                  id="workspace-name"
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateWorkspace()
                  }}
                  placeholder="My Workspace"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
                {error && (
                  <p className="mt-1 text-sm text-red-500">{error}</p>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateWorkspace}
                  disabled={isCreating}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
