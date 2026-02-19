'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/card'
import Progress from '@/components/ui/progress'

interface FormAnalytics {
  id: string
  title: string
  slug: string
  responseCount: number
  completedCount: number
  avgTimeTaken: number | null
  viewCount: number
}

export default function WorkspaceAnalyticsPage({
  params
}: {
  params: { workspaceSlug: string }
}) {
  const { workspaceSlug } = params
  const [forms, setForms] = useState<FormAnalytics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/workspaces/by-slug/${workspaceSlug}/forms`)
        if (response.ok) {
          const data = await response.json()
          setForms(data.forms || [])
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [workspaceSlug])

  const totalResponses = forms.reduce((sum, f) => sum + f.responseCount, 0)
  const totalCompleted = forms.reduce((sum, f) => sum + f.completedCount, 0)
  const overallCompletionRate = totalResponses > 0 ? Math.round((totalCompleted / totalResponses) * 100) : 0

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-'
    if (seconds < 60) return `${Math.round(seconds)}s`
    const mins = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return `${mins}m ${secs}s`
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-xl w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-24 bg-gray-200 rounded-xl"></div>
            <div className="h-24 bg-gray-200 rounded-xl"></div>
            <div className="h-24 bg-gray-200 rounded-xl"></div>
            <div className="h-24 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900"><span className="mr-2">📈</span>Analytics</h1>
        <p className="text-gray-500 mt-1">Overview of all form performance</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card variant="dashboard" className="stagger-enter" style={{ animationDelay: '0s' }}>
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Forms</p>
            <p className="text-3xl font-bold stat-indigo">{forms.length}</p>
          </div>
        </Card>
        <Card variant="dashboard" className="stagger-enter" style={{ animationDelay: '0.07s' }}>
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Responses</p>
            <p className="text-3xl font-bold stat-blue">{totalResponses}</p>
          </div>
        </Card>
        <Card variant="dashboard" className="stagger-enter" style={{ animationDelay: '0.14s' }}>
          <div>
            <p className="text-sm text-gray-500 mb-1">Completed</p>
            <p className="text-3xl font-bold stat-emerald">{totalCompleted}</p>
          </div>
        </Card>
        <Card variant="dashboard" className="stagger-enter" style={{ animationDelay: '0.21s' }}>
          <div>
            <p className="text-sm text-gray-500 mb-1">Completion Rate</p>
            <p className="text-3xl font-bold stat-indigo">{overallCompletionRate}%</p>
          </div>
        </Card>
      </div>

      {/* Forms Performance */}
      {forms.length === 0 ? (
        <Card variant="dashboard" className="text-center py-12">
          <div className="text-5xl mb-4">📉</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No analytics data</h3>
          <p className="text-gray-500">Create forms and collect responses to see analytics.</p>
        </Card>
      ) : (
        <Card variant="dashboard">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Form Performance</h2>
          <div className="space-y-6">
            {forms.map((form) => {
              const completionRate = form.responseCount > 0
                ? Math.round((form.completedCount / form.responseCount) * 100)
                : 0
              return (
                <div key={form.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <Link
                      href={`/${workspaceSlug}/forms/${form.id}/responses`}
                      className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                    >
                      {form.title}
                    </Link>
                    <span className="text-sm text-gray-500">
                      {form.responseCount} responses
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Progress value={completionRate} showLabel />
                    </div>
                    <div className="text-sm text-gray-500 w-24 text-right">
                      Avg: {formatDuration(form.avgTimeTaken)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
