'use client'

import { ReactNode, useState, createContext, useContext } from 'react'

interface TabsContextType {
  activeTab: string
  setActiveTab: (value: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

export interface TabsProps {
  defaultValue: string
  children: ReactNode
  className?: string
  onValueChange?: (value: string) => void
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

const Tabs = ({ defaultValue, children, className = '', onValueChange }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultValue)

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    onValueChange?.(value)
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

const TabsList = ({ children, className = '' }: TabsListProps) => {
  return (
    <div
      role="tablist"
      className={`inline-flex h-10 items-center justify-center rounded-lg bg-surface p-1 ${className}`}
    >
      {children}
    </div>
  )
}

const TabsTrigger = ({ value, children, className = '' }: TabsTriggerProps) => {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')

  const { activeTab, setActiveTab } = context
  const isActive = activeTab === value

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
        ${isActive ? 'bg-background text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}
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
