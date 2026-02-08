'use client'

import { ReactNode, createContext, useContext, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SidebarContextType {
  isOpen: boolean
  toggle: () => void
  open: () => void
  close: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }
  return context
}

export interface SidebarProps {
  children: ReactNode
  defaultOpen?: boolean
}

export interface SidebarContentProps {
  children: ReactNode
  className?: string
  position?: 'left' | 'right'
  width?: string
}

export const SidebarProvider = ({ children, defaultOpen = true }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const toggle = () => setIsOpen(!isOpen)
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, open, close }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const SidebarContent = ({
  children,
  className = '',
  position = 'left',
  width = '16rem',
}: SidebarContentProps) => {
  const { isOpen, close } = useSidebar()

  return (
    <>
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          [position === 'left' ? 'x' : 'x']: isOpen ? 0 : position === 'left' ? '-100%' : '100%',
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={`
          fixed top-0 ${position === 'left' ? 'left-0' : 'right-0'} z-50 h-full
          bg-surface border-${position === 'left' ? 'r' : 'l'} border-border
          overflow-y-auto
          lg:relative lg:translate-x-0
          ${className}
        `}
        style={{ width }}
      >
        {children}
      </motion.aside>
    </>
  )
}

export const SidebarHeader = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  return (
    <div className={`p-4 border-b border-border ${className}`}>
      {children}
    </div>
  )
}

export const SidebarBody = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  )
}

export const SidebarFooter = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  return (
    <div className={`p-4 border-t border-border mt-auto ${className}`}>
      {children}
    </div>
  )
}

export const SidebarTrigger = ({ className = '' }: { className?: string }) => {
  const { toggle } = useSidebar()

  return (
    <button
      onClick={toggle}
      className={`
        p-2 rounded-md hover:bg-surface transition-colors
        ${className}
      `}
      aria-label="Toggle sidebar"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  )
}

SidebarProvider.displayName = 'SidebarProvider'
SidebarContent.displayName = 'SidebarContent'
SidebarHeader.displayName = 'SidebarHeader'
SidebarBody.displayName = 'SidebarBody'
SidebarFooter.displayName = 'SidebarFooter'
SidebarTrigger.displayName = 'SidebarTrigger'
