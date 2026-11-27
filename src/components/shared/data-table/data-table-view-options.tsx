'use client'

import type { Table } from '@tanstack/react-table'
import {
  ArrowLeftToLineIcon,
  ArrowRightToLineIcon,
  Columns3Icon,
  PinIcon,
  PinOffIcon,
  SlidersHorizontalIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

type Density = 'compact' | 'normal' | 'comfortable'

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
  /** Density toggle (controlled). Pasang kalau parent simpan state-nya. */
  density?: Density
  onDensityChange?: (density: Density) => void
  /** Show column pinning submenu (column → pin left/right/none). Butuh `enableColumnPinning` di DataTable. */
  enableColumnPinning?: boolean
}

/**
 * Column visibility + density + pinning controls. Semua optional — kalau prop
 * tidak di-pass, section-nya tidak render.
 */
export function DataTableViewOptions<TData>({
  table,
  density,
  onDensityChange,
  enableColumnPinning,
}: DataTableViewOptionsProps<TData>) {
  const t = useTranslations('table')
  const columns = table.getAllLeafColumns().filter((col) => col.getCanHide())

  if (columns.length === 0 && !onDensityChange) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm">
            <SlidersHorizontalIcon className="size-3.5" />
            {t('view')}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        {/* Density */}
        {onDensityChange && (
          <>
            <DropdownMenuRadioGroup
              value={density ?? 'normal'}
              onValueChange={(v) => onDensityChange(v as Density)}
            >
              <DropdownMenuLabel>{t('density')}</DropdownMenuLabel>
              <DropdownMenuRadioItem value="compact" className="text-xs">
                {t('compact')}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="normal" className="text-xs">
                {t('normal')}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="comfortable" className="text-xs">
                {t('comfortable')}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            {columns.length > 0 && <DropdownMenuSeparator />}
          </>
        )}

        {/* Column visibility */}
        {columns.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <span className="inline-flex items-center gap-1.5">
                <Columns3Icon className="size-3.5" />
                {t('toggleColumns')}
              </span>
            </DropdownMenuLabel>
            {columns.map((col) => {
              const header = col.columnDef.meta?.label ?? col.id
              const pinned = col.getIsPinned()
              return (
                <div key={col.id} className="flex items-center gap-0.5 pr-1">
                  <DropdownMenuCheckboxItem
                    checked={col.getIsVisible()}
                    onCheckedChange={(checked) => col.toggleVisibility(Boolean(checked))}
                    className="flex-1 text-xs capitalize"
                  >
                    {header}
                  </DropdownMenuCheckboxItem>
                  {enableColumnPinning && col.getCanPin() && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger
                        className="size-7 shrink-0 justify-center px-0"
                        aria-label={t('pin', { column: String(header) })}
                      >
                        <PinIcon
                          className={cn(
                            'size-3.5',
                            pinned ? 'text-primary fill-primary/20' : 'text-muted-foreground/50',
                          )}
                        />
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-40">
                        <DropdownMenuItem
                          onSelect={() => col.pin('left')}
                          disabled={pinned === 'left'}
                          className="text-xs"
                        >
                          <ArrowLeftToLineIcon className="size-3.5" />
                          {t('pinLeft')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => col.pin('right')}
                          disabled={pinned === 'right'}
                          className="text-xs"
                        >
                          <ArrowRightToLineIcon className="size-3.5" />
                          {t('pinRight')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => col.pin(false)}
                          disabled={!pinned}
                          className="text-xs"
                        >
                          <PinOffIcon className="size-3.5" />
                          {t('unpin')}
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  )}
                </div>
              )
            })}
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
