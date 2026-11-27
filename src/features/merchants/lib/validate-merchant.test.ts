import { describe, expect, it } from 'vitest'
import { emptyMerchant } from './model'
import { validateMerchant } from './validate-merchant'

const valid = () => ({
  ...emptyMerchant(),
  code: ' STORE ',
  name: ' Store ',
  business_category: ' Retail ',
})
describe('merchant validation', () => {
  it('trims only code, name and category without mutating the draft', () => {
    const draft = {
      ...valid(),
      legal_name: ' Legal ',
      city: ' City ',
      tenant: ' Tenant ',
      website: 'https://example.com/path',
    }
    const result = validateMerchant(draft, emptyMerchant(), [])
    expect(result.merchant).toMatchObject({
      code: 'STORE',
      name: 'Store',
      business_category: 'Retail',
      legal_name: ' Legal ',
      city: ' City ',
      tenant: ' Tenant ',
      website: draft.website,
    })
    expect(draft.code).toBe(' STORE ')
  })
  it('reports required and case insensitive duplicate failures on the business step', () => {
    expect(validateMerchant(emptyMerchant(), emptyMerchant(), []).error).toEqual({
      key: 'required',
      step: 0,
    })
    expect(
      validateMerchant(valid(), emptyMerchant(), [{ ...valid(), id: 'other', code: 'store' }])
        .error,
    ).toEqual({ key: 'duplicate', step: 0 })
  })
  it('allows empty URLs and valid HTTPS URLs', () => {
    expect(validateMerchant(valid(), emptyMerchant(), []).error).toBeUndefined()
    expect(
      validateMerchant(
        {
          ...valid(),
          website: 'https://example.com',
          callback_url: 'https://example.com/callback',
          callback_url_sandbox: 'https://sandbox.example.com',
        },
        emptyMerchant(),
        [],
      ).error,
    ).toBeUndefined()
  })
  it.each(['website', 'callback_url', 'callback_url_sandbox'] as const)(
    'reports the correct step for invalid %s',
    (field) => {
      for (const value of ['http://example.com', 'not a url', '   ', 'javascript:alert(1)']) {
        expect(validateMerchant({ ...valid(), [field]: value }, emptyMerchant(), []).error).toEqual(
          { key: 'https', step: field === 'website' ? 1 : 2, field },
        )
      }
    },
  )
  it('keeps edit code and tenant immutable and excludes the edited record from duplicate checking', () => {
    const initial = { ...valid(), id: 'existing', code: 'ORIGINAL', tenant: 'Platform' }
    const result = validateMerchant({ ...initial, code: 'CHANGED', tenant: 'Other' }, initial, [
      initial,
    ])
    expect(result.merchant).toMatchObject({ code: 'ORIGINAL', tenant: 'Platform' })
  })
})
