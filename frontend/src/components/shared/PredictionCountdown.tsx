import { useEffect, useState } from 'react'
import { ShieldCheck, Timer } from 'lucide-react'
import { Panel } from '@/components/ui/panel'
import { useReport } from '@/report/ReportContext'

/** Compact countdown for Mission Control top row */
export function PredictionCountdown({ initialMinutes = 8 }: { initialMinutes?: number }) {
  const { healed } = useReport()
  const [seconds, setSeconds] = useState(Math.round(initialMinutes * 60))

  useEffect(() => {
    if (healed) return
    const id = setInterval(() => {
      setSeconds((s) => (s <= 0 ? Math.round(initialMinutes * 60) : s - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [initialMinutes, healed])

  const m = Math.floor(seconds / 60)
  const s = seconds % 60

  if (healed) {
    return (
      <Panel className="p-3" glow="green">
        <div className="mb-1 flex items-center gap-1.5 text-ok">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span className="font-mono text-[10px] uppercase tracking-[0.16em]">Outage avoided</span>
        </div>
        <p className="font-display text-3xl text-ok">SAFE</p>
        <p className="mt-0.5 text-[11px] text-ink-dim">Checkout collapse prediction cancelled</p>
      </Panel>
    )
  }

  return (
    <Panel className="p-3" glow="red">
      <div className="mb-1 flex items-center gap-1.5 text-critical">
        <Timer className="h-3.5 w-3.5" />
        <span className="font-mono text-[10px] uppercase tracking-[0.16em]">Outage Prediction</span>
      </div>
      <p className="font-display text-3xl text-critical tabular-nums">
        {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      </p>
      <p className="mt-0.5 text-[11px] text-ink-dim">Checkout collapse if unrecovered</p>
    </Panel>
  )
}
