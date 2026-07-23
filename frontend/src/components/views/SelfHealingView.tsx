import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Play, RotateCcw, ShieldCheck } from 'lucide-react'
import { mockReport, type Recommendation } from '@/data/mockReport'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Panel } from '@/components/ui/panel'

type ExecStatus = 'pending' | 'running' | 'verified' | 'rolled_back'

export function SelfHealingView() {
  const [status, setStatus] = useState<Record<string, ExecStatus>>(
    Object.fromEntries(mockReport.recommendations.map((r) => [r.id, 'pending' as ExecStatus])),
  )
  const [activeId, setActiveId] = useState(mockReport.recommendations[0]?.id)

  const active: Recommendation | undefined = mockReport.recommendations.find((r) => r.id === activeId)

  const runAction = (id: string) => {
    setStatus((s) => ({ ...s, [id]: 'running' }))
    window.setTimeout(() => {
      setStatus((s) => ({ ...s, [id]: 'verified' }))
    }, 1400)
  }

  const rollback = (id: string) => {
    setStatus((s) => ({ ...s, [id]: 'rolled_back' }))
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-12 gap-3 p-3 md:p-4">
      <Panel className="col-span-12 flex min-h-0 flex-col p-3 lg:col-span-5" glow="orange">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-alert">
            Guided Execution Workflow
          </p>
          <Badge tone="alert">Healer armed</Badge>
        </div>
        <ul className="min-h-0 space-y-2 overflow-auto pr-1">
          {mockReport.recommendations.map((rec) => {
            const st = status[rec.id]
            return (
              <li key={rec.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(rec.id)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
                    activeId === rec.id
                      ? 'border-signal/50 bg-signal/10'
                      : 'border-line/60 bg-void/35 hover:border-line-bright'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={rec.priority === 'P0' ? 'critical' : 'alert'}>{rec.priority}</Badge>
                    <span className="font-mono text-[10px] text-muted">{rec.targetService}</span>
                    <Badge
                      tone={
                        st === 'verified'
                          ? 'ok'
                          : st === 'running'
                            ? 'signal'
                            : st === 'rolled_back'
                              ? 'alert'
                              : 'muted'
                      }
                    >
                      {st}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-ink">{rec.recommendation}</p>
                </button>
              </li>
            )
          })}
        </ul>
      </Panel>

      <Panel className="col-span-12 flex min-h-0 flex-col overflow-auto p-4 lg:col-span-7" glow="blue">
        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col gap-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-signal">
                    Executable Action
                  </p>
                  <h3 className="font-display text-lg text-ink">{active.recommendation}</h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => runAction(active.id)}
                    disabled={status[active.id] === 'running' || status[active.id] === 'verified'}
                  >
                    <Play className="h-3.5 w-3.5" />
                    Execute
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rollback(active.id)}
                    disabled={status[active.id] !== 'verified'}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Rollback
                  </Button>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Target Service" value={active.targetService} />
                <Field label="Priority" value={active.priority} />
                <Field label="Risk" value={active.risk} />
                <Field label="Est. Recovery" value={active.estimatedRecoveryTime} />
                <Field label="Expected Improvement" value={active.expectedImprovement} wide />
                <Field label="Technical Reason" value={active.technicalReason} wide />
                <Field label="Rollback Plan" value={active.rollbackPlan} wide />
                <Field label="Verification" value={active.verification} wide />
              </div>

              <div className="mt-1 flex items-center gap-2 rounded-xl border border-line/60 bg-void/40 px-3 py-2">
                <ShieldCheck
                  className={`h-4 w-4 ${
                    status[active.id] === 'verified' ? 'text-ok' : 'text-muted'
                  }`}
                />
                <p className="text-xs text-ink-dim">
                  Execution status:{' '}
                  <span className="font-semibold text-ink">{status[active.id]}</span>
                  {status[active.id] === 'verified'
                    ? ' — gates passed. Safe to proceed to next action.'
                    : ' — select Execute to run against the target service.'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Panel>
    </div>
  )
}

function Field({
  label,
  value,
  wide,
}: {
  label: string
  value: string
  wide?: boolean
}) {
  return (
    <div className={`rounded-xl bg-void/40 px-3 py-2 ${wide ? 'sm:col-span-2' : ''}`}>
      <p className="font-mono text-[9px] uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-0.5 text-sm text-ink">{value}</p>
    </div>
  )
}
