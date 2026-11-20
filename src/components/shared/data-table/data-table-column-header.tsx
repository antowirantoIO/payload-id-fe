'use client'

import type { Column } from '@tanstack/react-table'
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>
  title: string
  className?: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <span className={className}>{title}</span>
  }

  const sorted = column.getIsSorted()
  const Icon = sorted === 'asc' ? ArrowUpIcon : sorted === 'desc' ? ArrowDownIcon : ArrowUpDownIcon

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        '-ml-2 h-8 gap-1.5 px-2 text-sm leading-5 font-medium normal-case tracking-normal',
        sorted ? 'text-foreground' : 'text-muted-foreground',
        className,
      )}
      onClick={() => column.toggleSorting(sorted === 'asc')}
    >
      {title}
      <Icon
        className={cn(
          'size-3 transition-opacity',
          sorted ? 'opacity-100' : 'opacity-50 group-hover/button:opacity-80',
        )}
      />
    </Button>
  )
}
