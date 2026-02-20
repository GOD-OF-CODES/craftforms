'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

interface SidebarProps {
  workspaceSlug: string
}

const Sidebar = ({ workspaceSlug }: SidebarProps) => {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showProfileMenu])

  const navigation = [
    {
      name: 'Forms',
      href: `/${workspaceSlug}`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'from-purple-500 to-pink-500',
    },
    {
      name: 'Responses',
      href: `/${workspaceSlug}/responses`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'Analytics',
      href: `/${workspaceSlug}/analytics`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'from-green-500 to-emerald-500',
    },
    {
      name: 'Themes',
      href: `/${workspaceSlug}/themes`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      color: 'from-orange-400 to-amber-500',
    },
    {
      name: 'Settings',
      href: `/${workspaceSlug}/settings`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'from-gray-500 to-gray-600',
    },
  ]

  const isActive = (href: string) => {
    if (href === `/${workspaceSlug}`) {
      return pathname === `/${workspaceSlug}` || pathname === `/`
    }
    return pathname.startsWith(href)
  }

  const profileMenuItems = [
    {
      label: 'Profile',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      href: `/${workspaceSlug}/profile`,
    },
    {
      label: 'Workspace Settings',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      href: `/${workspaceSlug}/settings`,
    },
    {
      label: 'Help & Support',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: `/${workspaceSlug}/help`,
    },
  ]

  return (
    <aside
      className="w-64 h-screen sticky top-0 flex flex-col relative z-20 bg-white"
      style={{
        borderRight: '3px solid #000',
        boxShadow: '4px 0 0 0 rgba(0,0,0,0.85)',
      }}
    >
      {/* Logo */}
      <div className="p-6" style={{ borderBottom: '3px solid #000' }}>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center"
            style={{
              border: '2px solid #000',
              boxShadow: '2px 2px 0 0 rgba(0,0,0,0.85)',
            }}
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="7" height="7" rx="1.5" />
              <rect x="14" y="4" width="7" height="7" rx="1.5" />
              <rect x="3" y="13" width="7" height="7" rx="1.5" />
              <rect x="14" y="13" width="7" height="7" rx="1.5" />
            </svg>
          </div>
          <span className="text-xl font-extrabold text-gray-900">CraftForms</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm
                  ${
                    isActive(item.href)
                      ? `bg-gradient-to-r ${item.color} text-white`
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
                style={
                  isActive(item.href)
                    ? {
                        border: '2.5px solid #000',
                        boxShadow: '3px 3px 0 0 rgba(0,0,0,0.85)',
                      }
                    : {}
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer with profile + XP */}
      <div className="relative p-4" style={{ borderTop: '3px solid #000' }} ref={menuRef}>
        {/* Profile popup menu */}
        {showProfileMenu && (
          <div
            className="absolute bottom-full left-4 right-4 mb-2 bg-white overflow-hidden z-50"
            style={{
              border: '2.5px solid #000',
              borderRadius: '12px',
              boxShadow: '4px 4px 0 0 rgba(0,0,0,0.85)',
            }}
          >
            {/* User info header */}
            <div className="px-4 py-3" style={{ borderBottom: '2px solid #000' }}>
              <p className="text-sm font-bold text-gray-900 truncate">
                {session?.user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session?.user?.email || ''}
              </p>
            </div>

            {/* Menu items */}
            <div className="py-1">
              {profileMenuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-yellow-100 hover:text-gray-900 transition-colors"
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Logout */}
            <div style={{ borderTop: '2px solid #000' }} className="py-1">
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors w-full"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Log out
              </button>
            </div>
          </div>
        )}

        {/* XP Progress */}
        <div className="mb-3 px-1">
          <div className="flex items-center justify-between mb-1.5">
            <span
              className="text-xs font-bold px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md"
              style={{ border: '2px solid #000', boxShadow: '2px 2px 0 0 rgba(0,0,0,0.85)' }}
            >
              LVL 7
            </span>
            <span className="text-[10px] text-gray-400 font-mono font-bold">2,450 / 3,000 XP</span>
          </div>
          <div
            className="overflow-hidden"
            style={{
              background: '#E5E7EB',
              borderRadius: '999px',
              height: '8px',
              border: '2px solid #000',
            }}
          >
            <div
              style={{
                width: '82%',
                height: '100%',
                borderRadius: '999px',
                background: 'linear-gradient(90deg, #8B5CF6, #EC4899)',
              }}
            />
          </div>
        </div>

        {/* Profile button */}
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl hover:bg-gray-100 transition-colors"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500"
            style={{
              border: '2px solid #000',
              boxShadow: '2px 2px 0 0 rgba(0,0,0,0.85)',
            }}
          >
            <span className="text-white font-bold text-sm">
              {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-bold text-gray-900 truncate">
              {session?.user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {session?.user?.email || ''}
            </p>
          </div>
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
