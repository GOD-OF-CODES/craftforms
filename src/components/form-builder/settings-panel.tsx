'use client'

import { useState } from 'react'
import { FormField } from '@/store/formBuilderStore'
import Input from '@/components/ui/input'
import Textarea from '@/components/ui/textarea'
import Switch from '@/components/ui/switch'
import Button from '@/components/ui/button'
import Label from '@/components/ui/label'
import LogicBuilder from './LogicBuilder'
import { LogicRule } from '@/lib/logicEngine'

interface SettingsPanelProps {
  field: FormField | null
  allFields?: FormField[]
  onFieldUpdate: (updates: Partial<FormField>) => void
  onFieldDelete: () => void
}

const SettingsPanel = ({ field, allFields = [], onFieldUpdate, onFieldDelete }: SettingsPanelProps) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'logic'>('settings')

  if (!field) {
    return (
      <div className="w-80 bg-surface border-l border-border p-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm text-text-secondary">
              Select a field to edit its settings
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Get logic rules from field properties
  const logicRules: LogicRule[] = (field.properties?.logicRules as LogicRule[]) || []

  // Convert allFields for LogicBuilder
  const logicBuilderFields = allFields.map(f => ({
    id: f.id,
    title: f.title,
    type: f.type,
    properties: f.properties as { options?: Array<{ id: string; label: string; value: string }> }
  }))

  const handleLogicRulesChange = (rules: LogicRule[]) => {
    onFieldUpdate({
      properties: { ...field.properties, logicRules: rules }
    })
  }

  // Check if field has active logic rules
  const hasLogic = logicRules.some(r => r.enabled && r.actions.length > 0)

  return (
    <div className="w-80 bg-surface border-l border-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-text-primary">Field Settings</h2>
          {hasLogic && (
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
              Logic
            </span>
          )}
        </div>
        <p className="text-xs text-text-secondary uppercase">{field.type.replace('_', ' ')}</p>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4">
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'settings'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('logic')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1 ${
              activeTab === 'logic'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Logic
            {hasLogic && (
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'logic' ? (
          <LogicBuilder
            fieldId={field.id}
            fieldTitle={field.title}
            allFields={logicBuilderFields}
            rules={logicRules}
            onRulesChange={handleLogicRulesChange}
          />
        ) : (
          <div className="space-y-6">
        {/* Question */}
        <div>
          <Label htmlFor="title" required>Question</Label>
          <Input
            id="title"
            value={field.title}
            onChange={(e) => onFieldUpdate({ title: e.target.value })}
            placeholder="Enter your question"
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={field.description || ''}
            onChange={(e) => onFieldUpdate({ description: e.target.value })}
            placeholder="Add a description (optional)"
            rows={3}
          />
        </div>

        {/* Required */}
        <div>
          <Switch
            label="Required Field"
            checked={field.isRequired}
            onCheckedChange={(checked) => onFieldUpdate({ isRequired: checked })}
          />
          <p className="text-xs text-text-secondary mt-1">
            Respondents must answer this question
          </p>
        </div>

        {/* Field Type Specific Settings */}
        {(field.type === 'short_text' || field.type === 'email' || field.type === 'url') && (
          <div>
            <Label htmlFor="placeholder">Placeholder</Label>
            <Input
              id="placeholder"
              value={field.properties.placeholder || ''}
              onChange={(e) =>
                onFieldUpdate({
                  properties: { ...field.properties, placeholder: e.target.value },
                })
              }
              placeholder="Enter placeholder text"
            />
          </div>
        )}

        {/* Validation Settings for Text Fields */}
        {(field.type === 'short_text' || field.type === 'long_text') && (
          <>
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-text-primary mb-3">Validation</h3>
            </div>
            <div>
              <Label htmlFor="minLength">Minimum Length</Label>
              <Input
                id="minLength"
                type="number"
                min="0"
                value={field.properties.minLength || ''}
                onChange={(e) =>
                  onFieldUpdate({
                    properties: { ...field.properties, minLength: e.target.value ? Number(e.target.value) : undefined },
                  })
                }
                placeholder="No minimum"
              />
            </div>
            <div>
              <Label htmlFor="maxLength">Maximum Length</Label>
              <Input
                id="maxLength"
                type="number"
                min="1"
                value={field.properties.maxLength || ''}
                onChange={(e) =>
                  onFieldUpdate({
                    properties: { ...field.properties, maxLength: e.target.value ? Number(e.target.value) : undefined },
                  })
                }
                placeholder="No maximum"
              />
            </div>
            <div>
              <Label htmlFor="pattern">Pattern (Regex)</Label>
              <Input
                id="pattern"
                value={field.properties.pattern || ''}
                onChange={(e) =>
                  onFieldUpdate({
                    properties: { ...field.properties, pattern: e.target.value || undefined },
                  })
                }
                placeholder="e.g., ^[A-Z].*"
              />
              <p className="text-xs text-text-secondary mt-1">
                Regular expression for validation
              </p>
            </div>
            <div>
              <Label htmlFor="customErrorMessage">Custom Error Message</Label>
              <Input
                id="customErrorMessage"
                value={field.properties.customErrorMessage || ''}
                onChange={(e) =>
                  onFieldUpdate({
                    properties: { ...field.properties, customErrorMessage: e.target.value || undefined },
                  })
                }
                placeholder="Enter custom error message"
              />
            </div>
          </>
        )}

        {/* Validation Settings for Email Field */}
        {field.type === 'email' && (
          <>
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-text-primary mb-3">Validation</h3>
            </div>
            <div>
              <Label htmlFor="emailErrorMessage">Custom Error Message</Label>
              <Input
                id="emailErrorMessage"
                value={field.properties.customErrorMessage || ''}
                onChange={(e) =>
                  onFieldUpdate({
                    properties: { ...field.properties, customErrorMessage: e.target.value || undefined },
                  })
                }
                placeholder="Please enter a valid email address"
              />
            </div>
          </>
        )}

        {/* Validation Settings for URL Field */}
        {field.type === 'url' && (
          <>
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-text-primary mb-3">Validation</h3>
            </div>
            <div>
              <Label htmlFor="urlErrorMessage">Custom Error Message</Label>
              <Input
                id="urlErrorMessage"
                value={field.properties.customErrorMessage || ''}
                onChange={(e) =>
                  onFieldUpdate({
                    properties: { ...field.properties, customErrorMessage: e.target.value || undefined },
                  })
                }
                placeholder="Please enter a valid URL"
              />
            </div>
          </>
        )}

        {/* Validation Settings for Phone Field */}
        {field.type === 'phone' && (
          <>
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-text-primary mb-3">Validation</h3>
            </div>
            <div>
              <Label htmlFor="phoneErrorMessage">Custom Error Message</Label>
              <Input
                id="phoneErrorMessage"
                value={field.properties.customErrorMessage || ''}
                onChange={(e) =>
                  onFieldUpdate({
                    properties: { ...field.properties, customErrorMessage: e.target.value || undefined },
                  })
                }
                placeholder="Please enter a valid phone number"
              />
            </div>
          </>
        )}

        {field.type === 'number' && (
          <>
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-text-primary mb-3">Validation</h3>
            </div>
            <div>
              <Label htmlFor="min">Minimum Value</Label>
              <Input
                id="min"
                type="number"
                value={field.properties.min ?? ''}
                onChange={(e) =>
                  onFieldUpdate({
                    properties: { ...field.properties, min: e.target.value ? Number(e.target.value) : undefined },
                  })
                }
                placeholder="No minimum"
              />
            </div>
            <div>
              <Label htmlFor="max">Maximum Value</Label>
              <Input
                id="max"
                type="number"
                value={field.properties.max ?? ''}
                onChange={(e) =>
                  onFieldUpdate({
                    properties: { ...field.properties, max: e.target.value ? Number(e.target.value) : undefined },
                  })
                }
                placeholder="No maximum"
              />
            </div>
            <div>
              <Label htmlFor="decimalPlaces">Decimal Places</Label>
              <Input
                id="decimalPlaces"
                type="number"
                min="0"
                max="10"
                value={field.properties.decimalPlaces ?? ''}
                onChange={(e) =>
                  onFieldUpdate({
                    properties: { ...field.properties, decimalPlaces: e.target.value ? Number(e.target.value) : undefined },
                  })
                }
                placeholder="Any"
              />
            </div>
            <div>
              <Label htmlFor="numberErrorMessage">Custom Error Message</Label>
              <Input
                id="numberErrorMessage"
                value={field.properties.customErrorMessage || ''}
                onChange={(e) =>
                  onFieldUpdate({
                    properties: { ...field.properties, customErrorMessage: e.target.value || undefined },
                  })
                }
                placeholder="Please enter a valid number"
              />
            </div>
          </>
        )}

        {/* Options for Multiple Choice, Checkboxes, Dropdown */}
        {(field.type === 'multiple_choice' || field.type === 'checkboxes' || field.type === 'dropdown') && (
          <div>
            <Label>Options</Label>
            <div className="space-y-2">
              {(field.properties.options || ['Option 1', 'Option 2', 'Option 3']).map((option: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(field.properties.options || ['Option 1', 'Option 2', 'Option 3'])]
                      newOptions[index] = e.target.value
                      onFieldUpdate({
                        properties: { ...field.properties, options: newOptions },
                      })
                    }}
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newOptions = (field.properties.options || ['Option 1', 'Option 2', 'Option 3']).filter((_: any, i: number) => i !== index)
                      onFieldUpdate({
                        properties: { ...field.properties, options: newOptions },
                      })
                    }}
                    className="flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2"
              onClick={() => {
                const currentOptions = field.properties.options || ['Option 1', 'Option 2', 'Option 3']
                onFieldUpdate({
                  properties: {
                    ...field.properties,
                    options: [...currentOptions, `Option ${currentOptions.length + 1}`],
                  },
                })
              }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Option
            </Button>
          </div>
        )}

        {/* Checkboxes - Min/Max selections */}
        {field.type === 'checkboxes' && (
          <>
            <div>
              <Label htmlFor="minSelections">Minimum Selections</Label>
              <Input
                id="minSelections"
                type="number"
                min="0"
                value={field.properties.minSelections || ''}
                onChange={(e) =>
                  onFieldUpdate({
                    properties: { ...field.properties, minSelections: Number(e.target.value) },
                  })
                }
                placeholder="Optional"
              />
            </div>
            <div>
              <Label htmlFor="maxSelections">Maximum Selections</Label>
              <Input
                id="maxSelections"
                type="number"
                min="1"
                value={field.properties.maxSelections || ''}
                onChange={(e) =>
                  onFieldUpdate({
                    properties: { ...field.properties, maxSelections: Number(e.target.value) },
                  })
                }
                placeholder="Optional"
              />
            </div>
          </>
        )}

        {/* Yes/No - Custom labels */}
        {field.type === 'yes_no' && (
          <>
            <div>
              <Label htmlFor="yesLabel">Yes Label</Label>
              <Input
                id="yesLabel"
                value={field.properties.yesLabel || 'Yes'}
                onChange={(e) =>
                  onFieldUpdate({
                    properties: { ...field.properties, yesLabel: e.target.value },
                  })
                }
                placeholder="Yes"
              />
            </div>
            <div>
              <Label htmlFor="noLabel">No Label</Label>
              <Input
                id="noLabel"
                value={field.properties.noLabel || 'No'}
                onChange={(e) =>
                  onFieldUpdate({
                    properties: { ...field.properties, noLabel: e.target.value },
                  })
                }
                placeholder="No"
              />
            </div>
          </>
        )}

        {/* Rating Scale */}
        {field.type === 'rating' && (
          <div>
            <Label htmlFor="ratingMax">Rating Scale</Label>
            <select
              id="ratingMax"
              value={field.properties.ratingMax || 5}
              onChange={(e) =>
                onFieldUpdate({
                  properties: { ...field.properties, ratingMax: Number(e.target.value) },
                })
              }
              className="w-full px-3 py-2 text-base rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={5}>1 to 5 Stars</option>
              <option value={10}>1 to 10 Stars</option>
            </select>
          </div>
        )}

        {/* Opinion Scale */}
        {field.type === 'opinion_scale' && (
          <>
            <div>
              <Label htmlFor="scaleMin">Minimum Value</Label>
              <Input
                id="scaleMin"
                type="number"
                value={field.properties.scaleMin || 0}
                onChange={(e) =>
                  onFieldUpdate({
                    properties: { ...field.properties, scaleMin: Number(e.target.value) },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="scaleMax">Maximum Value</Label>
              <Input
                id="scaleMax"
                type="number"
                value={field.properties.scaleMax || 10}
                onChange={(e) =>
                  onFieldUpdate({
                    properties: { ...field.properties, scaleMax: Number(e.target.value) },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="scaleMinLabel">Minimum Label</Label>
              <Input
                id="scaleMinLabel"
                value={field.properties.scaleMinLabel || ''}
                onChange={(e) =>
                  onFieldUpdate({
                    properties: { ...field.properties, scaleMinLabel: e.target.value },
                  })
                }
                placeholder="e.g., Not likely"
              />
            </div>
            <div>
              <Label htmlFor="scaleMaxLabel">Maximum Label</Label>
              <Input
                id="scaleMaxLabel"
                value={field.properties.scaleMaxLabel || ''}
                onChange={(e) =>
                  onFieldUpdate({
                    properties: { ...field.properties, scaleMaxLabel: e.target.value },
                  })
                }
                placeholder="e.g., Very likely"
              />
            </div>
          </>
        )}

        {/* Legal Consent */}
        {field.type === 'legal' && (
          <div>
            <Label htmlFor="legalText">Legal Text</Label>
            <Textarea
              id="legalText"
              value={field.properties.legalText || ''}
              onChange={(e) =>
                onFieldUpdate({
                  properties: { ...field.properties, legalText: e.target.value },
                })
              }
              placeholder="I agree to the terms and conditions"
              rows={4}
            />
          </div>
        )}

        {/* File Upload */}
        {field.type === 'file_upload' && (
          <>
            <div>
              <Label htmlFor="fileTypes">Allowed File Types</Label>
              <Input
                id="fileTypes"
                value={field.properties.fileTypes || ''}
                onChange={(e) =>
                  onFieldUpdate({
                    properties: { ...field.properties, fileTypes: e.target.value },
                  })
                }
                placeholder="e.g., PDF, JPG, PNG"
              />
            </div>
            <div>
              <Label htmlFor="maxSize">Max File Size (MB)</Label>
              <Input
                id="maxSize"
                type="number"
                min="1"
                max="100"
                value={field.properties.maxSize || 10}
                onChange={(e) =>
                  onFieldUpdate({
                    properties: { ...field.properties, maxSize: Number(e.target.value) },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="maxFiles">Max Number of Files</Label>
              <Input
                id="maxFiles"
                type="number"
                min="1"
                max="10"
                value={field.properties.maxFiles || 1}
                onChange={(e) =>
                  onFieldUpdate({
                    properties: { ...field.properties, maxFiles: Number(e.target.value) },
                  })
                }
              />
            </div>
          </>
        )}

        {/* Ranking */}
        {field.type === 'ranking' && (
          <div>
            <Label>Items to Rank</Label>
            <div className="space-y-2">
              {(field.properties.items || ['Item 1', 'Item 2', 'Item 3']).map((item: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newItems = [...(field.properties.items || ['Item 1', 'Item 2', 'Item 3'])]
                      newItems[index] = e.target.value
                      onFieldUpdate({
                        properties: { ...field.properties, items: newItems },
                      })
                    }}
                    placeholder={`Item ${index + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newItems = (field.properties.items || ['Item 1', 'Item 2', 'Item 3']).filter((_: any, i: number) => i !== index)
                      onFieldUpdate({
                        properties: { ...field.properties, items: newItems },
                      })
                    }}
                    className="flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2"
              onClick={() => {
                const currentItems = field.properties.items || ['Item 1', 'Item 2', 'Item 3']
                onFieldUpdate({
                  properties: {
                    ...field.properties,
                    items: [...currentItems, `Item ${currentItems.length + 1}`],
                  },
                })
              }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Item
            </Button>
          </div>
        )}

        {/* Matrix/Grid */}
        {field.type === 'matrix' && (
          <>
            <div>
              <Label>Rows</Label>
              <div className="space-y-2">
                {(field.properties.rows || ['Row 1', 'Row 2']).map((row: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={row}
                      onChange={(e) => {
                        const newRows = [...(field.properties.rows || ['Row 1', 'Row 2'])]
                        newRows[index] = e.target.value
                        onFieldUpdate({
                          properties: { ...field.properties, rows: newRows },
                        })
                      }}
                      placeholder={`Row ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newRows = (field.properties.rows || ['Row 1', 'Row 2']).filter((_: any, i: number) => i !== index)
                        onFieldUpdate({
                          properties: { ...field.properties, rows: newRows },
                        })
                      }}
                      className="flex-shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                onClick={() => {
                  const currentRows = field.properties.rows || ['Row 1', 'Row 2']
                  onFieldUpdate({
                    properties: {
                      ...field.properties,
                      rows: [...currentRows, `Row ${currentRows.length + 1}`],
                    },
                  })
                }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Row
              </Button>
            </div>
            <div>
              <Label>Columns</Label>
              <div className="space-y-2">
                {(field.properties.columns || ['Column 1', 'Column 2']).map((col: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={col}
                      onChange={(e) => {
                        const newColumns = [...(field.properties.columns || ['Column 1', 'Column 2'])]
                        newColumns[index] = e.target.value
                        onFieldUpdate({
                          properties: { ...field.properties, columns: newColumns },
                        })
                      }}
                      placeholder={`Column ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newColumns = (field.properties.columns || ['Column 1', 'Column 2']).filter((_: any, i: number) => i !== index)
                        onFieldUpdate({
                          properties: { ...field.properties, columns: newColumns },
                        })
                      }}
                      className="flex-shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                onClick={() => {
                  const currentColumns = field.properties.columns || ['Column 1', 'Column 2']
                  onFieldUpdate({
                    properties: {
                      ...field.properties,
                      columns: [...currentColumns, `Column ${currentColumns.length + 1}`],
                    },
                  })
                }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Column
              </Button>
            </div>
          </>
        )}

        {/* Payment */}
        {field.type === 'payment' && (
          <>
            <div>
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={field.properties.amount || ''}
                onChange={(e) =>
                  onFieldUpdate({
                    properties: { ...field.properties, amount: e.target.value },
                  })
                }
                placeholder="0.00"
              />
            </div>
            <div className="p-3 bg-background rounded-lg">
              <p className="text-xs text-text-secondary">
                Payment integration coming soon. Connect with Stripe or PayPal to accept payments.
              </p>
            </div>
          </>
        )}

        {/* Delete Field */}
        <div className="pt-6 border-t border-border">
          <Button variant="danger" className="w-full" onClick={onFieldDelete}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Field
          </Button>
        </div>
        </div>
        )}
      </div>
    </div>
  )
}

export default SettingsPanel
