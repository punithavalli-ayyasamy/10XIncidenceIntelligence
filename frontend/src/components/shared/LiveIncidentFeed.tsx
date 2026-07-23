import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { mockReport } from '@/data/mockReport'
import { Badge } from '@/components/ui/badge'
import { Panel } from '@/components/ui/panel'

const toneMap = {
  critical: 'critical',
  warn: 'alert',
  info: 'signal',
  ok: 'ok',
} as const

export function LiveIncidentFeed() {
  const [visible, setVisible] = useState(3)

  useEffect(() => {
    const id = setInterval(() => {
      setVisible((v) => (v >= mockReport.liveFeed.length ? 3 : v + 1))
    }, 2800)
    return () => clearInterval(id)
  }, [])

  const items = mockReport.liveFeed.slice(0, visible).reverse()

  return (
    <Panel className="p-4" glow="orange">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-sm tracking-wider text-alert">LIVE INCIDENT FEED</h3>
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ok">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
          </span>
          Streaming
        </span>
      </div>
      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.li
              key={`${item.t}-${item.msg}`}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3 rounded-md border border-line/80 bg-void/40 px-3 py-2"
            >
              <Badge tone={toneMap[item.level as keyof typeof toneMap]}>{item.level}</Badge>
              <div className="min-w-0">
                <p className="font-mono text-[10px] text-muted">{item.t}</p>
                <p className="truncate text-sm text-ink">{item.msg}</p>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </Panel>
  )
}
