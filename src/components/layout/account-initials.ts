import { getInitials } from '@/components/shared/data-table/lib/table-utils'

/** Account-specific fallback; table initials remain reusable and presentation-neutral. */
export function accountInitials(name: string | null | undefined, email: string) {
  return name?.trim() ? getInitials(name) : (email[0]?.toUpperCase() ?? '?')
}
