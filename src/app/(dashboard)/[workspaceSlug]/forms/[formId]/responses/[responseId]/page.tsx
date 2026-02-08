'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'

interface Answer {
  id: string
  value: Record<string, unknown>
  field: {
    id: string
    title: string
    type: string
    orderIndex: number
  }
}

interface ResponseData {
  id: string
  respondentId: string
  isCompleted: boolean
  startedAt: string
  completedAt: string | null
  timeTaken: number | null
  createdAt: string
  metadata?: {
    ip?: string
    userAgent?: string
  }
  answers: Answer[]
}

interface FormData {
  id: string
  title: string
  fields: Array<{
    id: string
    title: string
    type: string
    orderIndex: number
  }>
}

interface Navigation {
  prevId: string | null
  nextId: string | null
}

export default function ResponseDetailPage({
  params
}: {
  params: { workspaceSlug: string; formId: string; responseId: string }
}) {
  const { addToast } = useToast()
  const [response, setResponse] = useState<ResponseData | null>(null)
  const [form, setForm] = useState<FormData | null>(null)
  const [navigation, setNavigation] = useState<Navigation>({ prevId: null, nextId: null })
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchResponse = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/forms/${params.formId}/responses/${params.responseId}`)
        if (res.ok) {
          const data = await res.json()
          setResponse(data.response)
          setForm(data.form)
          setNavigation(data.navigation)
        }
      } catch (error) {
        console.error('Failed to fetch response:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchResponse()
  }, [params.formId, params.responseId])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this response?')) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/forms/${params.formId}/responses/${params.responseId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        addToast({
          title: 'Response deleted',
          description: 'The response has been deleted.',
          variant: 'success'
        })
        // Navigate to next response or back to list
        if (navigation.nextId) {
          window.location.href = `/${params.workspaceSlug}/forms/${params.formId}/responses/${navigation.nextId}`
        } else if (navigation.prevId) {
          window.location.href = `/${params.workspaceSlug}/forms/${params.formId}/responses/${navigation.prevId}`
        } else {
          window.location.href = `/${params.workspaceSlug}/forms/${params.formId}/responses`
        }
      }
    } catch (error) {
      console.error('Delete error:', error)
      addToast({
        title: 'Error',
        description: 'Failed to delete response.',
        variant: 'error'
      })
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-'
    if (seconds < 60) return `${seconds} seconds`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins} min ${secs} sec`
  }

  const formatAnswerValue = (answer: Answer): string => {
    const value = answer.value

    if (value === null || value === undefined) {
      return '-'
    }

    // Handle object with 'value' property
    if (typeof value === 'object' && 'value' in value) {
      const innerValue = value.value
      if (Array.isArray(innerValue)) {
        return innerValue.join(', ')
      }
      return String(innerValue)
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.join(', ')
    }

    // Handle booleans
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }

    return String(value)
  }

  const getFieldIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      short_text: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      ),
      long_text: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      email: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      number: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      ),
      multiple_choice: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      checkboxes: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      rating: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      yes_no: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      ),
      date: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
    return icons[type] || (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!response || !form) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Response not found</h2>
        <p className="text-gray-500 mt-2">This response may have been deleted.</p>
        <Link href={`/${params.workspaceSlug}/forms/${params.formId}/responses`}>
          <Button variant="secondary" className="mt-4">
            Back to Responses
          </Button>
        </Link>
      </div>
    )
  }

  // Sort answers by field order
  const sortedAnswers = [...response.answers].sort(
    (a, b) => a.field.orderIndex - b.field.orderIndex
  )

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/${params.workspaceSlug}/forms/${params.formId}/responses`}>
            <Button variant="ghost" size="sm">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
            <p className="text-gray-500">Response #{response.id.slice(-8)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation */}
          {navigation.prevId && (
            <Link href={`/${params.workspaceSlug}/forms/${params.formId}/responses/${navigation.prevId}`}>
              <Button variant="ghost" size="sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
            </Link>
          )}
          {navigation.nextId && (
            <Link href={`/${params.workspaceSlug}/forms/${params.formId}/responses/${navigation.nextId}`}>
              <Button variant="ghost" size="sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
          )}
          <Button variant="danger" size="sm" onClick={handleDelete} isLoading={deleting}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Submission Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <Badge variant={response.isCompleted ? 'success' : 'warning'} className="mt-1">
              {response.isCompleted ? 'Completed' : 'Incomplete'}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500">Submitted</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(response.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Time Taken</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{formatDuration(response.timeTaken)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Respondent ID</p>
            <p className="text-sm font-medium text-gray-900 mt-1 font-mono">{response.respondentId.slice(0, 12)}...</p>
          </div>
        </div>
        {response.metadata && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              {response.metadata.ip && (
                <div>
                  <p className="text-sm text-gray-500">IP Address</p>
                  <p className="text-sm font-medium text-gray-900 mt-1 font-mono">{response.metadata.ip}</p>
                </div>
              )}
              {response.metadata.userAgent && (
                <div>
                  <p className="text-sm text-gray-500">User Agent</p>
                  <p className="text-sm font-medium text-gray-900 mt-1 truncate" title={response.metadata.userAgent}>
                    {response.metadata.userAgent.slice(0, 60)}...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Answers */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Answers</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {sortedAnswers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No answers recorded
            </div>
          ) : (
            sortedAnswers.map((answer, index) => (
              <div key={answer.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                    {getFieldIcon(answer.field.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-500">{index + 1}.</span>
                      <h3 className="text-sm font-medium text-gray-900">
                        {answer.field.title || 'Untitled Question'}
                      </h3>
                      <span className="text-xs text-gray-400 uppercase">
                        {answer.field.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-base text-gray-900 whitespace-pre-wrap">
                      {formatAnswerValue(answer) || <span className="text-gray-400 italic">No answer</span>}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
