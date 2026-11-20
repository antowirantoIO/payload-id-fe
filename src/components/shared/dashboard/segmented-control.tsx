import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Segment<T extends string> {
  value: T
  label: ReactNode
}

interface SegmentedControlProps<T extends string> {
  value: T
  options: readonly Segment<T>[]
  onChange: (value: T) => void
  className?: string
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 border border-border bg-muted/50 p-0.5',
        className,
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'border-b-2 border-transparent px-2.5 py-1.5 text-xs font-medium transition-colors',
            value === option.value
              ? 'border-primary bg-card text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
