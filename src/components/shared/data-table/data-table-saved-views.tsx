'use client'

import { CheckIcon, MoreHorizontalIcon, PinIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export interface SavedViewItem {
  id: string
  name: string
  is_default: boolean
}

interface DataTableSavedViewsProps {
  views: ReadonlyArray<SavedViewItem>
  /** ID view yg sedang aktif. null = "All" (state default, tidak match view manapun). */
  activeViewId: string | null
  isLoading?: boolean
  /** "Apply" — caller responsible untuk apply state ke URL. */
  onSelect: (view: SavedViewItem | null) => void
  onSaveNew: () => void
  onSetDefault: (view: SavedViewItem) => void
  onDelete: (view: SavedViewItem) => void
  /** Optional: indikasi current state mismatch dgn view aktif (ada filter berubah). */
  isDirty?: boolean
  onSaveCurrent?: () => void
  defaultViewLabel?: string
}

/**
 * Tab strip HubSpot-style. "All" + saved views + "+ New view" trigger.
 * Per-view 3-dot menu utk set default / delete.
 */
export function DataTableSavedViews({
  views,
  activeViewId,
  isLoading,
  onSelect,
  onSaveNew,
  onSetDefault,
  onDelete,
  isDirty,
  onSaveCurrent,
  defaultViewLabel,
}: DataTableSavedViewsProps) {
  const t = useTranslations('table')
  if (isLoading) {
    return (
      <div className="flex h-10 items-center gap-1 border-b border-border/60 px-1">
        <div className="bg-muted/60 h-7 w-20 animate-pulse rounded-md" />
        <div className="bg-muted/40 h-7 w-24 animate-pulse rounded-md" />
        <div className="bg-muted/40 h-7 w-20 animate-pulse rounded-md" />
      </div>
    )
  }

  return (
    <div className="border-border/60 relative flex items-center gap-1 border-b px-0.5">
      {/* All tab */}
      <Tab active={activeViewId === null} onClick={() => onSelect(null)}>
        {defaultViewLabel ?? t('all')}
      </Tab>

      {/* Saved views */}
      {views.map((view) => {
        const active = activeViewId === view.id
        return (
          <ViewTab
            key={view.id}
            view={view}
            active={active}
            onClick={() => onSelect(view)}
            onSetDefault={() => onSetDefault(view)}
            onDelete={() => onDelete(view)}
          />
        )
      })}

      {/* New view */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onSaveNew}
        className="text-muted-foreground hover:text-foreground ml-0.5 h-8 gap-1 px-2 text-xs"
      >
        <PlusIcon className="size-3.5" />
        {t('newView')}
      </Button>

      {/* Save changes (when dirty) */}
      {isDirty && onSaveCurrent && (
        <Button
          variant="outline"
          size="sm"
          onClick={onSaveCurrent}
          className="ml-auto h-8 gap-1 px-2.5 text-xs"
        >
          {t('saveChanges')}
        </Button>
      )}
    </div>
  )
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active}
      className={cn(
        'relative inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-[color,background-color] duration-150',
        active
          ? 'text-foreground'
          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
        active &&
          "after:absolute after:-bottom-px after:left-2 after:right-2 after:h-0.5 after:rounded-full after:bg-primary after:content-['']",
      )}
    >
      {children}
    </button>
  )
}

function ViewTab({
  view,
  active,
  onClick,
  onSetDefault,
  onDelete,
}: {
  view: SavedViewItem
  active: boolean
  onClick: () => void
  onSetDefault: () => void
  onDelete: () => void
}) {
  const t = useTranslations('table')
  return (
    <div
      data-active={active}
      className={cn(
        'group/tab relative inline-flex h-9 items-center rounded-md transition-[color,background-color] duration-150',
        active ? 'text-foreground' : 'text-muted-foreground hover:bg-muted/50',
        active &&
          "after:absolute after:-bottom-px after:left-2 after:right-2 after:h-0.5 after:rounded-full after:bg-primary after:content-['']",
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'inline-flex h-full items-center gap-1.5 pl-3 text-sm font-medium transition-colors',
          active ? 'text-foreground' : 'hover:text-foreground',
          // padding-right turun saat menu visible biar tidak terlalu lebar
          'pr-1.5',
        )}
      >
        {view.is_default && <PinIcon className="size-3 -rotate-45 text-warning" />}
        {view.name}
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className={cn(
                'mr-1 inline-flex size-6 items-center justify-center rounded transition-colors',
                'hover:bg-muted-foreground/10 hover:text-foreground',
                active
                  ? 'opacity-70 hover:opacity-100'
                  : 'opacity-0 group-hover/tab:opacity-100 focus-visible:opacity-100',
              )}
              aria-label={t('manageView', { name: view.name })}
            >
              <MoreHorizontalIcon className="size-3.5" />
            </button>
          }
        />
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={onSetDefault} disabled={view.is_default}>
            <CheckIcon className="size-3.5" />
            {t('setDefault')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={onDelete}
            variant="destructive"
            className="text-destructive data-[highlighted]:text-destructive"
          >
            <Trash2Icon className="size-3.5" />
            {t('delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
