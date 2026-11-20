# Workspace navigation

Navigation uses IAM `/auth/me`: tenant type, merchant association, role codes and permission codes. There is no user-controlled workspace switcher. The source template's buyer/seller navigation is not selected by the active application.

- Platform backoffice: platform tenant without a merchant association. Operations, finance, partner management and administration are filtered by IAM permissions.
- Reseller: reseller tenant without a merchant association. Merchant/tenant management, transaction monitoring, fees, balances and reseller settlements are available only within the workspace allowlist and IAM permissions.
- Merchant: a user associated with a merchant. Payments, payouts, balances, withdrawals, settlement and integration configuration are filtered by IAM permissions. Global issuer, reconciliation, platform configuration and Vault modules are excluded even if a broad permission is accidentally assigned.
- Unknown tenant types fail closed. Vault contract-reference pages are reserved for platform SUPER_ADMIN. No crypto operation is exposed.

The module page applies the same policy server-side, returning 404 for excluded modules. Backend tenant isolation and authorization remain mandatory for every future API integration. Current module pages are contract-reference placeholders, not scoped business-data screens.

`/dashboard` uses the authenticated BFF `/api/dashboard`: platform reads Payment `/dashboard/alerts`, reseller reads `/reseller/dashboard/summary`, merchant reads `/merchant/dashboard/summary`. The BFF fetches IAM identity itself and never accepts client-selected tenant or merchant IDs. Missing permissions, failed requests and invalid response shapes display no invented metrics. Merchant/reseller dates use UTC and amounts use IDR, following the backend contract. Platform totals are not shown because this integration only supplies operational alerts.

The active sidebar uses feature accordions only when two or more distinct subfeatures are permitted. It has no automatic Overview children or single-child accordions. Single-purpose features are direct parent links. Multiple accordions may stay open. Technical contracts remain inside their owning feature rather than becoming sidebar entries. `src/components/layout/features.ts` owns this mapping, workspace boundaries and visibility. Tests assign each non-Vault module to exactly one feature. See `docs/feature-navigation.md` for feature responsibilities and the approved structure.

Module policy: `src/lib/auth/workspace.ts`. Active feature grouping/policy: `src/components/layout/features.ts`. Backend inventory: `src/components/layout/navigation.ts`.

Verification: unit tests cover workspace boundaries, missing permissions, unknown tenants, response validation and dashboard translation keys. Browser tests exercise actual platform and merchant dashboard BFF responses, navigation and denied direct access to platform issuer pages. Reseller behavior is policy-unit-tested, not verified with a live reseller login. Local HTTPS still requires trusted backend certificates or the previously documented temporary development workaround.
