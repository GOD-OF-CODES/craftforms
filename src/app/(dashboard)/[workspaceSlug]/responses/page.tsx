'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Badge from '@/components/ui/badge'
import Card from '@/components/ui/card'

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
  const [forms, setForms] = useState<FormWithResponses[]>([])
  const [loading, setLoading] = useState(true)

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

  const totalResponses = forms.reduce((sum, f) => sum + f.responseCount, 0)
  const totalCompleted = forms.reduce((sum, f) => sum + f.completedCount, 0)

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">All Responses</h1>
        <p className="text-gray-500 mt-1">View and manage responses across all forms</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{totalResponses}</p>
            <p className="text-gray-500">Total Responses</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{totalCompleted}</p>
            <p className="text-gray-500">Completed</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{forms.length}</p>
            <p className="text-gray-500">Forms with Responses</p>
          </div>
        </Card>
      </div>

      {/* Forms List */}
      {forms.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No responses yet</h3>
          <p className="text-gray-500">Create and share forms to start collecting responses.</p>
        </Card>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Form</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completion Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Response</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {forms.map((form) => {
                const completionRate = form.responseCount > 0
                  ? Math.round((form.completedCount / form.responseCount) * 100)
                  : 0
                return (
                  <tr key={form.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{form.title}</p>
                      <p className="text-sm text-gray-500">{form.slug}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900 font-medium">{form.responseCount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={completionRate >= 80 ? 'success' : completionRate >= 50 ? 'warning' : 'default'}>
                        {completionRate}%
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {form.lastResponseAt
                        ? new Date(form.lastResponseAt).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/${workspaceSlug}/forms/${form.id}/responses`}
                        className="text-primary hover:text-primary-hover font-medium text-sm"
                      >
                        View responses
                      </Link>
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
