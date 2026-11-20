export class ApiError extends Error {
  constructor(public status: number) {
    super(`API request failed (${status})`)
  }
}
export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { signal, credentials: 'same-origin', cache: 'no-store' })
  if (!response.ok) throw new ApiError(response.status)
  return response.json() as Promise<T>
}
