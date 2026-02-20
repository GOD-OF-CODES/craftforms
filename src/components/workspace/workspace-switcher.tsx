'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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

const workspaceColors = [
  'from-purple-500 to-pink-500',
  'from-blue-500 to-cyan-500',
  'from-green-500 to-emerald-500',
]

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
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-yellow-50 transition-colors"
        style={{
          border: '2.5px solid #000',
          boxShadow: '3px 3px 0 0 rgba(0,0,0,0.85)',
        }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500"
          style={{ border: '2px solid #000' }}
        >
          <span className="text-white font-bold text-sm">
            {currentWorkspace.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold text-gray-900">{currentWorkspace.name}</p>
        </div>
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
              className="absolute top-full left-0 mt-2 w-64 bg-white z-20 overflow-hidden"
              style={{
                border: '2.5px solid #000',
                borderRadius: '16px',
                boxShadow: '6px 6px 0 0 rgba(0,0,0,0.85)',
              }}
            >
              <div className="p-2">
                <p
                  className="px-3 py-2 text-[10px] font-extrabold text-gray-500 uppercase tracking-wider"
                >
                  Your Workspaces
                </p>
                <div className="space-y-1">
                  {workspaces.map((workspace, idx) => (
                    <button
                      key={workspace.id}
                      onClick={() => handleWorkspaceSelect(workspace)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all font-semibold
                        ${
                          workspace.id === currentWorkspace.id
                            ? 'bg-yellow-100 text-gray-900'
                            : 'hover:bg-gray-50 text-gray-700'
                        }
                      `}
                      style={
                        workspace.id === currentWorkspace.id
                          ? { border: '2px solid #000', boxShadow: '2px 2px 0 0 rgba(0,0,0,0.85)' }
                          : {}
                      }
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${workspaceColors[idx % workspaceColors.length]}`}
                        style={{ border: '2px solid #000' }}
                      >
                        <span className="font-bold text-sm text-white">
                          {workspace.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{workspace.name}</p>
                        <p className="text-xs text-gray-400 truncate font-mono">/{workspace.slug}</p>
                      </div>
                      {workspace.id === currentWorkspace.id && (
                        <span className="text-green-500 font-bold">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-2" style={{ borderTop: '2px solid #000' }}>
                <button
                  className="w-full flex items-center justify-start gap-2 px-3 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-yellow-50 rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Workspace
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default WorkspaceSwitcher
