'use client'

import type * as React from 'react'
import {
  Combobox,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxTrigger,
} from '@/components/ui/combobox'
import { cn } from '@/lib/utils'

/**
 * Higher-level wrapper buat picker relasi 1:M (Owner, Primary company, dll.)
 * dgn 2-line item display (label + sub) + leading avatar/initials.
 *
 * Single-select dgn nullable value. Pass `null`/`''` utk clear.
 *
 * Pakai ini langsung dari Form field — bukan Combobox primitives —
 * supaya konsisten antar modul.
 */
export interface RelationOption {
  value: string
  label: string
  /** Subtext line: email utk user, domain utk company, dst. */
  sub?: string | null
  /** Initial 1-2 huruf utk avatar fallback. Auto-generated kalau tidak ada. */
  initials?: string
  /**
   * Override leading visual: gunakan colored dot (mis. role color) instead of
   * initials avatar. Pass hex/css color string.
   */
  dotColor?: string | null
}

interface RelationComboboxProps {
  options: ReadonlyArray<RelationOption>
  value: string | null | undefined
  onChange: (value: string | null) => void
  placeholder?: React.ReactNode
  /** Empty (allowed) message saat user clear. */
  emptyLabel?: React.ReactNode
  /** Empty list state saat search tidak match. */
  emptyMessage?: string
  /** Disable trigger interaction. */
  disabled?: boolean
  className?: string
  /** Tambahan icon di kiri trigger saat tidak ada value (mis. UserIcon utk Owner). */
  leadingIcon?: React.ReactNode
}

function autoInitials(label: string): string {
  return (
    label
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '·'
  )
}

export function RelationCombobox({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  emptyLabel,
  emptyMessage = 'No matches.',
  disabled,
  className,
  leadingIcon,
}: RelationComboboxProps) {
  const selected = options.find((o) => o.value === value) ?? null

  return (
    <Combobox items={options} value={value ?? ''} onValueChange={(v) => onChange(v ? v : null)}>
      <ComboboxTrigger className={className} disabled={disabled}>
        {selected ? (
          <RelationLine option={selected} compact />
        ) : (
          <span className="text-muted-foreground inline-flex items-center gap-2">
            {leadingIcon}
            {emptyLabel ?? placeholder}
          </span>
        )}
      </ComboboxTrigger>

      <ComboboxPopup>
        <ComboboxInput
          placeholder={placeholder === 'Select…' ? 'Search…' : `Search ${placeholder}…`}
        />
        <ComboboxList emptyMessage={emptyMessage}>
          {options.map((opt) => (
            <ComboboxItem key={opt.value} value={opt.value}>
              <RelationLine option={opt} />
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxPopup>
    </Combobox>
  )
}

function RelationLine({
  option,
  compact = false,
}: {
  option: RelationOption
  /** Compact = single-line (utk trigger). Non-compact = 2-line (utk dropdown items). */
  compact?: boolean
}) {
  const initials = option.initials ?? autoInitials(option.label)
  return (
    <span className="flex min-w-0 items-center gap-2">
      {option.dotColor ? (
        <span
          className={cn(
            'shrink-0 rounded-full ring-2 ring-offset-0',
            compact ? 'size-2' : 'size-2.5',
          )}
          style={{
            backgroundColor: option.dotColor,
            boxShadow: `0 0 0 3px ${option.dotColor}22`,
          }}
          aria-hidden
        />
      ) : (
        <span
          className={cn(
            'bg-gradient-to-br from-muted to-muted/60 text-muted-foreground inline-flex shrink-0 items-center justify-center rounded-full font-medium ring-1 ring-border/40',
            compact ? 'size-5 text-[9px]' : 'size-7 text-[11px]',
          )}
          aria-hidden
        >
          {initials}
        </span>
      )}
      {compact ? (
        <span className="flex min-w-0 items-baseline gap-1.5">
          <span className="text-foreground truncate text-sm">{option.label}</span>
          {option.sub && (
            <span className="text-muted-foreground/70 truncate text-xs">{option.sub}</span>
          )}
        </span>
      ) : (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="text-foreground truncate text-sm font-medium">{option.label}</span>
          {option.sub && (
            <span className="text-muted-foreground truncate text-[11px]">{option.sub}</span>
          )}
        </span>
      )}
    </span>
  )
}
