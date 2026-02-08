'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import Checkbox from '@/components/ui/checkbox'
import Input from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'

interface Answer {
  id: string
  value: Record<string, unknown>
  field: {
    id: string
    title: string
    type: string
  }
}

interface Response {
  id: string
  respondentId: string
  isCompleted: boolean
  startedAt: string
  completedAt: string | null
  timeTaken: number | null
  createdAt: string
  answers: Answer[]
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

type SortField = 'createdAt' | 'timeTaken' | 'isCompleted'
type SortOrder = 'asc' | 'desc'

export default function ResponsesPage({
  params
}: {
  params: { workspaceSlug: string; formId: string }
}) {
  const { addToast } = useToast()
  const [responses, setResponses] = useState<Response[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const fetchResponses = useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder
      })
      if (statusFilter) {
        queryParams.set('status', statusFilter)
      }
      if (startDate) {
        queryParams.set('startDate', startDate)
      }
      if (endDate) {
        queryParams.set('endDate', endDate)
      }

      const response = await fetch(
        `/api/forms/${params.formId}/responses?${queryParams}`
      )
      if (response.ok) {
        const data = await response.json()
        setResponses(data.responses)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch responses:', error)
    } finally {
      setLoading(false)
    }
  }, [params.formId, pagination.page, pagination.limit, statusFilter, startDate, endDate, sortBy, sortOrder])

  useEffect(() => {
    fetchResponses()
  }, [fetchResponses])

  const handleSelectAll = () => {
    if (selectedIds.size === responses.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(responses.map(r => r.id)))
    }
  }

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} responses?`)) return

    try {
      const response = await fetch(`/api/forms/${params.formId}/responses`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responseIds: Array.from(selectedIds) })
      })

      if (response.ok) {
        addToast({
          title: 'Responses deleted',
          description: `${selectedIds.size} responses have been deleted.`,
          variant: 'success'
        })
        setSelectedIds(new Set())
        fetchResponses()
      }
    } catch (error) {
      console.error('Delete error:', error)
      addToast({
        title: 'Error',
        description: 'Failed to delete responses.',
        variant: 'error'
      })
    }
  }

  const handleExport = async (format: 'csv' | 'json') => {
    setExporting(true)
    try {
      const response = await fetch(`/api/forms/${params.formId}/responses/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          responseIds: selectedIds.size > 0 ? Array.from(selectedIds) : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          status: statusFilter || undefined
        })
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      if (format === 'csv') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `responses-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `responses-export-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }

      addToast({
        title: 'Export successful',
        description: `${selectedIds.size > 0 ? selectedIds.size : pagination.total} responses exported.`,
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
      setExporting(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-'
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getAnswerPreview = (answers: Answer[]): string => {
    const firstAnswer = answers[0]
    if (!firstAnswer) return 'No answers'
    const value = firstAnswer.value
    if (typeof value === 'object' && value !== null && 'value' in value) {
      return String(value.value).substring(0, 50)
    }
    return String(value).substring(0, 50)
  }

  // Filter responses by search query (client-side for answer content)
  const filteredResponses = searchQuery
    ? responses.filter(r => {
        const searchLower = searchQuery.toLowerCase()
        return r.answers.some(a => {
          const value = a.value
          if (typeof value === 'object' && value !== null && 'value' in value) {
            return String(value.value).toLowerCase().includes(searchLower)
          }
          return String(value).toLowerCase().includes(searchLower)
        }) || r.id.toLowerCase().includes(searchLower)
      })
    : responses

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="ml-1 inline-flex">
      {sortBy === field ? (
        sortOrder === 'asc' ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )
      ) : (
        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )}
    </span>
  )

  if (loading && responses.length === 0) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Responses</h1>
          <p className="text-gray-500">{pagination.total} total responses</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <Input
              type="text"
              placeholder="Search responses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All</option>
              <option value="completed">Completed</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Clear Filters */}
          {(statusFilter || startDate || endDate || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter('')
                setStartDate('')
                setEndDate('')
                setSearchQuery('')
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center justify-between">
          <p className="text-sm text-blue-700">
            {selectedIds.size} response{selectedIds.size > 1 ? 's' : ''} selected
          </p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => handleExport('csv')}>
              Export Selected
            </Button>
            <Button variant="danger" size="sm" onClick={handleBulkDelete}>
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredResponses.length === 0 && !loading && (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || statusFilter || startDate || endDate ? 'No matching responses' : 'No responses yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || statusFilter || startDate || endDate
              ? 'Try adjusting your filters.'
              : 'Share your form to start collecting responses.'}
          </p>
        </div>
      )}

      {/* Responses Table */}
      {filteredResponses.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <Checkbox
                    checked={selectedIds.size === filteredResponses.length && filteredResponses.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort('createdAt')}
                >
                  Submitted
                  <SortIcon field="createdAt" />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort('isCompleted')}
                >
                  Status
                  <SortIcon field="isCompleted" />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort('timeTaken')}
                >
                  Duration
                  <SortIcon field="timeTaken" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Preview
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredResponses.map((response) => (
                <tr key={response.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <Checkbox
                      checked={selectedIds.has(response.id)}
                      onChange={() => handleSelect(response.id)}
                    />
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {formatDate(response.createdAt)}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={response.isCompleted ? 'success' : 'warning'}>
                      {response.isCompleted ? 'Completed' : 'Incomplete'}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {formatDuration(response.timeTaken)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {getAnswerPreview(response.answers)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/${params.workspaceSlug}/forms/${params.formId}/responses/${response.id}`}
                    >
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} responses
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
