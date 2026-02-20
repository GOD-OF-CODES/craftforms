/**
 * Union type for all possible field values across form field types.
 */
export type FieldValue =
  | string
  | number
  | boolean
  | string[]
  | Record<string, string>
  | File
  | null
  | undefined
