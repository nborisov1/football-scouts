'use client'

import React from 'react'
import { cn } from '@/utils/cn'

export interface TableColumn {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
}

export interface TableProps {
  columns: TableColumn[]
  data: any[]
  onSort?: (key: string, direction: 'asc' | 'desc') => void
  onRowClick?: (row: any) => void
  loading?: boolean
  emptyMessage?: string
  className?: string
  sortKey?: string
  sortDirection?: 'asc' | 'desc'
}

const Table: React.FC<TableProps> = ({
  columns,
  data,
  onSort,
  onRowClick,
  loading,
  emptyMessage = "אין נתונים להצגה",
  className,
  sortKey,
  sortDirection,
}) => {
  const handleSort = (key: string) => {
    if (!onSort) return
    
    const newDirection = 
      sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc'
    onSort(key, newDirection)
  }

  if (loading) {
    return (
      <div className="bg-background-surface rounded-lg border border-neutral-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span className="mr-3 text-text-muted">טוען נתונים...</span>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-background-surface rounded-lg border border-neutral-200 p-8 text-center">
        <div className="text-neutral-400 text-4xl mb-4">
          <i className="fas fa-inbox"></i>
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">אין נתונים</h3>
        <p className="text-text-muted">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn("bg-background-surface rounded-lg border border-neutral-200 overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-neutral-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider",
                    column.align === 'center' && "text-center",
                    column.align === 'left' && "text-left",
                    column.align === 'right' && "text-right",
                    !column.align && "text-right", // Default to right for RTL
                    column.sortable && "cursor-pointer hover:bg-neutral-100 select-none"
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center justify-between">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <span className="ml-2">
                        {sortKey === column.key ? (
                          <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'} text-primary-500`} />
                        ) : (
                          <i className="fas fa-sort text-neutral-400" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-background-surface divide-y divide-neutral-200">
            {data.map((row, index) => (
              <tr
                key={index}
                className={cn(
                  "transition-colors duration-200",
                  onRowClick && "cursor-pointer hover:bg-neutral-50"
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-6 py-4 text-sm text-text-primary",
                      column.align === 'center' && "text-center",
                      column.align === 'left' && "text-left", 
                      column.align === 'right' && "text-right",
                      !column.align && "text-right" // Default to right for RTL
                    )}
                  >
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export { Table }
