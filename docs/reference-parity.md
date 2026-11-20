# Reference UI migration

Source: `/Users/antowiranto/Projects/nextjs-boilerplate`.

All files under `src/components` have been copied, except the database-specific `supabase-translator.ts`. The status badge accepts label/color props instead of importing the source application's master-data hook. Calendar slot lint annotations do not change rendering. The date picker retains the source's period utilities and URL-state hook.

The login split layout, AuthCard, PasswordInput, desktop sidebar, mobile Sheet drawer, topbar and user menu use the source JSX/classes. Original global CSS, Geist fonts, theme controls, locale controls and all three message catalogs are retained. Branding text is Payloads; marketplace marketing copy is adapted and the source testimonial is not presented as a real endorsement.

Behavioral exceptions:

- Auth uses NextAuth/IAM and React Query, not source database actions.
- Sidebar service/module definitions now follow the six backend services in `components/layout/navigation.ts`. Module routes are authenticated contract-reference placeholders, not operational CRUD screens. Template permission constants are navigation metadata, not backend authorization. All module links are currently visible to signed-in users; role-aware filtering is not implemented.
- User-menu security/settings entries are disabled until implemented; profile opens the current account dashboard.
- Notifications, registration, password-reset and passkey actions are not claimed as implemented.
- Dashboard content remains the real IAM account profile, not the source marketplace analytics.

This is a source-component/layout migration, not verified pixel-for-pixel parity across every page in the reference application. Source component comparison and route behavior checks do not replace a screenshot-diff review.

Fresh browser checks: root document, locale navigation, theme choices, real IAM admin login, profile outage/retry, mobile drawer/navigation and logout pass. No uncaught page errors in those scenarios. The document language is synchronized on client locale changes because the root layout persists between navigations.
