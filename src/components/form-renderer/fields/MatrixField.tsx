import { FieldInputProps } from './types'

export default function MatrixField({ field, value, onChange }: FieldInputProps) {
  const matrixValue = value || {}
  const rows = field.properties.rows || ['Row 1', 'Row 2']
  const columns = field.properties.columns || ['Column 1', 'Column 2']
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-3 text-left text-sm font-medium text-text-secondary"></th>
            {columns.map((col: string, colIndex: number) => (
              <th key={colIndex} className="p-3 text-center text-sm font-medium text-text-secondary">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: string, rowIndex: number) => (
            <tr key={rowIndex} className="border-t border-border">
              <td className="p-3 text-sm text-text-primary">{row}</td>
              {columns.map((col: string, colIndex: number) => (
                <td key={colIndex} className="p-3 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ ...matrixValue, [row]: col })
                    }}
                    className={`w-5 h-5 rounded-full border-2 transition-colors ${
                      matrixValue[row] === col
                        ? 'bg-primary border-primary'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    {matrixValue[row] === col && (
                      <svg className="w-full h-full text-white p-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
