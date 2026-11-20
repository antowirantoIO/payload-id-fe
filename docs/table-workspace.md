# Shared table workspace

Merchant and Payments / Transactions list pages use `TableWorkspace` from
`src/components/shared/data-table/table-workspace.tsx`. New operational list pages
should use this composition instead of assembling a separate table toolbar and frame.

## Shared presentation

- `WorkspaceHeader`: page title, description and action slots.
- `TableWorkspace`: work-area tabs, feedback notice, table frame, loading/error
  presentation, toolbar, column controls, selection/bulk bar and pagination.
- `WorkspaceSavedViews` and `SaveViewDialog`: saved-view selection and save UI.
- `WorkspaceToolbar`: search, multi-search, UTC period, quick filters, advanced
  filters/chips, reset, sorting, density and column visibility.

`TableWorkspace` accepts the existing `DataTable` data, columns and controlled-state
props. Its `toolbar` object supplies search/filter state, callbacks, filter fields,
quick-filter field IDs and sort options. `onDensityChange` lives at workspace level;
the same density is passed to the table and its View controls. Sticky headers,
column pinning and column resize are enabled consistently by the composition.

Optional `tabs`, `notice`, `loadingLabel` and `error` props add the corresponding
shared presentation. `error` supplies title, description, retry label, preserved-state
hint and retry callback. `footerSummary` remains configurable for translated result
ranges. Bulk actions are supplied through the existing `bulkActions` API.

## Domain responsibilities

Pages retain queries, tenant/permission checks, filtering data, export logic,
saved-view snapshots and mutation eligibility. Shared components do not import
Merchant or Transaction types and do not call APIs. Transaction field labels are
provided by `useTransactionTableConfig`; merchant fields and sort options live in
`features/merchants/lib/table-config.ts`.

Saved views are in-memory workspace state, not backend persistence. Merchant forms,
detail tabs and lifecycle rules remain domain components. Callback/resync previews
and merchant status changes remain UI-only.
