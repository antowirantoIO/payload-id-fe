'use client'

/**
 * Unified Picker — single primitive untuk semua dropdown di app.
 *
 * Menggantikan:
 * - <Select> untuk enum kecil (lifecycle, status, seniority, source, sort)
 * - <RelationCombobox> untuk relation besar (owner, company, role)
 *
 * Features:
 * - Auto-show search kalau options > SEARCH_THRESHOLD (default 8)
 * - Support dotColor, icon, sub line, initials/avatar
 * - Trigger visual konsisten (h-8, rounded-lg, focus ring) — sama dgn Input
 * - Nullable: pass nullable + placeholder utk "Unassigned"/"None"
 * - Keyboard nav, empty state, clear search
 *
 * Usage:
 *   <Picker
 *     options={LIFECYCLE_STAGES.map(s => ({ value: s.value, label: s.label, dotColor: s.color }))}
 *     value={field.value}
 *     onChange={field.onChange}
 *     placeholder="Select stage"
 *   />
 */

import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox'
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from 'lucide-react'
import type * as React from 'react'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface PickerOption {
  value: string
  label: string
  /** Secondary line (email, domain, description). */
  sub?: string | null
  /** 1-2 char initials for avatar circle. Auto-generated from label if omitted. */
  initials?: string
  /** Colored dot instead of avatar (for enum statuses, roles, etc.). Pass hex color. */
  dotColor?: string | null
  /** Optional icon element rendered before label (for enum categories). */
  icon?: React.ReactNode
  /** Disable this option. */
  disabled?: boolean
}

interface PickerProps {
  options: ReadonlyArray<PickerOption>
  value: string | null | undefined
  onChange: (value: string | null) => void
  /** Placeholder shown when no value selected. */
  placeholder?: React.ReactNode
  /** Label shown in trigger when value is null (overrides placeholder for "empty = valid" states). */
  emptyLabel?: React.ReactNode
  /** Empty state message when search yields nothing. */
  emptyMessage?: string
  /** Force search visibility. Default: auto (>SEARCH_THRESHOLD). */
  searchable?: boolean
  /** Threshold for auto-showing search. Default: 8. */
  searchThreshold?: number
  disabled?: boolean
  className?: string
  /** Leading icon in trigger when empty (e.g. UserIcon). */
  leadingIcon?: React.ReactNode
  /** Allow clearing value back to null. Shows X in trigger. Default: true when placeholder exists. */
  clearable?: boolean
}

const SEARCH_THRESHOLD = 8

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export function Picker({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  emptyLabel,
  emptyMessage = 'No matches.',
  searchable,
  searchThreshold = SEARCH_THRESHOLD,
  disabled,
  className,
  leadingIcon,
  clearable,
}: PickerProps) {
  const showSearch = searchable ?? options.length > searchThreshold
  const selected = useMemo(() => options.find((o) => o.value === value) ?? null, [options, value])
  const canClear = clearable ?? (selected !== null && (!!placeholder || !!emptyLabel))

  const [inputValue, setInputValue] = useState('')
  const filteredOptions = useMemo(() => {
    if (!inputValue.trim()) return options
    const q = inputValue.toLowerCase()
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.sub?.toLowerCase().includes(q),
    )
  }, [options, inputValue])

  return (
    <div className="grid w-full">
      <ComboboxPrimitive.Root<string, false>
        value={value ?? ''}
        onValueChange={(v) => {
          onChange(v || null)
          setInputValue('')
        }}
        inputValue={inputValue}
        onInputValueChange={(v) => setInputValue(v)}
      >
        {/* Trigger */}
        <ComboboxPrimitive.Trigger
          disabled={disabled}
          className={cn(
            'flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-2.5 py-1 text-sm shadow-xs transition-[color,box-shadow,border-color] outline-none',
            'h-8 min-h-8',
            'hover:border-border focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'data-popup-open:border-ring data-popup-open:ring-3 data-popup-open:ring-ring/30',
            'dark:bg-input/30 dark:hover:bg-input/50',
            '[&_svg]:pointer-events-none [&_svg]:shrink-0',
            className,
          )}
        >
          <span className="flex min-w-0 flex-1 items-center text-left">
            {selected ? (
              <OptionLine option={selected} compact />
            ) : (
              <span className="text-muted-foreground inline-flex items-center gap-2">
                {leadingIcon}
                {emptyLabel ?? placeholder}
              </span>
            )}
          </span>
          <span className="flex shrink-0 items-center gap-0.5">
            {canClear && selected && (
              <button
                type="button"
                aria-label="Clear"
                className="text-muted-foreground hover:text-foreground inline-flex size-5 items-center justify-center rounded-sm transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(null)
                }}
                onPointerDown={(e) => e.preventDefault()}
              >
                <XIcon className="size-3" />
              </button>
            )}
            <ComboboxPrimitive.Icon
              render={<ChevronDownIcon className="size-4 text-muted-foreground" />}
            />
          </span>
        </ComboboxPrimitive.Trigger>

        {/* Popup */}
        <ComboboxPrimitive.Portal>
          <ComboboxPrimitive.Positioner
            side="bottom"
            align="start"
            sideOffset={6}
            className="isolate z-50"
          >
            <ComboboxPrimitive.Popup
              className={cn(
                'bg-popover text-popover-foreground origin-(--transform-origin) overflow-hidden rounded-xl border border-border/60 shadow-xl outline-none',
                'min-w-(--anchor-width) max-w-[min(calc(100vw-2rem),28rem)]',
                'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.98]',
                'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
              )}
            >
              {/* Search Input */}
              {showSearch && (
                <div className="relative border-b border-border/60">
                  <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
                  <ComboboxPrimitive.Input
                    placeholder="Search…"
                    className="placeholder:text-muted-foreground/60 h-9 w-full bg-transparent pl-9 pr-3 text-sm outline-none"
                  />
                </div>
              )}
              {!showSearch && (
                <ComboboxPrimitive.Input className="sr-only" tabIndex={-1} aria-hidden />
              )}

              {/* List */}
              <ComboboxPrimitive.List className="max-h-72 overflow-y-auto overscroll-contain p-1">
                {filteredOptions.length === 0 ? (
                  <div className="text-muted-foreground px-3 py-6 text-center text-xs">
                    {emptyMessage}
                  </div>
                ) : (
                  filteredOptions.map((opt) => (
                    <ComboboxPrimitive.Item
                      key={opt.value}
                      value={opt.value}
                      disabled={opt.disabled}
                      className={cn(
                        'relative flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden select-none transition-colors',
                        'data-highlighted:bg-accent data-highlighted:text-accent-foreground',
                        'data-disabled:pointer-events-none data-disabled:opacity-50',
                      )}
                    >
                      <span className="flex min-w-0 flex-1 items-center gap-2">
                        <OptionLine option={opt} />
                      </span>
                      <ComboboxPrimitive.ItemIndicator
                        render={<CheckIcon className="text-primary size-3.5 shrink-0" />}
                      />
                    </ComboboxPrimitive.Item>
                  ))
                )}
              </ComboboxPrimitive.List>
            </ComboboxPrimitive.Popup>
          </ComboboxPrimitive.Positioner>
        </ComboboxPrimitive.Portal>
      </ComboboxPrimitive.Root>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Option Line — renders icon/dot/avatar + label + sub                        */
/* -------------------------------------------------------------------------- */

function OptionLine({ option, compact = false }: { option: PickerOption; compact?: boolean }) {
  const hasLeading = !!(option.dotColor || option.icon || option.sub || option.initials)
  const initials = option.initials ?? autoInitials(option.label)

  return (
    <span className="flex min-w-0 items-center gap-2">
      {/* Leading visual */}
      {option.dotColor ? (
        <span
          className={cn('shrink-0 rounded-full', compact ? 'size-2' : 'size-2.5')}
          style={{ backgroundColor: option.dotColor }}
          aria-hidden
        />
      ) : option.icon ? (
        <span
          className="text-muted-foreground/70 flex size-4 shrink-0 items-center justify-center"
          aria-hidden
        >
          {option.icon}
        </span>
      ) : hasLeading ? (
        <span
          className={cn(
            'bg-gradient-to-br from-muted to-muted/60 text-muted-foreground inline-flex shrink-0 items-center justify-center rounded-full font-medium',
            compact ? 'size-5 text-[9px]' : 'size-6 text-[10px]',
          )}
          aria-hidden
        >
          {initials}
        </span>
      ) : null}

      {/* Text */}
      {compact ? (
        <span className="flex min-w-0 items-baseline gap-1.5">
          <span className="text-foreground truncate text-sm">{option.label}</span>
          {option.sub && (
            <span className="text-muted-foreground/70 truncate text-xs">{option.sub}</span>
          )}
        </span>
      ) : (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="text-foreground truncate text-sm">{option.label}</span>
          {option.sub && (
            <span className="text-muted-foreground truncate text-[11px]">{option.sub}</span>
          )}
        </span>
      )}
    </span>
  )
}
