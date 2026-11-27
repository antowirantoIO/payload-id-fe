import { ArrowLeftIcon, ArrowRightIcon, CopyIcon } from 'lucide-react'
import { DataTableSidePanel } from '@/components/shared/data-table/data-table-side-panel'
import { Button } from '@/components/ui/button'
import type { Transaction } from '../contracts'
import type { useTransactionDetail } from '../hooks/use-transaction-detail'
import type { TransactionFormatters } from '../lib/format'
import { type TransactionCopy, TransactionStatus } from './transaction-status'

export function TransactionDetailPanel({
  detail,
  orderedRows,
  t,
  money,
  date,
}: TransactionFormatters & {
  detail: ReturnType<typeof useTransactionDetail>
  orderedRows: Transaction[]
  t: TransactionCopy
}) {
  const { selected, copied, copyFailed, inspect, copyReference, close } = detail
  const selectedIndex = orderedRows.findIndex((row) => row.id === selected?.id)
  return (
    <DataTableSidePanel
      title={t('detailTitle')}
      description={t('description')}
      size="xl"
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={selectedIndex <= 0}
            onClick={() => {
              const row = orderedRows[selectedIndex - 1]
              if (row) inspect(row)
            }}
          >
            <ArrowLeftIcon className="size-4" />
            {t('previousTransaction')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={selectedIndex < 0 || selectedIndex >= orderedRows.length - 1}
            onClick={() => {
              const row = orderedRows[selectedIndex + 1]
              if (row) inspect(row)
            }}
          >
            {t('nextTransaction')}
            <ArrowRightIcon className="size-4" />
          </Button>
        </div>
      }
      open={Boolean(selected)}
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      {selected && (
        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <p className="break-all font-mono text-sm font-medium">
              {selected.platform_reference_id}
            </p>
            <Button variant="outline" size="sm" onClick={copyReference}>
              <CopyIcon className="size-3.5" />
              {t(copied ? 'copied' : 'copyReference')}
            </Button>
            <p role="status" className="text-xs text-muted-foreground">
              {copyFailed ? t('copyFailed') : copied ? t('copied') : ''}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TransactionStatus value={selected.status} t={t} />
            <span className="text-sm">{selected.environment}</span>
          </div>
          <p className="text-3xl font-semibold tabular-nums">
            {money(selected.amount, selected.currency)}
          </p>
          {[
            {
              title: 'identity',
              values: [
                ['id', selected.id],
                ['external_id', selected.external_id],
                ['platform_reference_id', selected.platform_reference_id],
                [
                  'tenant',
                  selected.tenant ? `${selected.tenant.name} (${selected.tenant.code})` : null,
                ],
                [
                  'merchant',
                  selected.merchant
                    ? `${selected.merchant.name} (${selected.merchant.code})`
                    : null,
                ],
              ],
            },
            {
              title: 'payment',
              values: [
                ['type', t(selected.transaction_type)],
                ['channel', selected.channel?.name || selected.channel_code],
                ['issuer', selected.issuer?.name],
                ['amount', money(selected.amount, selected.currency)],
                ['fee', money(selected.fee_amount, selected.currency)],
                [
                  'net',
                  selected.net_amount == null
                    ? null
                    : money(selected.net_amount, selected.currency),
                ],
                ['settlement', t(selected.settlement_status)],
                ['descriptionField', selected.description],
                ['payment_code', selected.payment_code],
                ['payment_url', selected.payment_url],
              ],
            },
            {
              title: 'customer',
              values: [
                ['customer_name', selected.customer_name],
                ['customer_email', selected.customer_email],
              ],
            },
            {
              title: 'timestamps',
              values: (
                ['created_at', 'updated_at', 'paid_at', 'expired_at', 'failed_at'] as const
              ).map((key) => [key, selected[key] ? date(selected[key]) : null]),
            },
            ...(selected.failure_code || selected.failure_message
              ? [
                  {
                    title: 'failure',
                    values: [
                      ['failure_code', selected.failure_code],
                      ['failure_message', selected.failure_message],
                    ],
                  },
                ]
              : []),
          ].map((section) => (
            <section key={section.title} className="border-t pt-5">
              <h3 className="text-sm font-semibold">{t(section.title)}</h3>
              <dl className="mt-3 space-y-3">
                {section.values.map(([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-[150px_1fr]"
                  >
                    <dt className="text-muted-foreground">{t(key!)}</dt>
                    <dd className="min-w-0 break-words [overflow-wrap:anywhere]">
                      {value || t('absent')}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
          <Button variant="outline" className="min-h-11 w-full" onClick={() => close()}>
            {t('close')}
          </Button>
        </div>
      )}
    </DataTableSidePanel>
  )
}
