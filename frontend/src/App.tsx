import { useState, type ComponentType } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MissionNav } from '@/components/layout/MissionNav'
import { DashboardView } from '@/components/views/DashboardView'
import { InvestigationView } from '@/components/views/InvestigationView'
import { ServiceGraphView } from '@/components/views/ServiceGraphView'
import { AgentsView } from '@/components/views/AgentsView'
import { SelfHealingView } from '@/components/views/SelfHealingView'
import { ExecutiveView } from '@/components/views/ExecutiveView'
import type { TabId } from '@/data/mockReport'

const views: Record<TabId, ComponentType> = {
  dashboard: DashboardView,
  investigation: InvestigationView,
  graph: ServiceGraphView,
  agents: AgentsView,
  healing: SelfHealingView,
  executive: ExecutiveView,
}

export default function App() {
  const [tab, setTab] = useState<TabId>('dashboard')
  const View = views[tab]

  return (
    <div className="mission-shell relative">
      <div className="grid-cyber pointer-events-none absolute inset-0 opacity-30" />
      <MissionNav active={tab} onChange={setTab} />
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
