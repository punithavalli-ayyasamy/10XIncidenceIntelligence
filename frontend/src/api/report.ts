import type { ApiIncidentReport } from '@/api/types'

/** Empty = same-origin / Vite proxy (`/api/...`). */
export function apiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (!raw) return ''
  return raw.replace(/\/$/, '')
}

export class ReportApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ReportApiError'
    this.status = status
  }
}

export async function fetchIncidentReport(
  service = 'payment-service',
  signal?: AbortSignal,
): Promise<ApiIncidentReport> {
  const base = apiBaseUrl()
  const url = `${base}/api/v1/report`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ service }),
    signal,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new ReportApiError(
      text || `Report API failed (${res.status})`,
      res.status,
    )
  }

  return (await res.json()) as ApiIncidentReport
}
