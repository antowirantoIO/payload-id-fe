import { describe, expect, it } from 'vitest'
import {
  emptyChannel,
  filterChannels,
  makeChannels,
  saveChannel,
  transitionChannel,
  validateChannel,
} from './model'

const at = '2026-11-22T00:00:00.000Z'
describe('channel local actions', () => {
  it('requires valid fields and rejects case-insensitive duplicate codes including archives', () => {
    const rows = makeChannels()
    expect(
      validateChannel({ ...emptyChannel(), code: 'new_channel', name: 'New' }, rows).valid,
    ).toBe(true)
    expect(
      validateChannel({ ...emptyChannel(), code: rows[0].code.toLowerCase(), name: 'Other' }, rows)
        .error,
    ).toBe('duplicate')
    expect(validateChannel({ ...emptyChannel(), code: 'x', name: '' }, rows).valid).toBe(false)
    expect(
      validateChannel({ ...emptyChannel(), code: 'NEW', name: 'New', currency: 'IDR, USD' }, rows)
        .valid,
    ).toBe(false)
  })
  it('archives and restores without changing the domain status', () => {
    const rows = makeChannels()
    const archived = transitionChannel(rows, rows[0].id, 'archive', at)
    expect(filterChannels(archived, '')).toHaveLength(rows.length - 1)
    expect(filterChannels(archived, '', true)).toHaveLength(rows.length)
    expect(archived[0].status).toBe(rows[0].status)
    expect(transitionChannel(archived, rows[0].id, 'restore', at)[0].deleted_at).toBeNull()
  })
  it('preserves immutable code and blocks editing archived records', () => {
    const rows = makeChannels()
    const result = saveChannel(
      rows,
      { ...rows[0], code: 'OTHER', name: 'Changed' },
      rows[0].id,
      'unused',
      at,
    )
    expect(result.rows[0].code).toBe(rows[0].code)
    expect(result.rows[0].name).toBe('Changed')
    const archived = transitionChannel(rows, rows[0].id, 'archive', at)
    expect(saveChannel(archived, { ...rows[0], name: 'No' }, rows[0].id, 'unused', at).error).toBe(
      'unavailable',
    )
  })
})
