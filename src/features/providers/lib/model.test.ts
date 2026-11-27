import { describe, expect, it } from 'vitest'
import {
  filterProviders,
  healthTone,
  makeProviders,
  providerHost,
  statusTone,
  testProviderConnection,
  transitionProvider,
  updateProvider,
  validateProvider,
} from './model'

const at = '2026-11-22T00:00:00.000Z'
describe('provider local actions', () => {
  it('filters schema-aligned records without casting incompatible DTOs', () => {
    const rows = makeProviders()
    expect(rows).toHaveLength(5)
    expect(filterProviders(rows, 'nusantara')).toHaveLength(1)
    expect(filterProviders(rows, '', 'ACTIVE')).toHaveLength(3)
    expect(filterProviders(rows, '', '', 'DEGRADED')).toHaveLength(1)
    expect(healthTone('DOWN')).toBe('danger')
    expect(statusTone('MAINTENANCE')).toBe('warning')
    expect(providerHost('https://api.example.com/v1')).toBe('api.example.com')
  })
  it('validates required fields, duplicate codes, secret-bearing and non-HTTPS URLs', () => {
    const rows = makeProviders()
    const input = {
      code: 'NEW',
      name: 'New',
      base_url: 'https://provider.example',
      status: 'ACTIVE' as const,
    }
    expect(validateProvider(input, rows)).toEqual({})
    expect(validateProvider({ ...input, code: rows[0].code.toLowerCase() }, rows).code).toBe(
      'duplicateCode',
    )
    for (const base_url of [
      'http://provider.example',
      'https://user:secret@provider.example',
      'https://provider.example?token=secret',
    ])
      expect(validateProvider({ ...input, base_url }, rows).base_url).toBe('invalidUrl')
  })
  it('keeps identity immutable and restores without inventing a backend archive status', () => {
    const row = makeProviders()[0]
    const updated = updateProvider(
      row,
      { code: 'CHANGED', name: 'Changed', base_url: row.base_url, status: 'MAINTENANCE' },
      at,
    )
    expect(updated.code).toBe(row.code)
    const archived = transitionProvider(updated, 'delete', at)
    expect(archived.deleted_at).toBe(at)
    expect(archived.status).toBe('MAINTENANCE')
    expect(transitionProvider(archived, 'restore', at).deleted_at).toBeNull()
  })
  it('local configuration checks do not manufacture externally measured health', () => {
    const row = makeProviders()[0]
    expect(testProviderConnection(row)).toBe('valid')
    expect(testProviderConnection({ base_url: 'not-a-url' })).toBe('invalid')
    expect(row.health_checked_at).not.toBe(at)
  })
})
