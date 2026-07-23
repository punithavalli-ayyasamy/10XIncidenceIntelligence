import { useEffect, useState } from 'react'
import { cn, formatNumber } from '@/lib/utils'

export function AnimatedCounter({
  value,
  duration = 1400,
  decimals = 0,
  suffix = '',
  prefix = '',
  className,
}: {
  value: number
  duration?: number
  decimals?: number
  suffix?: string
  prefix?: string
  className?: string
}) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(value * eased)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration])

  return (
    <span className={cn('font-display tabular-nums', className)}>
      {prefix}
      {formatNumber(display, decimals)}
      {suffix}
    </span>
  )
}
