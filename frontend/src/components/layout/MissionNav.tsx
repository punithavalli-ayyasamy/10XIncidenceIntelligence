import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import type { TabId } from '@/data/mockReport'
import { mockReport } from '@/data/mockReport'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
import { cn } from '@/lib/utils'

const tabs: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'investigation', label: 'Investigation' },
  { id: 'graph', label: 'Service Graph' },
  { id: 'agents', label: 'AI Agents' },
  { id: 'healing', label: 'Self-Healing' },
  { id: 'executive', label: 'Executive Report' },
]

export function MissionNav({
  active,
  onChange,
}: {
  active: TabId
  onChange: (id: TabId) => void
}) {
  return (
    <header className="shrink-0 border-b border-line/70 bg-void/70 px-4 py-2.5 backdrop-blur-xl md:px-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-signal/40 bg-signal/10 font-display text-xs font-bold text-signal">
            10X
          </div>
          <div className="flex items-center gap-2">
            <p className="font-display text-sm tracking-wide text-ink">{mockReport.brand}</p>
            <SeverityBadge severity={mockReport.detection.severity} />
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-1 rounded-xl border border-line/60 bg-panel/40 p-1">
          {tabs.map((tab) => {
            const isActive = active === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                className={cn(
                  'relative rounded-lg px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition',
                  isActive ? 'text-ink' : 'text-muted hover:text-ink-dim',
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-lg bg-signal/20 ring-1 ring-signal/40"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ok xl:flex">
          <Activity className="h-3.5 w-3.5" />
          Live · AI MTTR {mockReport.mttrMinutesAi}m · {mockReport.speedup}×
        </div>
      </div>
    </header>
  )
}
