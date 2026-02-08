/**
 * Analytics calculations for form responses
 */

interface Answer {
  fieldId: string
  fieldType: string
  fieldTitle: string
  value: unknown
}

interface Response {
  id: string
  isCompleted: boolean
  createdAt: Date
  timeTaken: number | null
  answers: Answer[]
}

export interface FormAnalytics {
  totalResponses: number
  completedResponses: number
  incompleteResponses: number
  completionRate: number
  averageCompletionTime: number | null
  responsesOverTime: Array<{ date: string; count: number }>
  fieldAnalytics: Record<string, FieldAnalytics>
}

export interface FieldAnalytics {
  fieldId: string
  fieldTitle: string
  fieldType: string
  totalAnswers: number
  // For multiple choice / checkboxes / dropdown
  optionCounts?: Record<string, number>
  optionPercentages?: Record<string, number>
  // For rating / opinion scale
  averageRating?: number
  ratingDistribution?: Record<number, number>
  // For number fields
  average?: number
  min?: number
  max?: number
  // For text fields
  responseCount?: number
}

/**
 * Calculate analytics for a form's responses
 */
export function calculateFormAnalytics(
  responses: Response[],
  fields: Array<{ id: string; title: string; type: string; properties?: Record<string, unknown> }>
): FormAnalytics {
  const totalResponses = responses.length
  const completedResponses = responses.filter(r => r.isCompleted).length
  const incompleteResponses = totalResponses - completedResponses
  const completionRate = totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0

  // Calculate average completion time
  const completionTimes = responses
    .filter(r => r.timeTaken !== null && r.timeTaken > 0)
    .map(r => r.timeTaken as number)
  const averageCompletionTime = completionTimes.length > 0
    ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length)
    : null

  // Calculate responses over time (last 30 days)
  const responsesOverTime = calculateResponsesOverTime(responses)

  // Calculate per-field analytics
  const fieldAnalytics: Record<string, FieldAnalytics> = {}
  for (const field of fields) {
    const answers = responses
      .flatMap(r => r.answers)
      .filter(a => a.fieldId === field.id)

    fieldAnalytics[field.id] = calculateFieldAnalytics(field, answers)
  }

  return {
    totalResponses,
    completedResponses,
    incompleteResponses,
    completionRate,
    averageCompletionTime,
    responsesOverTime,
    fieldAnalytics
  }
}

/**
 * Calculate responses over time (grouped by day)
 */
function calculateResponsesOverTime(responses: Response[]): Array<{ date: string; count: number }> {
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Initialize counts for each day
  const dayCounts: Record<string, number> = {}
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0] || ''
    if (dateStr) {
      dayCounts[dateStr] = 0
    }
  }

  // Count responses per day
  for (const response of responses) {
    const responseDate = new Date(response.createdAt)
    if (responseDate >= thirtyDaysAgo && responseDate <= now) {
      const dateStr = responseDate.toISOString().split('T')[0] || ''
      if (dateStr && dayCounts[dateStr] !== undefined) {
        dayCounts[dateStr]++
      }
    }
  }

  return Object.entries(dayCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))
}

/**
 * Calculate analytics for a single field
 */
function calculateFieldAnalytics(
  field: { id: string; title: string; type: string; properties?: Record<string, unknown> },
  answers: Answer[]
): FieldAnalytics {
  const base: FieldAnalytics = {
    fieldId: field.id,
    fieldTitle: field.title,
    fieldType: field.type,
    totalAnswers: answers.length
  }

  const values = answers.map(a => extractValue(a.value))

  switch (field.type) {
    case 'multiple_choice':
    case 'dropdown':
      return calculateChoiceAnalytics(base, values)

    case 'checkboxes':
      return calculateCheckboxAnalytics(base, values)

    case 'rating':
    case 'opinion_scale':
      return calculateRatingAnalytics(base, values)

    case 'number':
      return calculateNumberAnalytics(base, values)

    case 'yes_no':
      return calculateYesNoAnalytics(base, values)

    default:
      return {
        ...base,
        responseCount: values.filter(v => v !== null && v !== undefined && v !== '').length
      }
  }
}

/**
 * Extract the actual value from an answer (handles nested value objects)
 */
function extractValue(value: unknown): unknown {
  if (typeof value === 'object' && value !== null && 'value' in value) {
    return (value as Record<string, unknown>).value
  }
  return value
}

/**
 * Calculate analytics for single-choice fields (multiple choice, dropdown)
 */
function calculateChoiceAnalytics(base: FieldAnalytics, values: unknown[]): FieldAnalytics {
  const optionCounts: Record<string, number> = {}
  const validValues = values.filter(v => v !== null && v !== undefined && v !== '')

  for (const value of validValues) {
    const key = String(value)
    optionCounts[key] = (optionCounts[key] || 0) + 1
  }

  const total = validValues.length
  const optionPercentages: Record<string, number> = {}
  for (const [option, count] of Object.entries(optionCounts)) {
    optionPercentages[option] = total > 0 ? Math.round((count / total) * 100) : 0
  }

  return {
    ...base,
    optionCounts,
    optionPercentages
  }
}

/**
 * Calculate analytics for checkbox fields (multi-select)
 */
function calculateCheckboxAnalytics(base: FieldAnalytics, values: unknown[]): FieldAnalytics {
  const optionCounts: Record<string, number> = {}
  let totalSelections = 0

  for (const value of values) {
    if (Array.isArray(value)) {
      for (const item of value) {
        const key = String(item)
        optionCounts[key] = (optionCounts[key] || 0) + 1
        totalSelections++
      }
    }
  }

  const optionPercentages: Record<string, number> = {}
  for (const [option, count] of Object.entries(optionCounts)) {
    optionPercentages[option] = totalSelections > 0 ? Math.round((count / totalSelections) * 100) : 0
  }

  return {
    ...base,
    optionCounts,
    optionPercentages
  }
}

/**
 * Calculate analytics for rating/scale fields
 */
function calculateRatingAnalytics(base: FieldAnalytics, values: unknown[]): FieldAnalytics {
  const numericValues = values
    .map(v => typeof v === 'number' ? v : Number(v))
    .filter(v => !isNaN(v))

  if (numericValues.length === 0) {
    return base
  }

  const sum = numericValues.reduce((a, b) => a + b, 0)
  const averageRating = Math.round((sum / numericValues.length) * 10) / 10

  const ratingDistribution: Record<number, number> = {}
  for (const value of numericValues) {
    ratingDistribution[value] = (ratingDistribution[value] || 0) + 1
  }

  return {
    ...base,
    averageRating,
    ratingDistribution
  }
}

/**
 * Calculate analytics for number fields
 */
function calculateNumberAnalytics(base: FieldAnalytics, values: unknown[]): FieldAnalytics {
  const numericValues = values
    .map(v => typeof v === 'number' ? v : Number(v))
    .filter(v => !isNaN(v))

  if (numericValues.length === 0) {
    return base
  }

  const sum = numericValues.reduce((a, b) => a + b, 0)
  const average = Math.round((sum / numericValues.length) * 100) / 100
  const min = Math.min(...numericValues)
  const max = Math.max(...numericValues)

  return {
    ...base,
    average,
    min,
    max
  }
}

/**
 * Calculate analytics for yes/no fields
 */
function calculateYesNoAnalytics(base: FieldAnalytics, values: unknown[]): FieldAnalytics {
  let yesCount = 0
  let noCount = 0

  for (const value of values) {
    if (value === true || value === 'true' || value === 'yes' || value === 'Yes') {
      yesCount++
    } else if (value === false || value === 'false' || value === 'no' || value === 'No') {
      noCount++
    }
  }

  const total = yesCount + noCount
  const optionCounts: Record<string, number> = {
    'Yes': yesCount,
    'No': noCount
  }
  const optionPercentages: Record<string, number> = {
    'Yes': total > 0 ? Math.round((yesCount / total) * 100) : 0,
    'No': total > 0 ? Math.round((noCount / total) * 100) : 0
  }

  return {
    ...base,
    optionCounts,
    optionPercentages
  }
}

/**
 * Format completion time for display
 */
export function formatCompletionTime(seconds: number | null): string {
  if (seconds === null) return '-'
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins < 60) return `${mins}m ${secs}s`
  const hours = Math.floor(mins / 60)
  const remainingMins = mins % 60
  return `${hours}h ${remainingMins}m`
}
