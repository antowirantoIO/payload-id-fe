# Product routing

There is one product-oriented route hierarchy under `src/app/[locale]`, with explicit `page.tsx` files. There are no separate `features` and `modules` page trees and no dynamic feature/service/module dispatcher.

Examples:

- `payments/transactions/page.tsx` and `payments/refunds/page.tsx`
- `payouts/transactions/page.tsx` and `payouts/batches/page.tsx`
- `partners/providers/page.tsx` and `partners/channels/page.tsx`
- `integrations/webhooks/page.tsx` and `integrations/callbacks/page.tsx`

Area roots (such as `/payments`) authorize the user and redirect to the first permitted work area, rather than rendering an intermediate contract landing page. Business profile remains a standalone page. Each actual page retains its server-side capability check. Related work-area links remain within the same product area and are permission-filtered.

`src/components/layout/product-paths.ts` maps backend capability keys to product paths. Backend service names remain internal to API contracts and authorization. Sidebar, topbar and dashboard shortcuts use product routes. Vault stays under `/internal/vault` and is excluded from the product menu.

Old `/features/*` and known `/modules/*` URLs have temporary compatibility redirects in `next.config.ts`, including localized variants. They do not have separate page implementations. Unknown paths still return 404. Adding an entry to the capability map does not create a route: each screen needs its own explicit page, and route coverage tests verify the mapping.

`[locale]` and `api/auth/[...nextauth]` retain their framework-specific dynamic segments. Merchant records use `[merchantId]` for explicit detail/edit pages; these are data identifiers, not generic feature or module dispatchers. Authenticated pages remain server-rendered per request.
