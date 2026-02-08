/**
 * Logic Engine for Form Conditional Branching
 *
 * Handles logic jumps that allow dynamic form navigation based on user responses.
 */

// Condition types supported by the logic engine
export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'is_selected'
  | 'is_not_selected'
  | 'is_empty'
  | 'is_not_empty'
  | 'starts_with'
  | 'ends_with'

// Action types for logic jumps
export type LogicAction =
  | { type: 'jump_to'; targetFieldId: string }
  | { type: 'skip_to_end' }
  | { type: 'show_field'; targetFieldId: string }
  | { type: 'hide_field'; targetFieldId: string }

// Single condition in a logic rule
export interface LogicCondition {
  fieldId: string
  operator: ConditionOperator
  value?: string | number | boolean | string[]
}

// Group of conditions with AND/OR logic
export interface LogicConditionGroup {
  conditions: LogicCondition[]
  logicalOperator: 'AND' | 'OR'
}

// Complete logic rule with conditions and actions
export interface LogicRule {
  id: string
  name?: string
  conditionGroups: LogicConditionGroup[]
  groupOperator: 'AND' | 'OR' // How to combine condition groups
  actions: LogicAction[]
  enabled: boolean
}

// Field with its logic rules
export interface FieldLogic {
  fieldId: string
  rules: LogicRule[]
}

// Answers object type
export type FormAnswers = Record<string, any>

/**
 * Evaluates a single condition against the current answers
 */
export function evaluateCondition(
  condition: LogicCondition,
  answers: FormAnswers
): boolean {
  const { fieldId, operator, value } = condition
  const answer = answers[fieldId]

  switch (operator) {
    case 'equals':
      return answer === value

    case 'not_equals':
      return answer !== value

    case 'contains':
      if (typeof answer === 'string') {
        return answer.toLowerCase().includes(String(value).toLowerCase())
      }
      if (Array.isArray(answer)) {
        return answer.includes(value)
      }
      return false

    case 'not_contains':
      if (typeof answer === 'string') {
        return !answer.toLowerCase().includes(String(value).toLowerCase())
      }
      if (Array.isArray(answer)) {
        return !answer.includes(value)
      }
      return true

    case 'greater_than':
      return typeof answer === 'number' && typeof value === 'number' && answer > value

    case 'less_than':
      return typeof answer === 'number' && typeof value === 'number' && answer < value

    case 'greater_than_or_equal':
      return typeof answer === 'number' && typeof value === 'number' && answer >= value

    case 'less_than_or_equal':
      return typeof answer === 'number' && typeof value === 'number' && answer <= value

    case 'is_selected':
      // For multiple choice / checkboxes
      if (Array.isArray(answer)) {
        return answer.includes(value)
      }
      return answer === value

    case 'is_not_selected':
      if (Array.isArray(answer)) {
        return !answer.includes(value)
      }
      return answer !== value

    case 'is_empty':
      return answer === null || answer === undefined || answer === '' ||
             (Array.isArray(answer) && answer.length === 0)

    case 'is_not_empty':
      return answer !== null && answer !== undefined && answer !== '' &&
             !(Array.isArray(answer) && answer.length === 0)

    case 'starts_with':
      return typeof answer === 'string' && answer.toLowerCase().startsWith(String(value).toLowerCase())

    case 'ends_with':
      return typeof answer === 'string' && answer.toLowerCase().endsWith(String(value).toLowerCase())

    default:
      return false
  }
}

/**
 * Evaluates a condition group (multiple conditions with AND/OR)
 */
export function evaluateConditionGroup(
  group: LogicConditionGroup,
  answers: FormAnswers
): boolean {
  const { conditions, logicalOperator } = group

  if (conditions.length === 0) return true

  if (logicalOperator === 'AND') {
    return conditions.every(condition => evaluateCondition(condition, answers))
  } else {
    return conditions.some(condition => evaluateCondition(condition, answers))
  }
}

/**
 * Evaluates a complete logic rule
 */
export function evaluateLogicRule(
  rule: LogicRule,
  answers: FormAnswers
): boolean {
  if (!rule.enabled) return false

  const { conditionGroups, groupOperator } = rule

  if (conditionGroups.length === 0) return true

  if (groupOperator === 'AND') {
    return conditionGroups.every(group => evaluateConditionGroup(group, answers))
  } else {
    return conditionGroups.some(group => evaluateConditionGroup(group, answers))
  }
}

/**
 * Gets the actions to execute based on current answers
 */
export function getActiveActions(
  fieldLogic: FieldLogic,
  answers: FormAnswers
): LogicAction[] {
  const activeActions: LogicAction[] = []

  for (const rule of fieldLogic.rules) {
    if (evaluateLogicRule(rule, answers)) {
      activeActions.push(...rule.actions)
    }
  }

  return activeActions
}

/**
 * Determines the next field to show based on logic rules
 */
export function getNextFieldId(
  currentFieldId: string,
  fields: Array<{ id: string; logic?: FieldLogic }>,
  answers: FormAnswers,
  defaultNextFieldId?: string
): string | 'end' | null {
  const currentField = fields.find(f => f.id === currentFieldId)

  if (!currentField?.logic) {
    return defaultNextFieldId || null
  }

  const actions = getActiveActions(currentField.logic, answers)

  for (const action of actions) {
    if (action.type === 'jump_to') {
      return action.targetFieldId
    }
    if (action.type === 'skip_to_end') {
      return 'end'
    }
  }

  return defaultNextFieldId || null
}

/**
 * Gets visible fields based on show/hide logic
 */
export function getVisibleFields(
  fields: Array<{ id: string; logic?: FieldLogic }>,
  answers: FormAnswers
): string[] {
  const hiddenFieldIds = new Set<string>()

  for (const field of fields) {
    if (!field.logic) continue

    const actions = getActiveActions(field.logic, answers)

    for (const action of actions) {
      if (action.type === 'hide_field') {
        hiddenFieldIds.add(action.targetFieldId)
      }
    }
  }

  return fields.filter(f => !hiddenFieldIds.has(f.id)).map(f => f.id)
}

/**
 * Validates logic rules to prevent infinite loops
 */
export function validateLogicRules(
  fields: Array<{ id: string; logic?: FieldLogic }>
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const fieldIds = new Set(fields.map(f => f.id))

  for (const field of fields) {
    if (!field.logic) continue

    for (const rule of field.logic.rules) {
      for (const action of rule.actions) {
        if (action.type === 'jump_to') {
          // Check if target field exists
          if (!fieldIds.has(action.targetFieldId)) {
            errors.push(`Field "${field.id}" has a jump to non-existent field "${action.targetFieldId}"`)
          }

          // Check for self-referencing jump (potential infinite loop)
          if (action.targetFieldId === field.id) {
            errors.push(`Field "${field.id}" has a logic rule that jumps to itself (infinite loop)`)
          }
        }
      }

      // Check if conditions reference valid fields
      for (const group of rule.conditionGroups) {
        for (const condition of group.conditions) {
          if (!fieldIds.has(condition.fieldId)) {
            errors.push(`Field "${field.id}" has a condition referencing non-existent field "${condition.fieldId}"`)
          }
        }
      }
    }
  }

  // Check for circular jump patterns
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  function detectCycle(fieldId: string): boolean {
    if (recursionStack.has(fieldId)) {
      return true
    }
    if (visited.has(fieldId)) {
      return false
    }

    visited.add(fieldId)
    recursionStack.add(fieldId)

    const field = fields.find(f => f.id === fieldId)
    if (field?.logic) {
      for (const rule of field.logic.rules) {
        for (const action of rule.actions) {
          if (action.type === 'jump_to') {
            if (detectCycle(action.targetFieldId)) {
              errors.push(`Circular logic jump detected involving field "${fieldId}"`)
              return true
            }
          }
        }
      }
    }

    recursionStack.delete(fieldId)
    return false
  }

  for (const field of fields) {
    detectCycle(field.id)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Calculates the form path with logic jumps applied
 */
export function calculateFormPath(
  fields: Array<{ id: string; logic?: FieldLogic }>,
  answers: FormAnswers
): string[] {
  const path: string[] = []
  const maxIterations = fields.length * 2 // Safety limit
  let iterations = 0

  let currentIndex = 0

  while (currentIndex < fields.length && iterations < maxIterations) {
    iterations++
    const currentField = fields[currentIndex]
    if (!currentField) break

    path.push(currentField.id)

    // Check for logic jumps
    const nextFieldId = getNextFieldId(
      currentField.id,
      fields,
      answers,
      fields[currentIndex + 1]?.id ?? undefined
    )

    if (nextFieldId === 'end') {
      break
    }

    if (nextFieldId) {
      const nextIndex = fields.findIndex(f => f.id === nextFieldId)
      if (nextIndex !== -1) {
        currentIndex = nextIndex
        continue
      }
    }

    currentIndex++
  }

  return path
}

/**
 * Gets the previous field considering logic jumps (for back navigation)
 */
export function getPreviousFieldInPath(
  currentFieldId: string,
  navigationHistory: string[]
): string | null {
  const currentIndex = navigationHistory.lastIndexOf(currentFieldId)

  if (currentIndex > 0) {
    const previousField = navigationHistory[currentIndex - 1]
    return previousField ?? null
  }

  return null
}

/**
 * Creates an empty logic rule
 */
export function createEmptyRule(): LogicRule {
  return {
    id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: 'New Rule',
    conditionGroups: [
      {
        conditions: [],
        logicalOperator: 'AND'
      }
    ],
    groupOperator: 'AND',
    actions: [],
    enabled: true
  }
}

/**
 * Creates an empty condition
 */
export function createEmptyCondition(fieldId: string): LogicCondition {
  return {
    fieldId,
    operator: 'equals',
    value: ''
  }
}

/**
 * Human-readable description of a condition
 */
export function describeCondition(
  condition: LogicCondition,
  fieldName: string
): string {
  const { operator, value } = condition

  const operatorLabels: Record<ConditionOperator, string> = {
    equals: 'equals',
    not_equals: 'does not equal',
    contains: 'contains',
    not_contains: 'does not contain',
    greater_than: 'is greater than',
    less_than: 'is less than',
    greater_than_or_equal: 'is at least',
    less_than_or_equal: 'is at most',
    is_selected: 'includes',
    is_not_selected: 'does not include',
    is_empty: 'is empty',
    is_not_empty: 'is not empty',
    starts_with: 'starts with',
    ends_with: 'ends with'
  }

  const operatorLabel = operatorLabels[operator] || operator

  if (operator === 'is_empty' || operator === 'is_not_empty') {
    return `"${fieldName}" ${operatorLabel}`
  }

  return `"${fieldName}" ${operatorLabel} "${value}"`
}

/**
 * Human-readable description of an action
 */
export function describeAction(
  action: LogicAction,
  fieldNames: Record<string, string>
): string {
  switch (action.type) {
    case 'jump_to':
      return `Jump to "${fieldNames[action.targetFieldId] || action.targetFieldId}"`
    case 'skip_to_end':
      return 'Skip to end of form'
    case 'show_field':
      return `Show "${fieldNames[action.targetFieldId] || action.targetFieldId}"`
    case 'hide_field':
      return `Hide "${fieldNames[action.targetFieldId] || action.targetFieldId}"`
    default:
      return 'Unknown action'
  }
}
