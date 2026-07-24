import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchIncidentReport } from '@/api/report'
import { mergeApiReport } from '@/data/mergeApiReport'
import { mockReport, type ReportData } from '@/data/mockReport'

type ReportSource = 'api' | 'mock'

type ReportContextValue = {
  report: ReportData
  source: ReportSource
  loading: boolean
  error: string | null
  reportId: string | null
  healed: boolean
  setHealed: (value: boolean) => void
  refresh: () => Promise<void>
}

const ReportContext = createContext<ReportContextValue | null>(null)

export function ReportProvider({ children }: { children: ReactNode }) {
  const [report, setReport] = useState<ReportData>(mockReport)
  const [source, setSource] = useState<ReportSource>('mock')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reportId, setReportId] = useState<string | null>(null)
  const [healed, setHealed] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    setHealed(false)
    const controller = new AbortController()
    try {
      const api = await fetchIncidentReport('payment-service', controller.signal)
      setReport(mergeApiReport(api))
      setSource('api')
      setReportId(api.report_id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load report'
      setError(message)
      setReport(structuredClone(mockReport))
      setSource('mock')
      setReportId(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo(
    () => ({ report, source, loading, error, reportId, healed, setHealed, refresh }),
    [report, source, loading, error, reportId, healed, refresh],
  )

  return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>
}

export function useReport() {
  const ctx = useContext(ReportContext)
  if (!ctx) throw new Error('useReport must be used within ReportProvider')
  return ctx
}
