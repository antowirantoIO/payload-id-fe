import type { Provider } from '../contracts'

function cell(value: unknown) {
  const text = String(value ?? '')
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text
  return /[",\n\r]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe
}
export function exportProviders(rows: Provider[]) {
  const headers = [
    'id',
    'code',
    'name',
    'status',
    'health_status',
    'base_url',
    'base_url_sandbox',
    'supported_currencies',
    'channel_count',
    'credential_keys',
    'created_at',
    'updated_at',
  ]
  return `﻿${[headers, ...rows.map((row) => [row.id, row.code, row.name, row.status, row.health_status, row.base_url, row.base_url_sandbox, row.supported_currencies.join('; '), row.channel_count, row.credential_keys.join('; '), row.created_at, row.updated_at])].map((row) => row.map(cell).join(',')).join('\r\n')}`
}
