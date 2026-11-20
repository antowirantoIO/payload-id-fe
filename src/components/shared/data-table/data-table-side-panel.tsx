'use client'

import type { ReactNode } from 'react'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface DataTableSidePanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  /** Optional header right-side slot (avatar, status badge, dll.). */
  headerExtra?: ReactNode
  children: ReactNode
  /** Footer slot (Save / Cancel buttons). */
  footer?: ReactNode
  /** Width preset. lg = max-w-lg (default), xl, 2xl, 3xl, 4xl. */
  size?: 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
}

const SIZE_CLASS = {
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-4xl',
} as const

/**
 * Standardize side panel structure: Header (title + description + close-x sudah
 * built-in dari Sheet) + Body (scrollable) + Footer (sticky di bawah). Caller
 * isi konten lewat children + footer slot.
 */
export function DataTableSidePanel({
  open,
  onOpenChange,
  title,
  description,
  headerExtra,
  children,
  footer,
  size = 'lg',
}: DataTableSidePanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={`w-full ${SIZE_CLASS[size]}`}>
        <SheetHeader className="pr-12">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <SheetTitle>{title}</SheetTitle>
              {description && <SheetDescription>{description}</SheetDescription>}
            </div>
            {headerExtra && <div className="shrink-0">{headerExtra}</div>}
          </div>
        </SheetHeader>

        <SheetBody>{children}</SheetBody>

        {footer && (
          <div className="bg-surface/50 border-border/60 border-t px-6 py-4">{footer}</div>
        )}
      </SheetContent>
    </Sheet>
  )
}
