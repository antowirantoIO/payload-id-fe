'use client'

import { parseAsString, useQueryStates } from 'nuqs'
import { useMemo } from 'react'
import {
  type CompareMode,
  type DatePresetId,
  type ResolvedRange,
  resolvePeriod,
} from '../lib/period'

const parsers = {
  preset: parseAsString.withDefault('last_30d'),
  from: parseAsString.withDefault(''),
  to: parseAsString.withDefault(''),
  compare: parseAsString.withDefault('none'),
}

export function useDateRange() {
  const [raw, setRaw] = useQueryStates(parsers, { shallow: false })
  const resolved: ResolvedRange = useMemo(() => resolvePeriod(raw), [raw])

  return {
    raw,
    resolved,
    setPreset(preset: DatePresetId) {
      if (preset !== 'custom') setRaw({ preset, from: '', to: '' })
    },
    setCustomRange(from: Date, to: Date) {
      setRaw({
        preset: 'custom',
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0],
      })
    },
    setCompare(compare: CompareMode) {
      setRaw({ compare })
    },
  }
}
