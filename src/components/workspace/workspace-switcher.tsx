'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/button'

interface Workspace {
  id: string
  name: string
  slug: string
}

interface WorkspaceSwitcherProps {
  currentWorkspace: Workspace
  workspaces: Workspace[]
  onWorkspaceChange?: (workspace: Workspace) => void
}

const WorkspaceSwitcher = ({ currentWorkspace, workspaces, onWorkspaceChange }: WorkspaceSwitcherProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleWorkspaceSelect = (workspace: Workspace) => {
    onWorkspaceChange?.(workspace)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface border border-border transition-colors"
      >
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <span className="text-primary font-semibold text-sm">
            {currentWorkspace.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-text-primary">{currentWorkspace.name}</p>
        </div>
        <svg
          className={`w-4 h-4 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 w-64 bg-surface border border-border rounded-lg shadow-lg z-20 overflow-hidden"
            >
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-medium text-text-secondary uppercase">
                  Your Workspaces
                </p>
                <div className="space-y-1">
                  {workspaces.map((workspace) => (
                    <button
                      key={workspace.id}
                      onClick={() => handleWorkspaceSelect(workspace)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                        ${
                          workspace.id === currentWorkspace.id
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-border text-text-primary'
                        }
                      `}
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold text-sm">
                          {workspace.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{workspace.name}</p>
                        <p className="text-xs text-text-secondary truncate">/{workspace.slug}</p>
                      </div>
                      {workspace.id === currentWorkspace.id && (
                        <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-2 border-t border-border">
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Workspace
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default WorkspaceSwitcher
