# Feature boundaries

## Public entry points

- `@/features/<domain>`: environment-neutral types, schemas and constants.
- `@/features/<domain>/client`: client components, hooks and query options.
- `@/features/<domain>/server`: server-only operations, only when a feature needs them.
- `@/features/<domain>/contracts`: explicit environment-neutral contracts where needed.

Implementation belongs under `components`, `hooks`, `lib`, `schemas`, `queries` or `types`. Use relative imports inside a feature and public entry points outside it. Do not export server-only code through a client or neutral barrel. Avoid empty directories and one-size-fits-all CRUD controllers.

## Ownership

- `account`: profile query and dashboard content, not application routing or chrome.
- `auth`: login/logout and public auth composition.
- `transactions`: mock transaction query, filtering, columns, details, saved views and export mapping.
- `merchants`: record model, validation, lifecycle, localized column/filter builders and demo workspaces.
- `analytics`: existing date-range utilities.
- `src/lib/auth`: session/profile readers and explicit server access guards. Page guards redirect/notFound; API handlers retain HTTP status policy.
- `src/lib/workspace`: pure product metadata, canonical URLs and navigation/title selectors. Permission policy remains in `lib/auth/workspace.ts`.
- `src/components/layout`: one persistent WorkspaceShell with sidebar/topbar and UI-only icon mapping.
- `src/components/shared`: controlled reusable composition. TableWorkspace does not own domain fetching, authorization or mutation rules. Generic table copy uses namespace `table`.

## Routing and state lifetime

Authenticated pages live under `src/app/[locale]/(workspace)`, which does not add a URL segment. The layout mounts chrome and checks the session. Each page still calls `requireSession`, `requireCapability`, or `resolveFeatureLanding` as appropriate; never rely on a persistent layout or hidden sidebar item as the only access check. Incomplete capabilities explicitly render `IntegrationPending` content.

Merchants use dedicated list/create and record-specific `[merchantId]` detail/edit pages. MerchantDemoProvider stays in the merchant layout so records survive client navigation within that subtree without storage or backend mutations. List UI state is page-local. Transactions retain Zustand quick filters and page-local advanced filters/saved views; do not broaden state lifetime incidentally.

Shared helpers should cover actual repeated mechanisms (selection, browser download, table controls), while DTO interpretation, CSV serialization policy, and business transitions remain feature-owned. Reuse existing UI primitives instead of copying their styles.

Run `pnpm check:boundaries` after changing feature imports, and update localized messages plus runtime parity tests when adding application copy.
