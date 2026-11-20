'use client'

import { CalendarIcon, ChevronDownIcon } from 'lucide-react'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  type CompareMode,
  DATE_PRESETS,
  type DatePresetId,
  useDateRange,
} from '@/features/analytics/client'
import { cn } from '@/lib/utils'

const COMPARE_OPTIONS: ReadonlyArray<{ value: CompareMode; label: string }> = [
  { value: 'none', label: 'No comparison' },
  { value: 'previous_period', label: 'vs previous period' },
  { value: 'previous_year', label: 'vs previous year' },
]

interface DateRangePickerProps {
  /** When false, hides the comparison dropdown (reports that don't support comparison). */
  showComparison?: boolean
  className?: string
}

export function DateRangePicker({ showComparison = true, className }: DateRangePickerProps) {
  const { resolved, setPreset, setCustomRange, setCompare } = useDateRange()
  const [popoverOpen, setPopoverOpen] = useState(false)

  // Local state for the calendar — synced from URL on open.
  const [draft, setDraft] = useState<DateRange | undefined>({
    from: resolved.from,
    to: resolved.to,
  })

  function handlePresetClick(id: DatePresetId) {
    setPreset(id)
  }

  function handleApplyCustom() {
    if (draft?.from && draft?.to) {
      setCustomRange(draft.from, draft.to)
      setPopoverOpen(false)
    }
  }

  function handlePopoverChange(open: boolean) {
    if (open) setDraft({ from: resolved.from, to: resolved.to })
    setPopoverOpen(open)
  }

  return (
    <div
      className={cn('grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center', className)}
    >
      {/* Preset chips */}
      <Select
        value={resolved.preset === 'custom' ? null : resolved.preset}
        onValueChange={(value) => value && handlePresetClick(value as DatePresetId)}
      >
        <SelectTrigger className="w-full sm:hidden">
          <SelectValue placeholder="Custom date range" />
        </SelectTrigger>
        <SelectContent>
          {DATE_PRESETS.map((preset) => (
            <SelectItem key={preset.id} value={preset.id}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="hidden items-center gap-0.5 border border-border bg-muted/40 p-0.5 sm:inline-flex">
        {DATE_PRESETS.map((preset) => {
          const active = resolved.preset === preset.id
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetClick(preset.id)}
              aria-pressed={active}
              className={cn(
                'min-h-8 border-b-2 border-transparent px-2.5 py-1 text-xs font-medium transition-colors duration-150',
                active
                  ? 'border-primary bg-card text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {preset.label}
            </button>
          )
        })}
      </div>

      {/* Custom range trigger */}
      <Popover open={popoverOpen} onOpenChange={handlePopoverChange}>
        <PopoverTrigger
          render={
            <Button
              variant={resolved.preset === 'custom' ? 'default' : 'outline'}
              size="sm"
              className="w-full justify-between gap-1.5 sm:w-auto"
            />
          }
        >
          <CalendarIcon className="size-3.5" />
          <span className="tabular-nums">{resolved.label}</span>
          <ChevronDownIcon className="size-3" />
        </PopoverTrigger>
        <PopoverContent className="w-[calc(100vw-2rem)] max-w-fit p-0" align="end">
          <Calendar
            mode="range"
            selected={draft}
            onSelect={setDraft}
            numberOfMonths={1}
            disabled={{ after: new Date() }}
            defaultMonth={resolved.from}
          />
          <div className="border-border/60 bg-surface/50 flex items-center justify-end gap-2 border-t px-3 py-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setDraft({ from: resolved.from, to: resolved.to })
                setPopoverOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleApplyCustom} disabled={!draft?.from || !draft?.to}>
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Compare mode */}
      {showComparison && (
        <Select value={resolved.compare} onValueChange={(v) => setCompare(v as CompareMode)}>
          <SelectTrigger className="h-8 w-full text-xs sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COMPARE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
