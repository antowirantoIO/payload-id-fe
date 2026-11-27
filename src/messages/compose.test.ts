import { describe, expect, it } from 'vitest'
import { composeMessages, supportedLocales } from './compose'

function leafKeys(value: unknown, prefix = ''): string[] {
  if (typeof value === 'string') return [prefix]
  if (!value || typeof value !== 'object') throw new Error(`Invalid message at ${prefix}`)
  return Object.entries(value)
    .flatMap(([key, child]) => leafKeys(child, prefix ? `${prefix}.${key}` : key))
    .sort()
}

describe('composed application messages', () => {
  it('keeps nested runtime namespaces in parity for every supported locale', () => {
    const expected = leafKeys(composeMessages('en'))
    for (const locale of supportedLocales)
      expect(leafKeys(composeMessages(locale)), locale).toEqual(expected)
  })
})
