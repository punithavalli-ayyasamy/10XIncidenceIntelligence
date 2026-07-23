import { useEffect, useState } from 'react'
import { Timer } from 'lucide-react'
import { Panel } from '@/components/ui/panel'

export function PredictionCountdown({ initialMinutes = 8 }: { initialMinutes?: number }) {
  const [seconds, setSeconds] = useState(Math.round(initialMinutes * 60))

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => (s <= 0 ? Math.round(initialMinutes * 60) : s - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [initialMinutes])

  const m = Math.floor(seconds / 60)
  const s = seconds % 60

  return (
    <Panel className="p-4" glow="red">
      <div className="mb-2 flex items-center gap-2 text-critical">
        <Timer className="h-4 w-4" />
        <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
          Prediction countdown
        </span>
      </div>
      <p className="text-sm text-ink-dim">Checkout collapse forecast if unrecovered</p>
      <p className="mt-3 font-display text-4xl text-critical text-glow-orange">
        {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      </p>
      <p className="mt-1 font-mono text-xs text-muted">AI predicted window · &lt; 10 minutes</p>
    </Panel>
  )
}
