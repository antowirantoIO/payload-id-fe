'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { DataTable } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { useMerchantDemo } from '../hooks/use-merchant-demo'
import { type MerchantStatus, transitions } from '../lib/model'
import { MerchantStatusDialog } from './merchant-status-dialog'

type Activity = { at: string; message: string }
const activityColumns: ColumnDef<Activity>[] = [
  { accessorKey: 'at', header: 'Time (UTC)', size: 240 },
  { accessorKey: 'message', header: 'Activity', size: 560 },
]
const tabs = ['Business profile', 'Settlement', 'Integration', 'Activity'] as const
type Tab = (typeof tabs)[number]

export function MerchantDetailPage({ merchantId }: { merchantId: string }) {
  const { rows } = useMerchantDemo()
  const merchant = rows.find((row) => row.id === merchantId)
  const [tab, setTab] = useState<Tab>('Business profile')
  const [target, setTarget] = useState<MerchantStatus | null>(null)
  const [copy, setCopy] = useState('Copy merchant code')
  if (!merchant)
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Merchant not found</h1>
        <p className="text-sm text-muted-foreground">The requested merchant could not be found.</p>
        <Link href="/merchants" className="text-primary underline">
          Back to merchants
        </Link>
      </div>
    )
  const fields: [string, string][] =
    tab === 'Business profile'
      ? [
          ['Merchant ID', merchant.id],
          ['Code', merchant.code],
          ['Business name', merchant.name],
          ['Legal name', merchant.legal_name],
          ['Tenant', merchant.tenant],
          ['Business type', merchant.business_type],
          ['Category', merchant.business_category],
          ['Tier', merchant.tier],
          ['Address', merchant.address],
          ['City', merchant.city],
          ['Province', merchant.province],
          ['Postal code', merchant.postal_code],
          ['NPWP', merchant.npwp],
          ['NIB', merchant.nib],
          ['Website', merchant.website],
          ['Created (UTC)', merchant.created_at],
          ['Updated (UTC)', merchant.updated_at],
        ]
      : tab === 'Settlement'
        ? [
            ['Settlement mode', merchant.settlement_mode],
            ['Schedule', merchant.settlement_schedule],
          ]
        : [
            ['Environment', merchant.is_sandbox ? 'Sandbox' : 'Production'],
            ['Production callback URL', merchant.callback_url],
            ['Sandbox callback URL', merchant.callback_url_sandbox],
            ['IP whitelist', merchant.ip_whitelist],
          ]
  return (
    <div className="space-y-6">
      <Link href="/merchants" className="text-sm text-primary underline">
        Back to merchants
      </Link>
      <header className="space-y-5 rounded-md border bg-card p-4 sm:p-6">
        <div className="flex flex-wrap justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              {merchant.code} · {merchant.tenant}
            </p>
            <h1 className="mt-1 break-words text-2xl font-semibold tracking-tight">
              {merchant.name}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-sm border bg-muted px-2 py-1">
                {merchant.status.replaceAll('_', ' ')}
              </span>
              <span className="rounded-sm border px-2 py-1">{merchant.tier}</span>
              <span className="rounded-sm border px-2 py-1">
                {merchant.is_sandbox ? 'Sandbox' : 'Production'}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(merchant.code)
                  setCopy('Copied')
                } catch {
                  setCopy('Copy failed')
                }
              }}
            >
              {copy}
            </Button>
            <Link
              href={`/merchants/${merchant.id}/edit`}
              className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground focus-visible:outline-2 focus-visible:outline-ring"
            >
              Edit merchant
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t pt-4">
          <span className="mr-2 text-sm text-muted-foreground">Lifecycle actions</span>
          {transitions[merchant.status].length ? (
            transitions[merchant.status].map((status) => (
              <Button
                key={status}
                variant={['REJECTED', 'TERMINATED'].includes(status) ? 'destructive' : 'outline'}
                onClick={() => setTarget(status)}
              >
                {status.replaceAll('_', ' ')}
              </Button>
            ))
          ) : (
            <span className="text-sm">No further transitions available.</span>
          )}
        </div>
      </header>
      <div
        role="tablist"
        aria-label="Merchant domains"
        className="flex gap-2 overflow-x-auto border-b pb-2"
        onKeyDown={(event) => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
          event.preventDefault()
          const index = tabs.indexOf(tab)
          const next =
            event.key === 'Home'
              ? 0
              : event.key === 'End'
                ? tabs.length - 1
                : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
          setTab(tabs[next])
          document.getElementById(`merchant-tab-${next}`)?.focus()
        }}
      >
        {tabs.map((item, index) => (
          <Button
            key={item}
            id={`merchant-tab-${index}`}
            role="tab"
            aria-selected={tab === item}
            aria-controls="merchant-domain-panel"
            tabIndex={tab === item ? 0 : -1}
            variant={tab === item ? 'secondary' : 'ghost'}
            onClick={() => setTab(item)}
          >
            {item}
          </Button>
        ))}
      </div>
      <section
        id="merchant-domain-panel"
        role="tabpanel"
        aria-labelledby={`merchant-tab-${tabs.indexOf(tab)}`}
        className="space-y-5"
      >
        <h2 className="text-lg font-semibold">{tab}</h2>
        {tab === 'Activity' ? (
          <DataTable
            columns={activityColumns}
            data={merchant.history.toReversed()}
            getRowId={(row) => `${row.at}-${row.message}`}
            emptyMessage="No activity yet."
          />
        ) : (
          <div className="rounded-md border bg-card p-4 sm:p-6">
            <dl className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {fields.map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-1 break-words text-sm">{value || 'Not provided'}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </section>
      {target && (
        <MerchantStatusDialog
          ids={[merchant.id]}
          status={target}
          onClose={() => setTarget(null)}
          onComplete={() => setTarget(null)}
        />
      )}
    </div>
  )
}
