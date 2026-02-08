'use client'

import { useState, ChangeEvent } from 'react'
import Button from '@/components/ui/button'
import Select from '@/components/ui/select'
import Input from '@/components/ui/input'
import Badge from '@/components/ui/badge'
import {
  LogicRule,
  LogicCondition,
  LogicAction,
  ConditionOperator,
  createEmptyRule,
  createEmptyCondition,
  describeCondition,
  describeAction
} from '@/lib/logicEngine'

interface FormField {
  id: string
  title: string
  type: string
  properties?: {
    options?: Array<{ id: string; label: string; value: string }>
  }
}

interface LogicBuilderProps {
  fieldId: string
  fieldTitle: string
  allFields: FormField[]
  rules: LogicRule[]
  onRulesChange: (rules: LogicRule[]) => void
}

const OPERATOR_OPTIONS: { value: ConditionOperator; label: string; applicableTypes: string[] }[] = [
  { value: 'equals', label: 'equals', applicableTypes: ['all'] },
  { value: 'not_equals', label: 'does not equal', applicableTypes: ['all'] },
  { value: 'contains', label: 'contains', applicableTypes: ['short_text', 'long_text', 'email', 'url', 'checkboxes'] },
  { value: 'not_contains', label: 'does not contain', applicableTypes: ['short_text', 'long_text', 'email', 'url', 'checkboxes'] },
  { value: 'greater_than', label: 'is greater than', applicableTypes: ['number', 'rating', 'opinion_scale'] },
  { value: 'less_than', label: 'is less than', applicableTypes: ['number', 'rating', 'opinion_scale'] },
  { value: 'is_selected', label: 'includes', applicableTypes: ['multiple_choice', 'checkboxes', 'dropdown'] },
  { value: 'is_not_selected', label: 'does not include', applicableTypes: ['multiple_choice', 'checkboxes', 'dropdown'] },
  { value: 'is_empty', label: 'is empty', applicableTypes: ['all'] },
  { value: 'is_not_empty', label: 'is not empty', applicableTypes: ['all'] },
  { value: 'starts_with', label: 'starts with', applicableTypes: ['short_text', 'long_text', 'email', 'url'] },
  { value: 'ends_with', label: 'ends with', applicableTypes: ['short_text', 'long_text', 'email', 'url'] },
]

function getOperatorsForFieldType(fieldType: string): { value: string; label: string }[] {
  return OPERATOR_OPTIONS
    .filter(op => op.applicableTypes.includes('all') || op.applicableTypes.includes(fieldType))
    .map(op => ({ value: op.value, label: op.label }))
}

export default function LogicBuilder({
  fieldId,
  fieldTitle,
  allFields,
  rules,
  onRulesChange
}: LogicBuilderProps) {
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null)

  // Get fields that come before this field (for conditions)
  const previousFields = allFields.filter(f => {
    const currentIndex = allFields.findIndex(af => af.id === fieldId)
    const fieldIndex = allFields.findIndex(af => af.id === f.id)
    return fieldIndex < currentIndex
  })

  // Get fields that come after this field (for jump targets)
  const nextFields = allFields.filter(f => {
    const currentIndex = allFields.findIndex(af => af.id === fieldId)
    const fieldIndex = allFields.findIndex(af => af.id === f.id)
    return fieldIndex > currentIndex
  })

  const addRule = () => {
    const newRule = createEmptyRule()
    onRulesChange([...rules, newRule])
    setExpandedRuleId(newRule.id)
  }

  const updateRule = (ruleId: string, updates: Partial<LogicRule>) => {
    onRulesChange(
      rules.map(rule =>
        rule.id === ruleId ? { ...rule, ...updates } : rule
      )
    )
  }

  const deleteRule = (ruleId: string) => {
    onRulesChange(rules.filter(rule => rule.id !== ruleId))
    if (expandedRuleId === ruleId) {
      setExpandedRuleId(null)
    }
  }

  const addCondition = (ruleId: string, groupIndex: number) => {
    const rule = rules.find(r => r.id === ruleId)
    const group = rule?.conditionGroups[groupIndex]
    if (!rule || !group) return

    const newCondition = createEmptyCondition(previousFields[0]?.id || '')
    const updatedGroups = [...rule.conditionGroups]
    updatedGroups[groupIndex] = {
      conditions: [...group.conditions, newCondition],
      logicalOperator: group.logicalOperator
    }

    updateRule(ruleId, { conditionGroups: updatedGroups })
  }

  const updateCondition = (
    ruleId: string,
    groupIndex: number,
    conditionIndex: number,
    updates: Partial<LogicCondition>
  ) => {
    const rule = rules.find(r => r.id === ruleId)
    const group = rule?.conditionGroups[groupIndex]
    if (!rule || !group) return

    const updatedGroups = [...rule.conditionGroups]
    const updatedConditions = [...group.conditions]
    const existingCondition = updatedConditions[conditionIndex]
    if (!existingCondition) return

    updatedConditions[conditionIndex] = {
      fieldId: updates.fieldId ?? existingCondition.fieldId,
      operator: updates.operator ?? existingCondition.operator,
      value: updates.value !== undefined ? updates.value : existingCondition.value
    }
    updatedGroups[groupIndex] = {
      conditions: updatedConditions,
      logicalOperator: group.logicalOperator
    }

    updateRule(ruleId, { conditionGroups: updatedGroups })
  }

  const deleteCondition = (ruleId: string, groupIndex: number, conditionIndex: number) => {
    const rule = rules.find(r => r.id === ruleId)
    const group = rule?.conditionGroups[groupIndex]
    if (!rule || !group) return

    const updatedGroups = [...rule.conditionGroups]
    updatedGroups[groupIndex] = {
      conditions: group.conditions.filter((_, i) => i !== conditionIndex),
      logicalOperator: group.logicalOperator
    }

    updateRule(ruleId, { conditionGroups: updatedGroups })
  }

  const updateGroupOperator = (ruleId: string, groupIndex: number, operator: 'AND' | 'OR') => {
    const rule = rules.find(r => r.id === ruleId)
    const group = rule?.conditionGroups[groupIndex]
    if (!rule || !group) return

    const updatedGroups = [...rule.conditionGroups]
    updatedGroups[groupIndex] = {
      conditions: group.conditions,
      logicalOperator: operator
    }

    updateRule(ruleId, { conditionGroups: updatedGroups })
  }

  const setAction = (ruleId: string, action: LogicAction) => {
    updateRule(ruleId, { actions: [action] })
  }

  const getFieldById = (id: string) => allFields.find(f => f.id === id)
  const fieldNames = Object.fromEntries(allFields.map(f => [f.id, f.title]))

  if (previousFields.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-500 text-sm">
          Logic jumps require previous questions to set conditions.
        </p>
        <p className="text-gray-400 text-xs mt-1">
          Add more questions before this one to enable logic.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Logic Rules</h4>
        <Button size="sm" variant="secondary" onClick={addRule}>
          Add Rule
        </Button>
      </div>

      {rules.length === 0 ? (
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-500 text-sm">No logic rules configured</p>
          <p className="text-gray-400 text-xs mt-1">
            Add a rule to control when to skip or jump to another question
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule, ruleIndex) => (
            <div
              key={rule.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Rule Header */}
              <div
                className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer"
                onClick={() => setExpandedRuleId(expandedRuleId === rule.id ? null : rule.id)}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className={`w-4 h-4 transition-transform ${expandedRuleId === rule.id ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="font-medium text-sm">Rule {ruleIndex + 1}</span>
                  <Badge variant={rule.enabled ? 'success' : 'default'}>
                    {rule.enabled ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      updateRule(rule.id, { enabled: !rule.enabled })
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {rule.enabled ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteRule(rule.id)
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Rule Content */}
              {expandedRuleId === rule.id && (
                <div className="p-4 space-y-4">
                  {/* Conditions */}
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-700">If...</h5>

                    {rule.conditionGroups.map((group, groupIndex) => (
                      <div key={groupIndex} className="space-y-2">
                        {group.conditions.map((condition, conditionIndex) => {
                          const conditionField = getFieldById(condition.fieldId)
                          const operators = conditionField
                            ? getOperatorsForFieldType(conditionField.type)
                            : getOperatorsForFieldType('short_text')

                          return (
                            <div key={conditionIndex} className="flex items-center gap-2">
                              {conditionIndex > 0 && (
                                <Select
                                  value={group.logicalOperator}
                                  onChange={(e: ChangeEvent<HTMLSelectElement>) => updateGroupOperator(rule.id, groupIndex, e.target.value as 'AND' | 'OR')}
                                  options={[
                                    { value: 'AND', label: 'AND' },
                                    { value: 'OR', label: 'OR' }
                                  ]}
                                  className="w-20"
                                />
                              )}

                              <Select
                                value={condition.fieldId}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => updateCondition(rule.id, groupIndex, conditionIndex, { fieldId: e.target.value })}
                                options={previousFields.map(f => ({ value: f.id, label: f.title }))}
                                className="flex-1"
                              />

                              <Select
                                value={condition.operator}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => updateCondition(rule.id, groupIndex, conditionIndex, { operator: e.target.value as ConditionOperator })}
                                options={operators}
                                className="w-40"
                              />

                              {!['is_empty', 'is_not_empty'].includes(condition.operator) && (
                                conditionField?.properties?.options ? (
                                  <Select
                                    value={String(condition.value || '')}
                                    onChange={(e) => updateCondition(rule.id, groupIndex, conditionIndex, { value: e.target.value })}
                                    options={conditionField.properties.options.map(opt => ({
                                      value: opt.value,
                                      label: opt.label
                                    }))}
                                    className="flex-1"
                                  />
                                ) : (
                                  <Input
                                    value={String(condition.value || '')}
                                    onChange={(e) => updateCondition(rule.id, groupIndex, conditionIndex, { value: e.target.value })}
                                    placeholder="Value"
                                    className="flex-1"
                                  />
                                )
                              )}

                              <button
                                onClick={() => deleteCondition(rule.id, groupIndex, conditionIndex)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          )
                        })}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => addCondition(rule.id, groupIndex)}
                        >
                          + Add Condition
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Action */}
                  <div className="space-y-2 pt-3 border-t">
                    <h5 className="text-sm font-medium text-gray-700">Then...</h5>

                    <div className="flex items-center gap-2">
                      <Select
                        value={rule.actions[0]?.type || 'jump_to'}
                        onChange={(e) => {
                          const actionType = e.target.value
                          if (actionType === 'skip_to_end') {
                            setAction(rule.id, { type: 'skip_to_end' })
                          } else if (actionType === 'jump_to') {
                            setAction(rule.id, {
                              type: 'jump_to',
                              targetFieldId: nextFields[0]?.id || ''
                            })
                          }
                        }}
                        options={[
                          { value: 'jump_to', label: 'Jump to question' },
                          { value: 'skip_to_end', label: 'Skip to end' }
                        ]}
                        className="w-48"
                      />

                      {rule.actions[0]?.type === 'jump_to' && (
                        <Select
                          value={(rule.actions[0] as { type: 'jump_to'; targetFieldId: string }).targetFieldId || ''}
                          onChange={(e: ChangeEvent<HTMLSelectElement>) => setAction(rule.id, { type: 'jump_to', targetFieldId: e.target.value })}
                          options={nextFields.map(f => ({ value: f.id, label: f.title }))}
                          className="flex-1"
                        />
                      )}
                    </div>
                  </div>

                  {/* Rule Summary */}
                  {rule.conditionGroups[0] && rule.conditionGroups[0].conditions.length > 0 && rule.actions[0] && (
                    <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                      <strong>Summary:</strong>{' '}
                      {rule.conditionGroups[0].conditions.map((c, i) => {
                        const field = getFieldById(c.fieldId)
                        const firstGroup = rule.conditionGroups[0]
                        return (
                          <span key={i}>
                            {i > 0 && firstGroup && ` ${firstGroup.logicalOperator} `}
                            {describeCondition(c, field?.title || 'Unknown')}
                          </span>
                        )
                      })}
                      {' → '}
                      {rule.actions[0] && describeAction(rule.actions[0], fieldNames)}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Logic Preview */}
      {rules.some(r => r.enabled && r.actions.length > 0) && (
        <div className="mt-4 p-3 bg-purple-50 rounded-lg">
          <h5 className="text-sm font-medium text-purple-900 mb-2">Logic Flow</h5>
          <div className="flex items-center gap-2 text-sm text-purple-700">
            <span className="px-2 py-1 bg-purple-100 rounded">{fieldTitle}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            {rules.filter(r => r.enabled).map((rule, i) => (
              <span key={rule.id} className="flex items-center gap-2">
                {i > 0 && <span className="text-purple-400">or</span>}
                <span className="px-2 py-1 bg-purple-100 rounded">
                  {rule.actions[0]?.type === 'skip_to_end'
                    ? 'End'
                    : fieldNames[(rule.actions[0] as { type: 'jump_to'; targetFieldId: string })?.targetFieldId] || 'Next'}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
