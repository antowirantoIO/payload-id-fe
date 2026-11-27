import { features } from './features'
import { findModule } from './navigation'
import { productPaths } from './product-paths'

/** Longest segment-prefix match supports record detail/edit without matching sibling names. */
export function workspacePageTitle(pathname: string): string | undefined {
  if (pathname === '/dashboard') return 'dashboard'
  const capability = Object.entries(productPaths)
    .filter(([, path]) => pathname === path || pathname.startsWith(`${path}/`))
    .sort((a, b) => b[1].length - a[1].length)[0]?.[0]
  if (capability) {
    const [service, module] = capability.split('/')
    return findModule(service, module)?.feature.label
  }
  return features
    .filter(
      (feature) => pathname === `/${feature.slug}` || pathname.startsWith(`/${feature.slug}/`),
    )
    .sort((a, b) => b.slug.length - a.slug.length)[0]?.label
}
