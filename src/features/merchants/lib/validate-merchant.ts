import type { Merchant } from './model'

export type MerchantValidationError =
  | { key: 'required' | 'duplicate'; step: 0 }
  | { key: 'https'; step: 1 | 2; field: 'website' | 'callback_url' | 'callback_url_sandbox' }
export type MerchantValidationResult =
  { merchant: Merchant; error?: never } | { error: MerchantValidationError; merchant?: never }

/** Validate a draft without mutating it or normalizing unrelated business data. */
export function validateMerchant(
  draft: Merchant,
  initial: Merchant,
  existing: readonly Merchant[],
): MerchantValidationResult {
  const merchant = {
    ...draft,
    code: initial.id ? initial.code : draft.code.trim(),
    tenant: initial.id ? initial.tenant : draft.tenant,
    name: draft.name.trim(),
    business_category: draft.business_category.trim(),
  }
  if (!merchant.code || !merchant.name || !merchant.business_category)
    return { error: { key: 'required', step: 0 } }
  if (
    existing.some(
      (row) => row.id !== initial.id && row.code.toLowerCase() === merchant.code.toLowerCase(),
    )
  )
    return { error: { key: 'duplicate', step: 0 } }
  for (const field of ['website', 'callback_url', 'callback_url_sandbox'] as const) {
    if (!merchant[field]) continue
    try {
      if (new URL(merchant[field]).protocol !== 'https:') throw new Error('protocol')
    } catch {
      return { error: { key: 'https', step: field === 'website' ? 1 : 2, field } }
    }
  }
  return { merchant }
}
