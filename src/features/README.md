# Feature boundaries

This directory follows the entry-point convention in `nextjs-boilerplate/src/features`.

- `@/features/<domain>`: environment-neutral types, schemas and constants.
- `@/features/<domain>/client`: client components and hooks.
- `@/features/<domain>/server`: server-only route composition, queries and operations.
- `@/features/<domain>/contracts`: explicit environment-neutral contracts where needed.

Keep implementation files under `components`, `hooks`, `lib`, `schemas`, `queries` or `types` as appropriate. Do not create empty placeholder directories. Use relative imports inside a feature, and public entry points outside it. Do not export server-only modules through `client.ts` or a neutral root.

`account` composes authenticated workspace routes, shell and dashboard. `auth` owns login/logout UI. `transactions` and `merchants` own their domain workspaces. `analytics` retains the boilerplate date-range utilities.

Merchants use explicit App Router list/create pages and record-specific `[merchantId]` detail/edit pages. The merchant layout owns demo state so client-side navigation preserves edits without browser storage or backend mutations. Dynamic record identifiers are not generic feature/module dispatchers.

Run `pnpm check:boundaries` after changing feature imports.
