# Feature navigation baseline

This is the product navigation baseline approved by the owner. Sidebar parents are feature workspaces, not service catalogs. Stable feature routes use `/features/<slug>`. Only features with two or more distinct, permitted sidebar subfeatures use an accordion. There is no automatic Overview child. Single-purpose features and features reduced to one permitted subfeature are direct parent links. Technical contracts (Open API variants, callback details, signing keys, export plumbing and provider credentials) stay within their feature page instead of being manufactured into sidebar items. Multiple accordions may stay open. The active feature opens by default; desktop icon-only mode links to the feature page. Mobile uses the same structure and closes after choosing a destination. Backend ownership can change without changing feature URLs.

## Workspace structure

Platform: Dashboard; Operations (Payments, Disbursements, Payment links, Approvals); Business (Merchants, Resellers, Partners & channels); Finance (Balances & activity, Settlements, Reconciliation, Fees & commissions, Reports); Settings (Integrations, Users & access, Activity audit, Platform settings).

Reseller: Dashboard; Business (Merchants); Operations (Payments, Disbursements, Payment links); Finance (Balances & activity, Settlements, Fees & commissions, Reports); Settings (Business profile, Integrations, Users & access).

Merchant: Dashboard; Operations (Payments, Disbursements, Payment links); Finance (Balances & activity, Settlements, Reports); Settings (Business profile, Integrations, Users & access).

These are maximum product boundaries, not permission grants. A feature appears only if its workspace allows it and at least one mapped backend capability is permitted. Each contract inside a feature is filtered separately. Unknown workspaces fail closed. Business profile is an explicitly unfinished self-profile foundation, not access to merchant or tenant administration APIs.

## Feature boundaries

| Route             | Responsibility                             | In-page capabilities, not sidebar items                                                                        |
| ----------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| payments          | Incoming payments and their lifecycle      | Filters, transaction detail, refund, provider response, history, API reference                                 |
| payouts           | Outgoing payments to recipients            | Single and batch payout, upload/template, recipient details, retry/history                                     |
| payment-links     | Link lifecycle and related payments        | Create, expiry, deactivate, payment history                                                                    |
| approvals         | Human approval queue                       | Request detail, approve/reject; workflow configuration belongs in a settings tab                               |
| merchants         | Merchant onboarding and administration     | Documents, bank accounts, channel configuration, merchant summary                                              |
| resellers         | Reseller organizations                     | Tenant-backed administration; future list must explicitly filter RESELLER, not expose all tenants as resellers |
| partners          | Provider/channel availability and routing  | Provider credentials, channel mappings, routing policies                                                       |
| balances          | Wallet balances and movement               | Ledger, balance summaries, wallet withdrawals; not recipient payout                                            |
| settlements       | Merchant and reseller settlement lifecycle | Schedule, statement/detail, settlement status                                                                  |
| reconciliation    | Matching and exception handling            | Recon jobs, differences, disputes                                                                              |
| pricing           | Fee and commission policy                  | Provider cost, merchant fees, reseller markup; only where backend supports them                                |
| reports           | Reporting and downloads                    | Transaction/financial reports, export and export history                                                       |
| business-profile  | Own business identity                      | Profile, documents, bank accounts; dedicated scoped integration pending                                        |
| integrations      | Merchant-facing API connectivity           | API credentials, signing keys, webhooks, callbacks, API logs, sandbox                                          |
| access            | Account administration                     | Users, roles, permissions, security policies                                                                   |
| audit             | Administrative activity trace              | Filters, event detail; API request logs remain under Integrations                                              |
| platform-settings | Global platform configuration              | Notifications, system settings, provider health/monitoring                                                     |

## Implementation contract

- Each operational screen should implement relevant summary, list, filters, detail, authorized actions, and loading/empty/error states. Do not add these mechanically where the content does not need them.
- Actions such as approve, refund, retry, upload, export and history are not separate sidebar entries.
- Tabs belong inside a feature and must enforce the permission for the specific capability, not inherit all access from the parent.
- The current feature pages are clearly labeled contract-reference foundations. An endpoint in the catalog is not proof that a usable UI exists.
- Vault is infrastructure, not a product feature. Existing protected internal reference routes are not linked from the sidebar.
- Platform alerts and merchant/reseller summaries remain on Dashboard. Financial totals unavailable from the integrated backend must not be invented.
- The feature registry and module mapping live in `src/components/layout/features.ts`. Both server route authorization and sidebar visibility use the same policy.
- Product paths are defined in `src/components/layout/product-paths.ts`. The obsolete `backoffice-navigation.ts` and `feature-details.ts` implementations have been removed. Old URLs exist only as compatibility redirects.

## Visual rationale

The supplied reference's emerald tokens, Geist typography and neutral sidebar remain the visual direction (ENERGY 1 / RHYTHM 1 / MOTION 1). Flat links reduce clicks and make feature ownership explicit. Section spacing separates daily operations, business management, finance and configuration. Domain icons distinguish work areas; there are no decorative statistics or generated assets. Active state follows the feature, including legacy module routes. Collapsed links retain accessible names, and mobile navigation closes after selecting a destination.

- Subfeature links use the same product hierarchy as their parent, such as `/payments/transactions`. Unfinished integrations remain explicitly labeled; the active parent stays highlighted on child routes.
