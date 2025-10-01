export function buildBackendUrl(path) {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL
  if (backendBase) {
    return `${backendBase.replace(/\/$/, '')}/api/${normalizedPath}`
  }
  return `/laravel-api/${normalizedPath}`
}

export async function backendFetch(path, options = {}) {
  const url = buildBackendUrl(path)
  const headers = new Headers(options.headers || {})
  if (!headers.has('Accept')) headers.set('Accept', 'application/json')
  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json')
  const response = await fetch(url, { ...options, headers, credentials: options.credentials || 'include' })
  return response
}

export async function backendJson(path, options = {}) {
  const res = await backendFetch(path, options)
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || `Backend request failed: ${res.status}`)
  }
  return data
}


