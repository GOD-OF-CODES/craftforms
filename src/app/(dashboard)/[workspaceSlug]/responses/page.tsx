'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Badge from '@/components/ui/badge'
import Card from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'

interface FormWithResponses {
  id: string
  title: string
  slug: string
  responseCount: number
  completedCount: number
  lastResponseAt: string | null
}

export default function WorkspaceResponsesPage({
  params
}: {
  params: { workspaceSlug: string }
}) {
  const { workspaceSlug } = params
  const { addToast } = useToast()
  const [forms, setForms] = useState<FormWithResponses[]>([])
  const [loading, setLoading] = useState(true)
  const [exportingFormId, setExportingFormId] = useState<string | null>(null)

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await fetch(`/api/workspaces/by-slug/${workspaceSlug}/forms`)
        if (response.ok) {
          const data = await response.json()
          setForms(data.forms || [])
        }
      } catch (error) {
        console.error('Failed to fetch forms:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchForms()
  }, [workspaceSlug])

  const handleExportCSV = async (formId: string, formTitle: string) => {
    setExportingFormId(formId)
    try {
      const response = await fetch(`/api/forms/${formId}/responses/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'csv' })
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${formTitle || 'responses'}-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      addToast({
        title: 'Export successful',
        description: `Responses for "${formTitle}" exported as CSV.`,
        variant: 'success'
      })
    } catch (error) {
      console.error('Export error:', error)
      addToast({
        title: 'Error',
        description: 'Failed to export responses.',
        variant: 'error'
      })
    } finally {
      setExportingFormId(null)
    }
  }

  const totalResponses = forms.reduce((sum, f) => sum + f.responseCount, 0)
  const totalCompleted = forms.reduce((sum, f) => sum + f.completedCount, 0)

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-xl w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900"><span className="mr-2">📊</span>All Responses</h1>
        <p className="text-gray-500 mt-1">View and manage responses across all forms</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card variant="dashboard" className="stagger-enter" style={{ animationDelay: '0s' }}>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Total Responses</p>
            <p className="text-3xl font-bold stat-indigo">{totalResponses}</p>
          </div>
        </Card>
        <Card variant="dashboard" className="stagger-enter" style={{ animationDelay: '0.1s' }}>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Completed</p>
            <p className="text-3xl font-bold stat-emerald">{totalCompleted}</p>
          </div>
        </Card>
        <Card variant="dashboard" className="stagger-enter" style={{ animationDelay: '0.2s' }}>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Forms with Responses</p>
            <p className="text-3xl font-bold stat-blue">{forms.length}</p>
          </div>
        </Card>
      </div>

      {/* Forms List */}
      {forms.length === 0 ? (
        <Card variant="dashboard" className="text-center py-12">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No responses yet</h3>
          <p className="text-gray-500">Create and share forms to start collecting responses.</p>
        </Card>
      ) : (
        <div className="dashboard-table">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Form</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Responses</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Completion Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Last Response</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {forms.map((form) => {
                const completionRate = form.responseCount > 0
                  ? Math.round((form.completedCount / form.responseCount) * 100)
                  : 0
                return (
                  <tr key={form.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{form.title}</p>
                      <p className="text-sm text-gray-400">{form.slug}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900 font-medium">{form.responseCount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={completionRate >= 80 ? 'dashboard-success' : completionRate >= 50 ? 'dashboard-warning' : 'dashboard-default'}>
                        {completionRate}%
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {form.lastResponseAt
                        ? new Date(form.lastResponseAt).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {form.responseCount > 0 && (
                          <button
                            onClick={() => handleExportCSV(form.id, form.title)}
                            disabled={exportingFormId === form.id}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 disabled:opacity-50 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {exportingFormId === form.id ? 'Exporting...' : 'Export CSV'}
                          </button>
                        )}
                        <Link
                          href={`/${workspaceSlug}/forms/${form.id}/responses`}
                          className="text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors"
                        >
                          View responses
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
