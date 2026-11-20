/**
 * nuqs parser utk FilterGroup — pakai compact serialization (lihat serializer.ts).
 *
 * `createParser` ini pure factory (tanpa hooks) — aman dipakai di client maupun
 * server. Caller boleh `import` di RSC; tidak perlu 'use client' boundary di sini.
 */

import { createParser } from 'nuqs/server'
import { parseFilterGroup, serializeFilterGroup } from './serializer'
import type { FilterGroup } from './types'

export const filterGroupParser = createParser<FilterGroup>({
  parse: (value) => parseFilterGroup(value),
  serialize: (value) => serializeFilterGroup(value),
  eq: (a, b) => serializeFilterGroup(a) === serializeFilterGroup(b),
})
