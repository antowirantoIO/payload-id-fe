import {
  endOfDay,
  endOfMonth,
  endOfQuarter,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from 'date-fns'

export type DatePresetId =
  'today' | 'last_7d' | 'last_30d' | 'last_90d' | 'mtd' | 'qtd' | 'ytd' | 'custom'

export type CompareMode = 'previous_period' | 'previous_year' | 'none'

export interface DatePreset {
  id: DatePresetId
  label: string
  resolve: (now?: Date) => { from: Date; to: Date }
}

export const DATE_PRESETS: ReadonlyArray<DatePreset> = [
  {
    id: 'today',
    label: 'Today',
    resolve: (now = new Date()) => ({ from: startOfDay(now), to: endOfDay(now) }),
  },
  {
    id: 'last_7d',
    label: 'Last 7 days',
    resolve: (now = new Date()) => ({ from: startOfDay(subDays(now, 6)), to: endOfDay(now) }),
  },
  {
    id: 'last_30d',
    label: 'Last 30 days',
    resolve: (now = new Date()) => ({ from: startOfDay(subDays(now, 29)), to: endOfDay(now) }),
  },
  {
    id: 'last_90d',
    label: 'Last 90 days',
    resolve: (now = new Date()) => ({ from: startOfDay(subDays(now, 89)), to: endOfDay(now) }),
  },
  {
    id: 'mtd',
    label: 'Month to date',
    resolve: (now = new Date()) => ({ from: startOfMonth(now), to: endOfDay(now) }),
  },
  {
    id: 'qtd',
    label: 'Quarter to date',
    resolve: (now = new Date()) => ({ from: startOfQuarter(now), to: endOfDay(now) }),
  },
  {
    id: 'ytd',
    label: 'Year to date',
    resolve: (now = new Date()) => ({ from: startOfYear(now), to: endOfDay(now) }),
  },
] as const

const PRESET_BY_ID = new Map(DATE_PRESETS.map((preset) => [preset.id, preset]))

export interface ResolvedRange {
  from: Date
  to: Date
  preset: DatePresetId
  compare: CompareMode
  prevFrom: Date | null
  prevTo: Date | null
  label: string
  prevLabel: string | null
}

export function resolvePeriod(input: {
  preset?: string | null
  from?: string | null
  to?: string | null
  compare?: string | null
  now?: Date
}): ResolvedRange {
  const now = input.now ?? new Date()
  const compare: CompareMode =
    input.compare === 'previous_period' || input.compare === 'previous_year'
      ? input.compare
      : 'none'

  let from: Date
  let to: Date
  let preset: DatePresetId

  if (input.preset === 'custom' && input.from && input.to) {
    from = startOfDay(new Date(input.from))
    to = endOfDay(new Date(input.to))
    preset = 'custom'
  } else {
    const found = input.preset ? PRESET_BY_ID.get(input.preset as DatePresetId) : undefined
    const fallback = PRESET_BY_ID.get('last_30d')!
    const resolver = found ?? fallback
    const range = resolver.resolve(now)
    from = range.from
    to = range.to
    preset = resolver.id
  }

  let prevFrom: Date | null = null
  let prevTo: Date | null = null
  let prevLabel: string | null = null

  if (compare === 'previous_period') {
    const span = to.getTime() - from.getTime()
    prevTo = new Date(from.getTime() - 1)
    prevFrom = new Date(prevTo.getTime() - span)
    prevLabel = `vs ${formatRangeShort(prevFrom, prevTo)}`
  } else if (compare === 'previous_year') {
    prevFrom = subYears(from, 1)
    prevTo = subYears(to, 1)
    prevLabel = `vs ${formatRangeShort(prevFrom, prevTo)}`
  }

  return {
    from,
    to,
    preset,
    compare,
    prevFrom,
    prevTo,
    label: formatRangeShort(from, to),
    prevLabel,
  }
}

export function formatRangeShort(from: Date, to: Date): string {
  const sameYear = from.getFullYear() === to.getFullYear()
  const sameMonth = sameYear && from.getMonth() === to.getMonth()
  const sameDay = sameMonth && from.getDate() === to.getDate()
  const format = (date: Date, withYear: boolean) =>
    date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      ...(withYear ? { year: 'numeric' } : {}),
    })

  if (sameDay) return format(from, true)
  if (sameYear) return `${format(from, false)} – ${format(to, true)}`
  return `${format(from, true)} – ${format(to, true)}`
}

export function toIsoBounds(range: { from: Date; to: Date }) {
  return { from_iso: range.from.toISOString(), to_iso: range.to.toISOString() }
}

export function autoGrain(from: Date, to: Date): 'day' | 'week' | 'month' {
  const days = (to.getTime() - from.getTime()) / 86_400_000
  if (days <= 31) return 'day'
  if (days <= 120) return 'week'
  return 'month'
}

export function deltaPercent(current: number, previous: number | null | undefined): number | null {
  if (previous == null || previous === 0) return null
  return ((current - previous) / previous) * 100
}

void endOfMonth
void endOfQuarter
void endOfYear
void subMonths
