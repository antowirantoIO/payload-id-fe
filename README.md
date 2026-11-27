# Payloads frontend

Frontend backoffice payment aggregator dengan Next.js App Router, TypeScript, dan workspace platform, reseller, serta merchant.

## Menjalankan

```sh
pnpm install
# Siapkan .env.local dari contoh konfigurasi lokal, lalu isi AUTH_SECRET.
# openssl rand -base64 32
pnpm dev
```

Konfigurasi server yang diperlukan:

```dotenv
AUTH_SECRET=
AUTH_URL=http://localhost:3000
IAM_API_URL=https://localhost/iam
PAYMENT_API_URL=https://localhost/payment
```

Buka http://localhost:3000. IAM harus dapat diakses dari server Next.js. Untuk sertifikat HTTPS lokal, gunakan `NODE_EXTRA_CA_CERTS` dengan CA tepercaya sebelum menjalankan Next.js; jangan menonaktifkan verifikasi TLS.

## Arsitektur

- `src/app/[locale]`: locale boundary, login publik, dan redirect awal.
- `src/app/[locale]/(workspace)`: halaman authenticated dengan satu persistent layout. Route group tidak mengubah URL produk.
- `src/components/layout/workspace-shell.tsx`: sidebar, topbar, dan satu main landmark; hanya mengurus presentasi/interaksi, bukan otorisasi.
- `src/lib/auth/access.ts`: guard server eksplisit untuk session, profile, capability, serta feature landing. **Layout bukan satu-satunya pengaman:** setiap protected page tetap memanggil guard dan setiap endpoint memeriksa aksesnya sendiri.
- `src/lib/workspace`: metadata produk, URL capability, serta selector navigasi/title yang netral terhadap environment. Icon mapping tetap di komponen layout. Permission policy tetap di `src/lib/auth/workspace.ts`.
- `src/features`: konten, hook, query, dan aturan domain. Account memiliki profil/dashboard; auth memiliki login/logout; transactions dan merchants memiliki workspace domain.
- `src/components/shared`: komposisi reusable seperti `TableWorkspace`, headers, filters, saved views, dan pending integration content. `src/components/ui` berisi primitive UI.
- `src/messages/compose.ts`: satu komposisi messages untuk runtime dan test parity; mendukung `en` dan `id`. Kontrol tabel umum memakai namespace `table`, bukan namespace transaksi.

### Menambah halaman

1. Buat route eksplisit di `(workspace)`, bukan generic dispatcher berdasarkan service/module.
2. Untuk halaman capability, panggil `await requireCapability(locale, 'service/capability')` pada server page, lalu render komponen fitur. Halaman yang hanya butuh session memanggil `requireSession`.
3. Untuk integrasi belum tersedia, render `IntegrationPending` dengan metadata hasil guard; jangan menyisipkan shell atau auth ke komponen konten.
4. Daftarkan metadata/URL dan policy seperlunya di `lib/workspace` dan `lib/auth/workspace`; visibility sidebar tidak menggantikan otorisasi URL langsung.
5. Gunakan public entry point fitur, komponen existing, dan messages kedua locale. Tambahkan coverage route/policy.

Alias lama `/modules/...` dan `/features/...`, termasuk prefix locale, tetap diarahkan ke URL produk.

## Autentikasi dan state

NextAuth Credentials memanggil IAM login. Backend token tetap dalam encrypted HTTP-only cookie dan tidak dikirim dalam session JSON browser. Session/profile server dideduplikasi hanya per request. Backend expiry tetap enforced; tidak ada refresh-token contract. Challenge 2FA ditolak sampai UI challenge tersedia. Logout menghapus session frontend, bukan revocation session IAM. NextAuth v5 masih dipin ke beta.30 dan perlu evaluasi sebelum produksi.

React Query memiliki server-data/cache; satu QueryClient per mounted provider, bukan singleton antaruser. Login dan logout menghapus cache. Sidebar/topbar menerima safe profile dari query yang sama. Zustand hanya untuk UI, tidak menyimpan token atau API records.

Merchant demo records dimiliki provider pada layout `merchants`: bertahan saat navigasi list/create/detail/edit, reset setelah reload atau meninggalkan subtree. Filter dan saved views merchant page-local. Quick filters transaksi berada di Zustand; advanced filters, views, dan selection transaksi page-local. Tidak ada persistence tambahan.

## Status integrasi

| Area                  | Status                                                                                |
| --------------------- | ------------------------------------------------------------------------------------- |
| Login dan profile     | IAM nyata melalui server/BFF                                                          |
| Operational dashboard | Payment API nyata: platform alerts atau reseller/merchant summary                     |
| Transactions          | Mock DTO, filtering, table views, detail, dan CSV; callback/resync belum terintegrasi |
| Merchants             | Demo in-memory: list/create/detail/edit dan lifecycle; bukan backend CRUD             |
| Modul lain            | Explicit routes dengan capability guard dan pending integration/contract reference    |

## Pemeriksaan

```sh
pnpm typecheck
pnpm check:boundaries
pnpm lint
pnpm format:check
pnpm check:i18n
pnpm test
pnpm build
pnpm test:e2e
```

`check:i18n` memeriksa key/type JSON secara rekursif; unit tests juga memeriksa parity namespace yang benar-benar dikomposisikan. E2E authenticated membutuhkan IAM/Payment lokal dan akun test yang berfungsi; kegagalan login/backend bukan alasan untuk bypass autentikasi.
