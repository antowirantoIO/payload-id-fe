'use client'

import {
  CalendarIcon,
  CircleCheckIcon,
  FilterIcon,
  HashIcon,
  ListIcon,
  TagIcon,
  TypeIcon,
} from 'lucide-react'
import type { FieldConfig, FilterFieldType } from './lib/types'

const FIELD_TYPE_ICON: Record<FilterFieldType, React.ComponentType<{ className?: string }>> = {
  text: TypeIcon,
  number: HashIcon,
  date: CalendarIcon,
  enum: ListIcon,
  boolean: CircleCheckIcon,
  tags: TagIcon,
}

export function FieldTypeIcon({ type, className }: { type: FilterFieldType; className?: string }) {
  const Icon = FIELD_TYPE_ICON[type]
  return <Icon className={className} />
}

export function getFieldLabel(fieldsConfig: ReadonlyArray<FieldConfig>, id: string): string {
  return fieldsConfig.find((f) => f.id === id)?.label ?? id
}

export { FilterIcon }
