import type { Channel } from '../contracts'

const cell = (value: unknown) => {
  const text = String(value ?? '')
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text
  return /[",\n\r]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe
}
export function exportChannels(rows: Channel[]) {
  const headers = [
    'id',
    'code',
    'name',
    'category',
    'direction',
    'currency',
    'status',
    'provider_code',
    'provider_name',
    'created_at',
    'updated_at',
  ]
  return `﻿${[headers, ...rows.map((row) => [row.id, row.code, row.name, row.category, row.direction, row.currency, row.status, row.provider_code, row.provider_name, row.created_at, row.updated_at])].map((row) => row.map(cell).join(',')).join('\r\n')}`
}
