import 'server-only'
export async function iamRequest(path: string, init: RequestInit = {}) {
  const base = process.env.IAM_API_URL
  if (!base) throw new Error('IAM_API_URL is required')
  return serviceRequest(base, path, init)
}
export async function serviceRequest(base: string, path: string, init: RequestInit = {}) {
  return fetch(`${base.replace(/\/$/, '')}/api/v1${path}`, {
    ...init,
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(10_000),
    headers: { 'Content-Type': 'application/json', ...init.headers },
  })
}
