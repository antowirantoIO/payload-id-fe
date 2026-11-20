/**
 * Module augmentation utk @tanstack/react-table — extend ColumnMeta dgn properti
 * custom yg dipakai DataTable shared components (filter builder, view options,
 * inline edit di Tier 3, dll).
 *
 * Letakkan satu file ini saja di project (.d.ts), TS akan merge ke library types.
 */

import type { RowData } from '@tanstack/react-table'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Human label utk column visibility toggle, side panel field list, dll. */
    label?: string
    /** Tipe value utk inline edit (Tier 3). */
    editable?: 'text' | 'select' | 'tags' | false
    /** Options utk select editor. */
    selectOptions?: ReadonlyArray<{ value: string; label: string }>
    /** Lebar default kolom (px). TanStack default 150. */
    width?: number
  }
}
