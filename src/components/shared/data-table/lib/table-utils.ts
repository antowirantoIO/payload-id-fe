/**
 * Shared table cell utilities used across all data table column definitions.
 * Eliminates duplication of formatDate, formatCurrency, EmptyCell, relativeTime, getInitials, etc.
 */

/**
 * Format a date string to a short human-readable format.
 * Returns null if the value is null/undefined.
 */
export function formatDate(value: string | null | undefined): string | null {
  if (!value) return null
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format a date string to include time.
 */
export function formatDateTime(value: string | null | undefined): string | null {
  if (!value) return null
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days").
 */
export function relativeTime(value: string | null | undefined): string | null {
  if (!value) return null
  const now = Date.now()
  const date = new Date(value).getTime()
  const diff = now - date
  const absDiff = Math.abs(diff)
  const isFuture = diff < 0

  const seconds = Math.floor(absDiff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)

  let label: string
  if (seconds < 60) label = 'just now'
  else if (minutes < 60) label = `${minutes}m`
  else if (hours < 24) label = `${hours}h`
  else if (days < 7) label = `${days}d`
  else if (weeks < 5) label = `${weeks}w`
  else label = `${months}mo`

  if (label === 'just now') return label
  return isFuture ? `in ${label}` : `${label} ago`
}

/**
 * Format a monetary amount with currency code.
 */
export function formatCurrency(amount: number | string, currency: string): string {
  const num = typeof amount === 'string' ? Number(amount) : amount
  return `${currency} ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Format a compact number (e.g., 1.2k, 3.4M).
 */
export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return value.toString()
}

/**
 * Get initials from a name string (max 2 chars).
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/**
 * Calculate days between a date and now.
 * Positive = overdue/past, Negative = in the future.
 */
export function daysDiff(value: string | null | undefined): number | null {
  if (!value) return null
  const now = new Date()
  const target = new Date(value)
  const diff = now.getTime() - target.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/**
 * Format file size in human-readable units.
 */
export function formatFileSize(bytes: number | null | undefined): string | null {
  if (!bytes) return null
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

/**
 * Format a percentage value.
 */
export function formatPercent(value: number | null | undefined): string | null {
  if (value == null) return null
  return `${Math.round(value)}%`
}

/**
 * Calculate percentage from part/total.
 */
export function calcPercent(part: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, Math.round((part / total) * 100))
}
