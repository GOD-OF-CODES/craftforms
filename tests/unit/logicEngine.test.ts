/**
 * Unit tests for logic engine
 */

import {
  evaluateCondition,
  evaluateConditionGroup,
  evaluateLogicRule,
  getNextFieldId,
  validateLogicRules,
  LogicCondition,
  LogicConditionGroup,
  LogicRule,
} from '@/lib/logicEngine'

describe('Logic Engine', () => {
  describe('evaluateCondition', () => {
    it('should evaluate equals correctly', () => {
      const condition: LogicCondition = {
        fieldId: 'field1',
        operator: 'equals',
        value: 'test',
      }
      expect(evaluateCondition(condition, { field1: 'test' })).toBe(true)
      expect(evaluateCondition(condition, { field1: 'other' })).toBe(false)
    })

    it('should evaluate not_equals correctly', () => {
      const condition: LogicCondition = {
        fieldId: 'field1',
        operator: 'not_equals',
        value: 'test',
      }
      expect(evaluateCondition(condition, { field1: 'other' })).toBe(true)
      expect(evaluateCondition(condition, { field1: 'test' })).toBe(false)
    })

    it('should evaluate contains correctly', () => {
      const condition: LogicCondition = {
        fieldId: 'field1',
        operator: 'contains',
        value: 'world',
      }
      expect(evaluateCondition(condition, { field1: 'hello world' })).toBe(true)
      expect(evaluateCondition(condition, { field1: 'hello' })).toBe(false)
    })

    it('should evaluate greater_than correctly', () => {
      const condition: LogicCondition = {
        fieldId: 'field1',
        operator: 'greater_than',
        value: 10,
      }
      expect(evaluateCondition(condition, { field1: 15 })).toBe(true)
      expect(evaluateCondition(condition, { field1: 5 })).toBe(false)
      expect(evaluateCondition(condition, { field1: 10 })).toBe(false)
    })

    it('should evaluate less_than correctly', () => {
      const condition: LogicCondition = {
        fieldId: 'field1',
        operator: 'less_than',
        value: 10,
      }
      expect(evaluateCondition(condition, { field1: 5 })).toBe(true)
      expect(evaluateCondition(condition, { field1: 15 })).toBe(false)
      expect(evaluateCondition(condition, { field1: 10 })).toBe(false)
    })

    it('should evaluate is_empty correctly', () => {
      const condition: LogicCondition = {
        fieldId: 'field1',
        operator: 'is_empty',
      }
      expect(evaluateCondition(condition, { field1: '' })).toBe(true)
      expect(evaluateCondition(condition, { field1: null })).toBe(true)
      expect(evaluateCondition(condition, { field1: undefined })).toBe(true)
      expect(evaluateCondition(condition, { field1: 'value' })).toBe(false)
    })

    it('should evaluate is_not_empty correctly', () => {
      const condition: LogicCondition = {
        fieldId: 'field1',
        operator: 'is_not_empty',
      }
      expect(evaluateCondition(condition, { field1: 'value' })).toBe(true)
      expect(evaluateCondition(condition, { field1: '' })).toBe(false)
      expect(evaluateCondition(condition, { field1: null })).toBe(false)
    })

    it('should evaluate is_selected correctly for arrays', () => {
      const condition: LogicCondition = {
        fieldId: 'field1',
        operator: 'is_selected',
        value: 'option2',
      }
      expect(evaluateCondition(condition, { field1: ['option1', 'option2'] })).toBe(true)
      expect(evaluateCondition(condition, { field1: ['option1', 'option3'] })).toBe(false)
    })

    it('should handle missing field', () => {
      const condition: LogicCondition = {
        fieldId: 'nonexistent',
        operator: 'equals',
        value: 'test',
      }
      expect(evaluateCondition(condition, { field1: 'test' })).toBe(false)
    })
  })

  describe('evaluateConditionGroup', () => {
    it('should evaluate AND logic correctly', () => {
      const group: LogicConditionGroup = {
        logicalOperator: 'AND',
        conditions: [
          { fieldId: 'field1', operator: 'equals', value: 'a' },
          { fieldId: 'field2', operator: 'equals', value: 'b' },
        ],
      }
      expect(evaluateConditionGroup(group, { field1: 'a', field2: 'b' })).toBe(true)
      expect(evaluateConditionGroup(group, { field1: 'a', field2: 'c' })).toBe(false)
      expect(evaluateConditionGroup(group, { field1: 'x', field2: 'b' })).toBe(false)
    })

    it('should evaluate OR logic correctly', () => {
      const group: LogicConditionGroup = {
        logicalOperator: 'OR',
        conditions: [
          { fieldId: 'field1', operator: 'equals', value: 'a' },
          { fieldId: 'field2', operator: 'equals', value: 'b' },
        ],
      }
      expect(evaluateConditionGroup(group, { field1: 'a', field2: 'x' })).toBe(true)
      expect(evaluateConditionGroup(group, { field1: 'x', field2: 'b' })).toBe(true)
      expect(evaluateConditionGroup(group, { field1: 'a', field2: 'b' })).toBe(true)
      expect(evaluateConditionGroup(group, { field1: 'x', field2: 'x' })).toBe(false)
    })

    it('should handle empty conditions', () => {
      const group: LogicConditionGroup = {
        logicalOperator: 'AND',
        conditions: [],
      }
      expect(evaluateConditionGroup(group, {})).toBe(true)
    })
  })

  describe('evaluateLogicRule', () => {
    it('should evaluate enabled rule', () => {
      const rule: LogicRule = {
        id: 'rule1',
        enabled: true,
        groupOperator: 'AND',
        conditionGroups: [
          {
            logicalOperator: 'AND',
            conditions: [{ fieldId: 'field1', operator: 'equals', value: 'yes' }],
          },
        ],
        actions: [{ type: 'jump_to', targetFieldId: 'field3' }],
      }
      expect(evaluateLogicRule(rule, { field1: 'yes' })).toBe(true)
      expect(evaluateLogicRule(rule, { field1: 'no' })).toBe(false)
    })

    it('should return false for disabled rule', () => {
      const rule: LogicRule = {
        id: 'rule1',
        enabled: false,
        groupOperator: 'AND',
        conditionGroups: [
          {
            logicalOperator: 'AND',
            conditions: [{ fieldId: 'field1', operator: 'equals', value: 'yes' }],
          },
        ],
        actions: [{ type: 'jump_to', targetFieldId: 'field3' }],
      }
      expect(evaluateLogicRule(rule, { field1: 'yes' })).toBe(false)
    })

    it('should combine multiple condition groups with AND', () => {
      const rule: LogicRule = {
        id: 'rule1',
        enabled: true,
        groupOperator: 'AND',
        conditionGroups: [
          {
            logicalOperator: 'AND',
            conditions: [{ fieldId: 'field1', operator: 'equals', value: 'a' }],
          },
          {
            logicalOperator: 'AND',
            conditions: [{ fieldId: 'field2', operator: 'equals', value: 'b' }],
          },
        ],
        actions: [{ type: 'jump_to', targetFieldId: 'field3' }],
      }
      expect(evaluateLogicRule(rule, { field1: 'a', field2: 'b' })).toBe(true)
      expect(evaluateLogicRule(rule, { field1: 'a', field2: 'x' })).toBe(false)
    })

    it('should combine multiple condition groups with OR', () => {
      const rule: LogicRule = {
        id: 'rule1',
        enabled: true,
        groupOperator: 'OR',
        conditionGroups: [
          {
            logicalOperator: 'AND',
            conditions: [{ fieldId: 'field1', operator: 'equals', value: 'a' }],
          },
          {
            logicalOperator: 'AND',
            conditions: [{ fieldId: 'field2', operator: 'equals', value: 'b' }],
          },
        ],
        actions: [{ type: 'jump_to', targetFieldId: 'field3' }],
      }
      expect(evaluateLogicRule(rule, { field1: 'a', field2: 'x' })).toBe(true)
      expect(evaluateLogicRule(rule, { field1: 'x', field2: 'b' })).toBe(true)
      expect(evaluateLogicRule(rule, { field1: 'x', field2: 'x' })).toBe(false)
    })
  })

  describe('getNextFieldId', () => {
    const fields = [
      { id: 'field1', type: 'short_text', logic: undefined },
      {
        id: 'field2',
        type: 'yes_no',
        logic: {
          fieldId: 'field2',
          rules: [
            {
              id: 'rule1',
              enabled: true,
              groupOperator: 'AND' as const,
              conditionGroups: [
                {
                  logicalOperator: 'AND' as const,
                  conditions: [{ fieldId: 'field2', operator: 'equals' as const, value: 'yes' }],
                },
              ],
              actions: [{ type: 'jump_to' as const, targetFieldId: 'field4' }],
            },
          ],
        },
      },
      { id: 'field3', type: 'email', logic: undefined },
      { id: 'field4', type: 'number', logic: undefined },
    ]

    it('should return next field when no logic matches', () => {
      const result = getNextFieldId('field1', fields, { field1: 'test' }, 'field2')
      expect(result).toBe('field2')
    })

    it('should return target field when logic matches', () => {
      const result = getNextFieldId('field2', fields, { field2: 'yes' }, 'field3')
      expect(result).toBe('field4')
    })

    it('should return default when logic does not match', () => {
      const result = getNextFieldId('field2', fields, { field2: 'no' }, 'field3')
      expect(result).toBe('field3')
    })

    it('should handle skip_to_end action', () => {
      const fieldsWithEnd = [
        {
          id: 'field1',
          type: 'yes_no',
          logic: {
            fieldId: 'field1',
            rules: [
              {
                id: 'rule1',
                enabled: true,
                groupOperator: 'AND' as const,
                conditionGroups: [
                  {
                    logicalOperator: 'AND' as const,
                    conditions: [{ fieldId: 'field1', operator: 'equals' as const, value: 'no' }],
                  },
                ],
                actions: [{ type: 'skip_to_end' as const }],
              },
            ],
          },
        },
        { id: 'field2', type: 'text', logic: undefined },
      ]

      const result = getNextFieldId('field1', fieldsWithEnd, { field1: 'no' }, 'field2')
      expect(result).toBe('end')
    })
  })

  describe('validateLogicRules', () => {
    it('should detect circular dependencies', () => {
      const fields = [
        {
          id: 'field1',
          logic: {
            fieldId: 'field1',
            rules: [
              {
                id: 'rule1',
                enabled: true,
                groupOperator: 'AND' as const,
                conditionGroups: [],
                actions: [{ type: 'jump_to' as const, targetFieldId: 'field2' }],
              },
            ],
          },
        },
        {
          id: 'field2',
          logic: {
            fieldId: 'field2',
            rules: [
              {
                id: 'rule2',
                enabled: true,
                groupOperator: 'AND' as const,
                conditionGroups: [],
                actions: [{ type: 'jump_to' as const, targetFieldId: 'field1' }],
              },
            ],
          },
        },
      ]

      const result = validateLogicRules(fields)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should pass for valid logic', () => {
      const fields = [
        {
          id: 'field1',
          logic: {
            fieldId: 'field1',
            rules: [
              {
                id: 'rule1',
                enabled: true,
                groupOperator: 'AND' as const,
                conditionGroups: [],
                actions: [{ type: 'jump_to' as const, targetFieldId: 'field3' }],
              },
            ],
          },
        },
        { id: 'field2', logic: undefined },
        { id: 'field3', logic: undefined },
      ]

      const result = validateLogicRules(fields)
      expect(result.valid).toBe(true)
      expect(result.errors.length).toBe(0)
    })
  })
})
