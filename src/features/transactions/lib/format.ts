export function transactionFormatters(locale: string) {
  const money = (value: string, currency: string) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }).format(
      Number(value),
    )
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(value))
  return { money, date }
}

export type TransactionFormatters = ReturnType<typeof transactionFormatters>
