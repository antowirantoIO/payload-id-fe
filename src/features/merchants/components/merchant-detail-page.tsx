'use client'

import type { ColumnDef } from '@tanstack/react-table'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Copy,
  FileText,
  Fingerprint,
  Globe,
  History,
  MapPin,
  Settings2,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { DataTable } from '@/components/shared/data-table'
import { RecordSection } from '@/components/shared/record-section'
import { SemanticStatus, type StatusTone } from '@/components/shared/semantic-status'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link } from '@/i18n/navigation'
import { useMerchant, useMerchantActivity, toMerchant } from '../hooks/use-merchants'
import { type MerchantStatus, transitions } from '../lib/model'
import { MerchantDetailSection } from './merchant-detail-section'
import { MerchantNotFound } from './merchant-not-found'
import { MerchantStatusDialog } from './merchant-status-dialog'

type Activity = { at: string; message: string }
const tabs = [
  { value: 'business', icon: Building2 },
  { value: 'settlement', icon: Wallet },
  { value: 'integration', icon: Globe },
  { value: 'activity', icon: History },
] as const

export function MerchantDetailPage({ merchantId }: { merchantId: string }) {
  const t = useTranslations('merchants')
  const locale = useLocale()
  const merchantQuery = useMerchant(merchantId)
  const activityQuery = useMerchantActivity(merchantId)
  const merchant = merchantQuery.data ? toMerchant(merchantQuery.data) : undefined
  const [target, setTarget] = useState<MerchantStatus | null>(null)
  const [copy, setCopy] = useState<'idle' | 'copied' | 'failed'>('idle')
  if (merchantQuery.isPending) return <p className="text-sm text-muted-foreground">{t('loading')}</p>
  if (!merchant) return <MerchantNotFound />
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    }).format(new Date(value))
  const activityColumns: ColumnDef<Activity>[] = [
    {
      accessorKey: 'at',
      header: t('fields.time'),
      size: 220,
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-xs tabular-nums">
          {formatDate(row.original.at)}
        </span>
      ),
    },
    {
      accessorKey: 'message',
      header: t('fields.activity'),
      size: 480,
      cell: ({ row }) => (
        <span className="whitespace-normal wrap-anywhere">{row.original.message}</span>
      ),
    },
  ]
  const statusTone: StatusTone =
    merchant.status === 'ACTIVE'
      ? 'success'
      : ['REJECTED', 'TERMINATED', 'SUSPENDED'].includes(merchant.status)
        ? 'danger'
        : ['PENDING_KYC', 'PENDING_APPROVAL'].includes(merchant.status)
          ? 'warning'
          : 'neutral'
  return (
    <div className="min-w-0 space-y-6 pb-4">
      <Link
        href="/merchants"
        className="inline-flex min-h-9 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        <ArrowLeft aria-hidden="true" className="size-3.5" />
        {t('backToMerchants')}
      </Link>
      <header className="flex min-w-0 flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="hidden size-12 shrink-0 items-center justify-center rounded-md border border-primary/15 bg-primary/5 text-primary sm:flex">
            <Building2 aria-hidden="true" className="size-5" />
          </div>
          <div className="min-w-0 space-y-3">
            <div>
              <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground">
                {t('detail.recordLabel')}
              </p>
              <h1 className="text-2xl leading-8 font-semibold tracking-tight wrap-anywhere">
                {merchant.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground wrap-anywhere">
                {merchant.legal_name || t('notProvided')}{' '}
                <span className="px-1.5 text-border" aria-hidden="true">
                  /
                </span>{' '}
                {merchant.tenant}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SemanticStatus label={t(`statuses.${merchant.status}`)} tone={statusTone} />
              <Badge
                variant="outline"
                className="rounded-sm px-2 py-1 text-xs text-muted-foreground"
              >
                {merchant.tier}
              </Badge>
              <Badge
                variant="outline"
                className="rounded-sm px-2 py-1 text-xs text-muted-foreground"
              >
                {merchant.is_sandbox ? t('environments.sandbox') : t('environments.production')}
              </Badge>
              <span aria-hidden="true" className="mx-1 hidden h-4 border-l sm:block" />
              <span className="font-mono text-xs text-muted-foreground">{merchant.code}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t('copyMerchantCode')}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(merchant.code)
                    setCopy('copied')
                  } catch {
                    setCopy('failed')
                  }
                }}
              >
                {copy === 'copied' ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              </Button>
              <span role="status" aria-live="polite" className="text-xs text-muted-foreground">
                {copy === 'idle' ? '' : t(copy === 'copied' ? 'copied' : 'copyFailed')}
              </span>
            </div>
          </div>
        </div>
        <Link
          href={`/merchants/${merchant.id}/edit`}
          className={buttonVariants({ variant: 'outline', className: 'h-10 w-fit gap-2 px-4' })}
        >
          <Settings2 aria-hidden="true" className="size-3.5" />
          {t('editMerchant')}
        </Link>
      </header>
      <Tabs defaultValue="business" className="min-w-0 gap-6">
        <div className="min-w-0 overflow-x-auto">
          <TabsList
            aria-label={t('merchantDomains')}
            variant="line"
            className="h-11 min-w-full justify-start gap-3"
          >
            {tabs.map(({ value, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="min-h-11 flex-none gap-2 px-2 sm:px-3"
              >
                <Icon aria-hidden="true" className="size-3.5" />
                {t(`detailTabs.${value}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-card">
            <TabsContent value="business">
              <MerchantDetailSection
                title={t('detail.businessIdentity')}
                icon={Building2}
                fields={[
                  { label: t('fields.legal_name'), value: merchant.legal_name },
                  { label: t('fields.business_type'), value: merchant.business_type },
                  { label: t('fields.business_category'), value: merchant.business_category },
                  { label: t('fields.tenant'), value: merchant.tenant },
                ]}
              />
              <MerchantDetailSection
                title={t('detail.businessAddress')}
                icon={MapPin}
                fields={[
                  { label: t('fields.address'), value: merchant.address, wide: true },
                  { label: t('fields.city'), value: merchant.city },
                  { label: t('fields.province'), value: merchant.province },
                  { label: t('fields.postal_code'), value: merchant.postal_code },
                ]}
              />
              <MerchantDetailSection
                title={t('detail.registration')}
                icon={FileText}
                fields={[
                  { label: t('fields.npwp'), value: merchant.npwp, mono: true },
                  { label: t('fields.nib'), value: merchant.nib, mono: true },
                  { label: t('fields.website'), value: merchant.website, wide: true, mono: true },
                ]}
              />
            </TabsContent>
            <TabsContent value="settlement">
              <MerchantDetailSection
                title={t('detail.settlementSettings')}
                description={t('detail.settlementDescription')}
                icon={Wallet}
                fields={[
                  { label: t('fields.settlement_mode'), value: merchant.settlement_mode },
                  { label: t('fields.settlement_schedule'), value: merchant.settlement_schedule },
                ]}
              />
            </TabsContent>
            <TabsContent value="integration">
              <MerchantDetailSection
                title={t('detail.integrationSettings')}
                description={t('detail.integrationDescription')}
                icon={Globe}
                fields={[
                  {
                    label: t('fields.is_sandbox'),
                    value: merchant.is_sandbox
                      ? t('environments.sandbox')
                      : t('environments.production'),
                  },
                  {
                    label: t('fields.callback_url'),
                    value: merchant.callback_url,
                    mono: true,
                    wide: true,
                  },
                  {
                    label: t('fields.callback_url_sandbox'),
                    value: merchant.callback_url_sandbox,
                    mono: true,
                    wide: true,
                  },
                  {
                    label: t('fields.ip_whitelist'),
                    value: merchant.ip_whitelist,
                    mono: true,
                    wide: true,
                  },
                ]}
              />
            </TabsContent>
            <TabsContent value="activity" className="min-w-0 space-y-4 p-5 sm:p-6">
              <div>
                <h2 className="text-sm font-semibold">{t('detailTabs.activity')}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('detail.activityDescription')}
                </p>
              </div>
              <DataTable
                columns={activityColumns}
                data={(activityQuery.data ?? []).map((entry) => ({
                  at: entry.created_at,
                  message: `${entry.action}${entry.user ? ` — ${entry.user.name}` : ''}`,
                }))}
                getRowId={(row) => `${row.at}-${row.message}`}
                emptyMessage={t('noActivity')}
              />
            </TabsContent>
          </div>
          <aside
            aria-label={t('detail.recordSummary')}
            className="min-w-0 rounded-lg border border-border bg-card"
          >
            <RecordSection
              title={t('lifecycleActions')}
              description={t('detail.lifecycleDescription')}
              icon={ShieldCheck}
            >
              <div className="space-y-4">
                <div className="border-l-2 border-primary/50 bg-muted/40 px-3 py-2.5">
                  <p className="text-xs text-muted-foreground">{t('detail.currentStatus')}</p>
                  <p className="mt-1 text-xs font-semibold">{t(`statuses.${merchant.status}`)}</p>
                </div>
                {transitions[merchant.status].length ? (
                  <div className="space-y-2">
                    {transitions[merchant.status].map((status) => (
                      <Button
                        key={status}
                        className="min-h-10 w-full justify-between gap-2 px-3 text-xs"
                        variant={
                          ['REJECTED', 'TERMINATED'].includes(status) ? 'destructive' : 'outline'
                        }
                        onClick={() => setTarget(status)}
                      >
                        {t(`statuses.${status}`)}
                        <ArrowRight aria-hidden="true" className="size-3.5" />
                      </Button>
                    ))}
                    <p className="pt-1 text-xs leading-relaxed text-muted-foreground">
                      {t('detail.reasonRequired')}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {t('noTransitions')}
                  </p>
                )}
              </div>
            </RecordSection>
            <MerchantDetailSection
              title={t('detail.recordDetails')}
              icon={Fingerprint}
              compact
              fields={[
                { label: t('fields.id'), value: merchant.id, mono: true },
                { label: t('fields.created_at'), value: formatDate(merchant.created_at) },
                { label: t('fields.updated_at'), value: formatDate(merchant.updated_at) },
              ]}
            />
          </aside>
        </div>
      </Tabs>
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
