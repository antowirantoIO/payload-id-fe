'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { MerchantRecord } from '../contracts'
import {
  changeMerchantStatus,
  createMerchant,
  getMerchant,
  getMerchantActivity,
  listMerchants,
  listTenants,
  updateMerchant,
} from '../lib/api'
import type { Merchant, MerchantStatus } from '../lib/model'

const PAGE_SIZE = 100
const MAX_PAGES = 20

/** The API paginates; the table filters and sorts client-side. */
async function fetchAllMerchants(): Promise<MerchantRecord[]> {
  const all: MerchantRecord[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const result = await listMerchants({ page, per_page: PAGE_SIZE })
    all.push(...result.items)
    if (!result.pagination.has_next) break
  }
  return all
}

export function toMerchant(row: MerchantRecord): Merchant {
  return {
    id: row.id,
    tenant: row.tenant?.name ?? '',
    tenant_id: row.tenant?.id ?? '',
    code: row.code,
    name: row.name,
    legal_name: row.legal_name ?? '',
    business_type: row.business_type,
    business_category: row.business_category,
    status: row.status,
    tier: row.tier,
    address: row.address ?? '',
    city: row.city ?? '',
    province: row.province ?? '',
    postal_code: row.postal_code ?? '',
    npwp: row.npwp ?? '',
    nib: row.nib ?? '',
    website: row.website ?? '',
    settlement_mode: row.settlement_mode,
    settlement_schedule: row.settlement_schedule,
    callback_url: row.callback_url ?? '',
    callback_url_sandbox: row.callback_url_sandbox ?? '',
    ip_whitelist: (row.ip_whitelist ?? []).join(', '),
    is_sandbox: row.is_sandbox,
    created_at: row.created_at,
    updated_at: row.updated_at,
    history: [],
  }
}

function toWritePayload(merchant: Merchant) {
  return {
    tenant_id: merchant.tenant_id || undefined,
    code: merchant.code || undefined,
    name: merchant.name,
    legal_name: merchant.legal_name || null,
    business_type: merchant.business_type,
    business_category: merchant.business_category,
    tier: merchant.tier,
    address: merchant.address || null,
    city: merchant.city || null,
    province: merchant.province || null,
    postal_code: merchant.postal_code || null,
    npwp: merchant.npwp || null,
    nib: merchant.nib || null,
    website: merchant.website || null,
    settlement_mode: merchant.settlement_mode,
    settlement_schedule: merchant.settlement_schedule,
    callback_url: merchant.callback_url || null,
    callback_url_sandbox: merchant.callback_url_sandbox || null,
    ip_whitelist: merchant.ip_whitelist
      ? merchant.ip_whitelist
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)
      : [],
  }
}

export function useMerchants() {
  return useQuery({
    queryKey: ['iam', 'merchants'],
    queryFn: fetchAllMerchants,
    select: (rows) => rows.map(toMerchant),
    retry: false,
  })
}

export function useMerchant(id: string) {
  return useQuery({
    queryKey: ['iam', 'merchant', id],
    queryFn: () => getMerchant(id),
    enabled: Boolean(id),
    retry: false,
  })
}

export function useMerchantActivity(id: string) {
  return useQuery({
    queryKey: ['iam', 'merchant', id, 'activity'],
    queryFn: () => getMerchantActivity(id),
    enabled: Boolean(id),
    retry: false,
  })
}

export function useTenants() {
  return useQuery({
    queryKey: ['iam', 'tenants'],
    queryFn: () => listTenants(),
    staleTime: 5 * 60_000,
    retry: false,
  })
}

export function useSaveMerchant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ merchant, id }: { merchant: Merchant; id?: string }) => {
      const payload = toWritePayload(merchant)
      return id ? updateMerchant(id, payload) : createMerchant(payload)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['iam', 'merchants'] })
    },
  })
}

export function useChangeMerchantStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      ids,
      status,
      reason,
    }: {
      ids: string[]
      status: MerchantStatus
      reason: string
    }) => {
      for (const id of ids) {
        await changeMerchantStatus(id, status, reason)
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['iam', 'merchants'] })
      void queryClient.invalidateQueries({ queryKey: ['iam', 'merchant'] })
    },
  })
}
