import { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react'

export interface TableProps extends HTMLAttributes<HTMLTableElement> {}
export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {}
export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}
export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {}
export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {}
export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {}

const Table = ({ className = '', ...props }: TableProps) => {
  return (
    <div className="w-full overflow-auto">
      <table
        className={`w-full caption-bottom text-sm ${className}`}
        {...props}
      />
    </div>
  )
}

const TableHeader = ({ className = '', ...props }: TableHeaderProps) => {
  return (
    <thead className={`border-b border-border ${className}`} {...props} />
  )
}

const TableBody = ({ className = '', ...props }: TableBodyProps) => {
  return (
    <tbody className={`[&_tr:last-child]:border-0 ${className}`} {...props} />
  )
}

const TableRow = ({ className = '', ...props }: TableRowProps) => {
  return (
    <tr
      className={`
        border-b border-border transition-colors
        hover:bg-surface
        data-[state=selected]:bg-surface
        ${className}
      `}
      {...props}
    />
  )
}

const TableHead = ({ className = '', ...props }: TableHeadProps) => {
  return (
    <th
      className={`
        h-12 px-4 text-left align-middle font-medium text-text-secondary
        [&:has([role=checkbox])]:pr-0
        ${className}
      `}
      {...props}
    />
  )
}

const TableCell = ({ className = '', ...props }: TableCellProps) => {
  return (
    <td
      className={`
        p-4 align-middle text-text-primary
        [&:has([role=checkbox])]:pr-0
        ${className}
      `}
      {...props}
    />
  )
}

Table.displayName = 'Table'
TableHeader.displayName = 'TableHeader'
TableBody.displayName = 'TableBody'
TableRow.displayName = 'TableRow'
TableHead.displayName = 'TableHead'
TableCell.displayName = 'TableCell'

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }
export default Table
