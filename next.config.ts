import createNextIntlPlugin from 'next-intl/plugin'
import { productPaths } from './src/components/layout/product-paths'
export default createNextIntlPlugin()({
  poweredByHeader: false,
  outputFileTracingRoot: process.cwd(),
  turbopack: { root: process.cwd() },
  async redirects() {
    const aliases = Object.entries(productPaths).map(([capability, destination]) => ({
      source: `/modules/${capability}`,
      destination,
    }))
    aliases.push(
      { source: '/features/:slug', destination: '/:slug' },
      { source: '/modules/iam', destination: '/resellers' },
      { source: '/modules/payment', destination: '/payments' },
      { source: '/modules/issuer', destination: '/partners' },
      { source: '/modules/accounting', destination: '/balances' },
      { source: '/modules/open', destination: '/integrations' },
      { source: '/modules/vault', destination: '/internal/vault/keys' },
    )
    return aliases.flatMap((alias) => [
      { ...alias, permanent: false },
      {
        source: `/:locale(en|id|pt-BR)${alias.source}`,
        destination: `/:locale${alias.destination}`,
        permanent: false,
      },
    ])
  },
})
