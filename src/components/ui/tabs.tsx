'use client'

import { ReactNode, useState, createContext, useContext } from 'react'

interface TabsContextType {
  activeTab: string
  setActiveTab: (value: string) => void
  variant: 'default' | 'game' | 'dashboard'
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

export interface TabsProps {
  defaultValue: string
  children: ReactNode
  className?: string
  onValueChange?: (value: string) => void
  variant?: 'default' | 'game' | 'dashboard'
}

export interface TabsListProps {
  children: ReactNode
  className?: string
}

export interface TabsTriggerProps {
  value: string
  children: ReactNode
  className?: string
}

export interface TabsContentProps {
  value: string
  children: ReactNode
  className?: string
}

const Tabs = ({ defaultValue, children, className = '', onValueChange, variant = 'default' }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultValue)

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    onValueChange?.(value)
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange, variant }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

const TabsList = ({ children, className = '' }: TabsListProps) => {
  const context = useContext(TabsContext)
  const variant = context?.variant || 'default'

  const styleMap = {
    game: 'inline-flex h-10 items-center justify-center rounded-xl bg-white p-1 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)]',
    dashboard: 'inline-flex h-10 items-center justify-center rounded-xl bg-gray-100/80 p-1',
    default: 'inline-flex h-10 items-center justify-center rounded-lg bg-surface p-1',
  }
  const baseStyles = styleMap[variant] || styleMap.default

  return (
    <div
      role="tablist"
      className={`${baseStyles} ${className}`}
    >
      {children}
    </div>
  )
}

const TabsTrigger = ({ value, children, className = '' }: TabsTriggerProps) => {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')

  const { activeTab, setActiveTab, variant } = context
  const isActive = activeTab === value

  const defaultStyles = isActive
    ? 'bg-background text-text-primary shadow-sm'
    : 'text-text-secondary hover:text-text-primary'

  const gameStyles = isActive
    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-sm font-bold'
    : 'text-gray-600 hover:text-gray-900'

  const dashboardStyles = isActive
    ? 'bg-white text-gray-900 font-semibold shadow-sm'
    : 'text-gray-500 hover:text-gray-700'

  const activeStyles = variant === 'game' ? gameStyles : variant === 'dashboard' ? dashboardStyles : defaultStyles

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(value)}
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5
        text-sm font-medium transition-all
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
        disabled:pointer-events-none disabled:opacity-50
        ${activeStyles}
        ${className}
      `}
    >
      {children}
    </button>
  )
}

const TabsContent = ({ value, children, className = '' }: TabsContentProps) => {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used within Tabs')

  const { activeTab } = context
  if (activeTab !== value) return null

  return (
    <div
      role="tabpanel"
      className={`mt-2 focus-visible:outline-none ${className}`}
    >
      {children}
    </div>
  )
}

Tabs.displayName = 'Tabs'
TabsList.displayName = 'TabsList'
TabsTrigger.displayName = 'TabsTrigger'
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent }
export default Tabs
