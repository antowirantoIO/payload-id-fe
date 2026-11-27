import type { Payout } from '../contracts'
import { maskAccountNumber } from './model'

const formulaPrefix = /^[=+\-@]/
function csvCell(value: unknown) {
  const text = String(value ?? '')
  const safe = formulaPrefix.test(text) ? `'${text}` : text
  return /[",\n\r]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe
}

export const payoutCsvHeaders = [
  'id',
  'external_id',
  'status',
  'amount',
  'currency',
  'merchant',
  'destination_bank',
  'destination_account',
  'verified',
  'environment',
  'created_at',
] as const
export function payoutToCsvRow(payout: Payout) {
  return [
    payout.id,
    payout.external_id,
    payout.status,
    payout.amount,
    payout.currency,
    payout.merchant?.name,
    payout.payout_detail.destination_bank_name ?? payout.payout_detail.destination_bank_code,
    maskAccountNumber(payout.payout_detail.destination_account_number),
    payout.payout_detail.destination_account_verified,
    payout.environment,
    payout.created_at,
  ]
}
export function exportPayoutsCsv(rows: Payout[]) {
  return `﻿${[payoutCsvHeaders, ...rows.map(payoutToCsvRow)].map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`
}
