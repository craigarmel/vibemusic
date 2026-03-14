const BASE_URL = import.meta.env.VITE_API_URL || ''

// ---------------------------------------------------------------------------
// Generic fetch wrapper used by the live-session features (Epic 3).
// Prefixes every path with "/api" and unwraps { status, data } responses.
// ---------------------------------------------------------------------------

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const payload = await response.json();
  if (!response.ok || payload.status !== "success") {
    throw new Error(payload.detail ?? payload.message ?? "Request failed");
  }

  return payload.data as T;
}

// ---------------------------------------------------------------------------
// Typed helpers used by the artist / lore API layer (Epic 1+2).
// These use the configurable BASE_URL and return the full envelope so callers
// can inspect `status` and `message` as needed.
// ---------------------------------------------------------------------------

interface ApiResponse<T> {
  status: 'success' | 'error'
  data?: T
  message?: string
  detail?: string
}

function extractErrorMessage(error: Record<string, unknown>, status: number): string {
  const detail = error.detail
  // Our custom format: { detail: { status, message, detail } }
  if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
    const d = detail as Record<string, unknown>
    return (d.message as string) || `API error ${status}`
  }
  // FastAPI validation errors: { detail: [{ msg, ... }] }
  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((e) => e.msg || e.message || String(e)).join(', ')
  }
  // Simple string detail
  if (typeof detail === 'string') return detail
  // Top-level message
  if (typeof error.message === 'string') return error.message
  return `API error ${status}`
}

export async function apiPost<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(extractErrorMessage(error, res.status))
  }

  return res.json()
}

export async function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`)

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(extractErrorMessage(error, res.status))
  }

  return res.json()
}
