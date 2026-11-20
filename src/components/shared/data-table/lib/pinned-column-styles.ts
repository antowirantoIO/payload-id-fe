import type { Column } from '@tanstack/react-table'
import type { CSSProperties } from 'react'

/**
 * Compute style + className tweaks utk sticky pinned column.
 * Pakai di TableHead + TableCell — kedua-duanya butuh sticky positioning &
 * z-index yg sama agar header sticky ikut nempel saat scroll.
 *
 * Pattern: `position: sticky` + `left|right: <accumulated px>` based on
 * tanstack pinning state. tanstack `getStart('left')` / `getAfter('right')`
 * sudah hitung offset cumulative-nya — kita tinggal pakai.
 *
 * Untuk pinning yg deterministic, kolom WAJIB punya `size` numeric (bukan
 * default 150 abstract) — DataTable apply `width: getSize()` saat pinning aktif.
 */
export function getPinnedColumnStyles<TData>(column: Column<TData>): {
  style: CSSProperties
  isPinned: false | 'left' | 'right'
  isLastLeftPinned: boolean
  isFirstRightPinned: boolean
} {
  const isPinned = column.getIsPinned()
  const isLastLeftPinned = isPinned === 'left' && column.getIsLastColumn('left')
  const isFirstRightPinned = isPinned === 'right' && column.getIsFirstColumn('right')

  const style: CSSProperties = isPinned
    ? {
        left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
        right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
        position: 'sticky',
        zIndex: 2,
      }
    : {}

  return { style, isPinned, isLastLeftPinned, isFirstRightPinned }
}
