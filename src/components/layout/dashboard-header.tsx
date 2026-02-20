'use client'

import WorkspaceSwitcher from '@/components/workspace/workspace-switcher'

interface DashboardHeaderProps {
  workspaceSlug: string
}

const DashboardHeader = ({ workspaceSlug }: DashboardHeaderProps) => {
  // Mock data - will be replaced with real data from API
  const currentWorkspace = {
    id: '1',
    name: 'My Workspace',
    slug: workspaceSlug,
  }

  const workspaces = [
    { id: '1', name: 'My Workspace', slug: 'my-workspace' },
    { id: '2', name: 'Team Project', slug: 'team-project' },
    { id: '3', name: 'Personal Forms', slug: 'personal-forms' },
  ]

  return (
    <header
      className="h-16 sticky top-0 z-30 bg-white"
      style={{
        borderBottom: '3px solid #000',
        boxShadow: '0 4px 0 0 rgba(0,0,0,0.85)',
      }}
    >
      <div className="h-full px-6 flex items-center justify-between">
        <WorkspaceSwitcher
          currentWorkspace={currentWorkspace}
          workspaces={workspaces}
          onWorkspaceChange={(workspace) => {
            window.location.href = `/${workspace.slug}`
          }}
        />

        <div className="flex items-center gap-3">
          {/* Streak indicator */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-400 to-amber-400 text-white"
            style={{
              border: '2.5px solid #000',
              boxShadow: '3px 3px 0 0 rgba(0,0,0,0.85)',
            }}
          >
            <span className="text-sm">🔥</span>
            <span className="text-xs font-extrabold">12</span>
            <span className="text-[10px] font-bold text-white/80">day streak</span>
          </div>

          {/* Notification bell */}
          <button
            className="p-2 rounded-lg bg-white hover:bg-yellow-100 transition-colors relative"
            style={{
              border: '2.5px solid #000',
              boxShadow: '3px 3px 0 0 rgba(0,0,0,0.85)',
            }}
          >
            <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {/* Notification dot */}
            <span
              className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"
              style={{ border: '1.5px solid #000' }}
            />
          </button>

          {/* Help button */}
          <button
            className="p-2 rounded-lg bg-white hover:bg-yellow-100 transition-colors"
            style={{
              border: '2.5px solid #000',
              boxShadow: '3px 3px 0 0 rgba(0,0,0,0.85)',
            }}
          >
            <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
