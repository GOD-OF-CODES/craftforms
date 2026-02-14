'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    const redirect = async () => {
      try {
        const response = await fetch('/api/workspaces')
        if (response.ok) {
          const data = await response.json()
          if (data.workspaces && data.workspaces.length > 0) {
            router.replace(`/${data.workspaces[0].slug}`)
            return
          }
        }
        // If no workspaces or error, create one
        const createResponse = await fetch('/api/workspaces', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'My Workspace' })
        })
        if (createResponse.ok) {
          const newWs = await createResponse.json()
          router.replace(`/${newWs.workspace.slug}`)
        } else {
          // Fallback to login if all else fails
          router.replace('/login')
        }
      } catch {
        router.replace('/login')
      }
    }

    redirect()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-gray-600">Loading your workspace...</p>
      </div>
    </div>
  )
}
