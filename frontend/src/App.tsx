import { useState, type ComponentType } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { MissionNav } from '@/components/layout/MissionNav'
import { DashboardView } from '@/components/views/DashboardView'
import { InvestigationView } from '@/components/views/InvestigationView'
import { ServiceGraphView } from '@/components/views/ServiceGraphView'
import { AgentsView } from '@/components/views/AgentsView'
import { SelfHealingView } from '@/components/views/SelfHealingView'
import { ExecutiveView } from '@/components/views/ExecutiveView'
import { ReportProvider, useReport } from '@/report/ReportContext'
import { Button } from '@/components/ui/button'
import type { TabId } from '@/data/mockReport'

const views: Record<TabId, ComponentType> = {
  dashboard: DashboardView,
  investigation: InvestigationView,
  graph: ServiceGraphView,
  agents: AgentsView,
  healing: SelfHealingView,
  executive: ExecutiveView,
}

function MissionApp() {
  const [tab, setTab] = useState<TabId>('dashboard')
  const { loading, error, source, reportId, refresh } = useReport()
  const View = views[tab]

  return (
    <div className="mission-shell relative">
      <div className="grid-cyber pointer-events-none absolute inset-0 opacity-30" />
      <MissionNav active={tab} onChange={setTab} />

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-line/50 bg-void/60 px-4 py-1.5 md:px-5">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
          {loading
            ? 'Calling POST /api/v1/report…'
            : source === 'api'
              ? `Live API · ${reportId}`
              : 'Demo data · API unreachable'}
          {error && !loading ? ` — ${error}` : ''}
        </p>
        <Button size="sm" variant="outline" onClick={() => void refresh()} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Run report
        </Button>
      </div>

      <main className="mission-main relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="h-full"
          >
            <View />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ReportProvider>
      <MissionApp />
    </ReportProvider>
  )
}
