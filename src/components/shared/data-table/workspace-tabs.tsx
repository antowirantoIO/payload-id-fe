'use client'

import { cn } from '@/lib/utils'

export function WorkspaceTabs({
  label,
  items,
  value,
  onChange,
}: {
  label: string
  items: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="mt-6 mb-4 flex gap-5 overflow-x-auto border-b"
    >
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={value === item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            'shrink-0 border-b-2 px-1 pt-2 pb-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring',
            value === item.value
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
