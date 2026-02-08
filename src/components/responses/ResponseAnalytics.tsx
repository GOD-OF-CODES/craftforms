'use client'

import { useState, useEffect } from 'react'
import Badge from '@/components/ui/badge'
import { FormAnalytics, FieldAnalytics, formatCompletionTime } from '@/lib/analytics'

interface ResponseAnalyticsProps {
  formId: string
}

export default function ResponseAnalytics({ formId }: ResponseAnalyticsProps) {
  const [analytics, setAnalytics] = useState<FormAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/forms/${formId}/analytics`)
        if (response.ok) {
          const data = await response.json()
          setAnalytics(data)
        } else {
          setError('Failed to load analytics')
        }
      } catch (err) {
        console.error('Analytics fetch error:', err)
        setError('Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [formId])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">{error || 'No analytics available'}</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Responses"
          value={analytics.totalResponses.toString()}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <SummaryCard
          title="Completion Rate"
          value={`${Math.round(analytics.completionRate)}%`}
          subtitle={`${analytics.completedResponses} completed`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
        />
        <SummaryCard
          title="Average Time"
          value={formatCompletionTime(analytics.averageCompletionTime)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="blue"
        />
        <SummaryCard
          title="Incomplete"
          value={analytics.incompleteResponses.toString()}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="yellow"
        />
      </div>

      {/* Responses Over Time Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Responses Over Time</h3>
        <div className="h-64">
          <SimpleLineChart data={analytics.responsesOverTime} />
        </div>
      </div>

      {/* Per-Question Analytics */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Question Analytics</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {Object.values(analytics.fieldAnalytics).map((field) => (
            <FieldAnalyticsCard key={field.fieldId} field={field} />
          ))}
        </div>
        {Object.keys(analytics.fieldAnalytics).length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No questions to analyze
          </div>
        )}
      </div>
    </div>
  )
}

interface SummaryCardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  color?: 'gray' | 'green' | 'blue' | 'yellow'
}

function SummaryCard({ title, value, subtitle, icon, color = 'gray' }: SummaryCardProps) {
  const colors = {
    gray: 'bg-gray-100 text-gray-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600'
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

interface FieldAnalyticsCardProps {
  field: FieldAnalytics
}

function FieldAnalyticsCard({ field }: FieldAnalyticsCardProps) {
  const hasChoiceData = field.optionCounts && Object.keys(field.optionCounts).length > 0
  const hasRatingData = field.averageRating !== undefined
  const hasNumberData = field.average !== undefined

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{field.fieldTitle || 'Untitled Question'}</h4>
          <Badge variant="default" className="mt-1">{field.fieldType.replace('_', ' ')}</Badge>
        </div>
        <p className="text-sm text-gray-500">{field.totalAnswers} responses</p>
      </div>

      {/* Choice distribution (pie chart style) */}
      {hasChoiceData && field.optionPercentages && (
        <div className="space-y-2">
          {Object.entries(field.optionCounts || {}).map(([option, count]) => {
            const percentage = field.optionPercentages?.[option] || 0
            return (
              <div key={option} className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700">{option}</span>
                    <span className="text-gray-500">{count} ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Rating average */}
      {hasRatingData && (
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold text-primary">{field.averageRating}</div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">Average rating</p>
            {field.ratingDistribution && (
              <div className="flex gap-1 mt-2">
                {Object.entries(field.ratingDistribution)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([rating, count]) => (
                    <div
                      key={rating}
                      className="flex-1 bg-gray-100 rounded text-center py-1"
                      title={`Rating ${rating}: ${count} responses`}
                    >
                      <span className="text-xs text-gray-600">{rating}</span>
                      <span className="block text-xs text-gray-400">{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Number statistics */}
      {hasNumberData && (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Average</p>
            <p className="text-xl font-bold text-gray-900">{field.average}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Min</p>
            <p className="text-xl font-bold text-gray-900">{field.min}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Max</p>
            <p className="text-xl font-bold text-gray-900">{field.max}</p>
          </div>
        </div>
      )}

      {/* Text response count */}
      {!hasChoiceData && !hasRatingData && !hasNumberData && field.responseCount !== undefined && (
        <p className="text-sm text-gray-500">
          {field.responseCount} text responses
        </p>
      )}
    </div>
  )
}

interface SimpleLineChartProps {
  data: Array<{ date: string; count: number }>
}

function SimpleLineChart({ data }: SimpleLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        No data available
      </div>
    )
  }

  const maxCount = Math.max(...data.map(d => d.count), 1)
  const chartHeight = 200

  const firstDate = data[0]?.date
  const lastDate = data[data.length - 1]?.date

  return (
    <div className="h-full flex flex-col">
      {/* Chart */}
      <div className="flex-1 flex items-end gap-1 px-2">
        {data.map((point) => {
          const height = (point.count / maxCount) * chartHeight
          return (
            <div
              key={point.date}
              className="flex-1 flex flex-col items-center justify-end group"
            >
              <div
                className="w-full bg-primary/20 hover:bg-primary/40 rounded-t transition-all cursor-pointer relative"
                style={{ height: `${Math.max(height, 4)}px` }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: {point.count}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* X-axis labels */}
      {firstDate && lastDate && (
        <div className="flex justify-between px-2 mt-2 text-xs text-gray-500">
          <span>{new Date(firstDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          <span>{new Date(lastDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
      )}
    </div>
  )
}
