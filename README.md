# Payloads frontend

Next.js App Router foundation based on the supplied nextjs-boilerplate. The reusable UI components and CSS tokens are copied from that project; marketplace business features and database dependencies are not.

## Start

```sh
pnpm install
cp .env.example .env.local
# Set AUTH_SECRET using: openssl rand -base64 32
pnpm dev
```

Open http://localhost:3000. IAM must be accessible at `IAM_API_URL` from the Next.js server. The default uses the existing backend gateway at `https://localhost/iam`; no additional Docker service is required for the frontend. For local self-signed HTTPS, configure Node to trust the certificate authority using `NODE_EXTRA_CA_CERTS` before starting Next.js, or use a backend endpoint with a trusted certificate. Never disable TLS verification. No credentials from the reference project are copied.

## Architecture

- `src/app`: localized routes and explicit API BFF endpoints.
- `src/auth.ts`: NextAuth Credentials provider using IAM login. Encrypted HTTP-only session cookie; backend token is not returned in browser session JSON.
- `src/lib/api`: server transport, browser transport and runtime-validated contracts.
- `src/features`: feature-owned views and React Query options. Keep feature internals private; expose public entry points when features need to share logic.
- `src/stores`: Zustand UI state only. Never persist credentials or copy API data into Zustand.
- `src/components/ui`: reusable components copied from the reference. Add shared composites under `components/shared`.
- `src/messages`, `src/i18n`: English, Indonesian and Brazilian Portuguese with next-intl. All application copy belongs in messages.

React Query owns server data and login mutations. A QueryClient is created per mounted provider, not shared globally across users. Sign-in and sign-out clear cached data. Backend session expiry is enforced server-side; IAM currently exposes no refresh-token contract, so users sign in again. Accounts requiring 2FA are rejected rather than bypassed; the challenge UI is not implemented yet. Logout removes the frontend session, not IAM's session/revocation record.

Only account overview and login are implemented. Payment CRUD, role-based menus, 2FA, and transaction workflows are future integrations, not fake dashboard data. Backend authorization remains authoritative. NextAuth v5 is explicitly pinned to beta.30; evaluate the upstream release before production rollout.

## Checks

```sh
pnpm typecheck
pnpm lint
pnpm check:i18n
pnpm test
pnpm build
pnpm test:e2e
```
