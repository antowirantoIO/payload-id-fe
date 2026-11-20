'use client'

/**
 * Combobox primitives — thin shadcn-style wrappers di atas Base UI Combobox.
 *
 * Pakai utk relation picker (Owner, Company) — searchable, single-select.
 * Trigger render bebas (lihat <RelationCombobox /> di bawah utk 2-line preset).
 *
 * Pattern: object-value items (`{ value, label, sub? }`) — Base UI auto-detect
 * `label`/`value` shape sehingga `itemToStringLabel` opsional.
 *
 *   <Combobox items={users} value={field.value} onValueChange={field.onChange}>
 *     <ComboboxTrigger placeholder="Pick owner">
 *       {(selected) => selected ? <UserLine user={selected} /> : null}
 *     </ComboboxTrigger>
 *     <ComboboxPopup>
 *       <ComboboxInput placeholder="Search…" />
 *       <ComboboxList>
 *         {(item) => (
 *           <ComboboxItem value={item.value} keywords={[item.label, item.sub]}>
 *             <UserLine user={item} />
 *           </ComboboxItem>
 *         )}
 *       </ComboboxList>
 *     </ComboboxPopup>
 *   </Combobox>
 */

import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox'
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from 'lucide-react'
import type * as React from 'react'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- */
/* Root + Portal                                                              */
/* -------------------------------------------------------------------------- */

interface ComboboxItemShape {
  value: string
  label: string
  /** Secondary line (email, domain, dsb.). */
  sub?: string | null
}

interface ComboboxProps<T extends ComboboxItemShape> extends Omit<
  ComboboxPrimitive.Root.Props<string, false>,
  'items' | 'children'
> {
  items?: ReadonlyArray<T>
  children: React.ReactNode
}

function Combobox<T extends ComboboxItemShape>({ items, children, ...props }: ComboboxProps<T>) {
  return (
    <ComboboxPrimitive.Root<string, false>
      items={items as ReadonlyArray<string> | undefined}
      itemToStringLabel={(v) => items?.find((i) => i.value === v)?.label ?? ''}
      {...props}
    >
      {children}
    </ComboboxPrimitive.Root>
  )
}

/* -------------------------------------------------------------------------- */
/* Trigger — render-prop friendly, accept selected item lookup                */
/* -------------------------------------------------------------------------- */

interface ComboboxTriggerProps {
  className?: string
  disabled?: boolean
  placeholder?: React.ReactNode
  /** Render selected representation; receives selected option or null. */
  children: React.ReactNode
}

function ComboboxTrigger({ className, placeholder, children, disabled }: ComboboxTriggerProps) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
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
        {children ?? <span className="text-muted-foreground">{placeholder}</span>}
      </span>
      <ComboboxPrimitive.Icon
        render={<ChevronDownIcon className="size-4 text-muted-foreground" />}
      />
    </ComboboxPrimitive.Trigger>
  )
}

/* -------------------------------------------------------------------------- */
/* Popup + Input + List + Item                                                */
/* -------------------------------------------------------------------------- */

function ComboboxPopup({
  className,
  children,
  side = 'bottom',
  align = 'start',
  sideOffset = 6,
}: {
  className?: string
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-popup"
          className={cn(
            'bg-popover text-popover-foreground origin-(--transform-origin) overflow-hidden rounded-xl border border-border/60 shadow-xl outline-none',
            'min-w-(--anchor-width) max-w-[min(calc(100vw-2rem),28rem)]',
            'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.98]',
            'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            className,
          )}
        >
          {children}
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

function ComboboxInput({
  placeholder = 'Search…',
  className,
}: {
  placeholder?: string
  className?: string
}) {
  return (
    <div className="relative border-b border-border/60">
      <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
      <ComboboxPrimitive.Input
        placeholder={placeholder}
        className={cn(
          'placeholder:text-muted-foreground/60 h-10 w-full bg-transparent pl-9 pr-9 text-sm outline-none',
          className,
        )}
      />
      <ComboboxPrimitive.Clear
        render={
          <button
            type="button"
            aria-label="Clear search"
            className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-1/2 right-2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded transition-colors"
          >
            <XIcon className="size-3.5" />
          </button>
        }
      />
    </div>
  )
}

function ComboboxList({
  className,
  children,
  emptyMessage = 'No matches.',
}: {
  className?: string
  children: React.ReactNode | ((item: ComboboxItemShape) => React.ReactNode)
  emptyMessage?: string
}) {
  return (
    <>
      <ComboboxPrimitive.Empty className="text-muted-foreground px-3 py-6 text-center text-xs">
        {emptyMessage}
      </ComboboxPrimitive.Empty>
      <ComboboxPrimitive.List
        className={cn('max-h-72 overflow-y-auto overscroll-contain p-1', className)}
      >
        {children}
      </ComboboxPrimitive.List>
    </>
  )
}

function ComboboxItem({
  className,
  children,
  value,
}: {
  className?: string
  children: React.ReactNode
  value: string
}) {
  return (
    <ComboboxPrimitive.Item
      value={value}
      className={cn(
        'relative flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden select-none',
        'data-highlighted:bg-accent data-highlighted:text-accent-foreground',
        'data-disabled:pointer-events-none data-disabled:opacity-50',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0',
        className,
      )}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2">{children}</span>
      <ComboboxPrimitive.ItemIndicator
        render={<CheckIcon className="text-foreground size-3.5" />}
      />
    </ComboboxPrimitive.Item>
  )
}

export {
  Combobox,
  ComboboxInput,
  ComboboxItem,
  type ComboboxItemShape,
  ComboboxList,
  ComboboxPopup,
  ComboboxTrigger,
}
