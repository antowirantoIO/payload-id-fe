import { downloadFile } from '@/lib/download'
import type { Transaction } from '../contracts'
import { serializeTransactionsCSV } from './csv'

export function downloadTransactionsCSV(rows: Transaction[]) {
  downloadFile(
    serializeTransactionsCSV(rows),
    'payment-transactions.csv',
    'text/csv;charset=utf-8;',
  )
}
