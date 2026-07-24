import { useMemo, useState } from 'react'
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  type Edge,
  type Node,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { type CriticalService } from '@/data/mockReport'
import { useReport } from '@/report/ReportContext'
import { Badge } from '@/components/ui/badge'
import { Panel } from '@/components/ui/panel'

const positions: Record<string, { x: number; y: number }> = {
  frontend: { x: 20, y: 20 },
  'api-gateway': { x: 20, y: 110 },
  checkout: { x: 220, y: 110 },
  payment: { x: 440, y: 110 },
  'fraud-detection': { x: 220, y: 20 },
  inventory: { x: 220, y: 210 },
  order: { x: 660, y: 110 },
  notification: { x: 860, y: 110 },
  postgres: { x: 440, y: 240 },
  redis: { x: 620, y: 240 },
  kafka: { x: 800, y: 240 },
}

function styleFor(
  id: string,
  selected: boolean,
  services: CriticalService[],
) {
  const svc = services.find((s) => s.id === id)
  const highlight = id === 'payment' || id === 'postgres'
  const border = selected
    ? '#3aa0ff'
    : highlight
      ? '#ff3b4e'
      : svc && svc.health < 50
        ? '#ff7a18'
        : '#2a4a72'
  return {
    background: selected ? '#12253f' : '#0a1220',
    color: '#e8f1ff',
    border: `1.5px solid ${border}`,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    padding: '8px 12px',
    boxShadow: highlight ? '0 0 20px rgba(255,59,78,0.3)' : undefined,
  }
}

export function ServiceGraphView() {
  const { report } = useReport()
  const [selectedId, setSelectedId] = useState<string>('payment')

  const selected: CriticalService | undefined = report.criticalServices.find(
    (s) => s.id === selectedId,
  )

  const recs = report.recommendations.filter(
    (r) =>
      r.targetService === selected?.name ||
      (selectedId === 'payment' && r.targetService === 'payment-service') ||
      r.targetService === selectedId,
  )

  const nodes: Node[] = useMemo(
    () =>
      report.dependencyNodes.map((n) => ({
        id: n.id,
        position: positions[n.id] ?? { x: 0, y: 0 },
        data: { label: n.label },
        style: styleFor(n.id, n.id === selectedId, report.criticalServices),
      })),
    [selectedId, report.dependencyNodes, report.criticalServices],
  )

  const edges: Edge[] = useMemo(
    () =>
      report.dependencyEdges.map((e, i) => {
        const source = String(e.source)
        const target = String(e.target)
        const hot = source === 'payment' || target === 'payment' || target === 'postgres'
        return {
          id: `e-${i}`,
          source,
          target,
          animated: hot,
          style: { stroke: hot ? '#ff3b4e' : '#2a4a72' },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#7f94b0' },
        }
      }),
    [report.dependencyEdges],
  )

  return (
    <div className="grid h-full min-h-0 grid-cols-12 gap-3 p-3 md:p-4">
      <Panel className="col-span-12 min-h-0 overflow-hidden p-0 lg:col-span-8" glow="red">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          onNodeClick={(_, node) => setSelectedId(node.id)}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1a2f4a" gap={20} />
          <Controls />
        </ReactFlow>
      </Panel>

      <Panel className="col-span-12 flex min-h-0 flex-col gap-3 overflow-auto p-3 lg:col-span-4" glow="blue">
        {selected ? (
          <>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  Service Detail
                </p>
                <h3 className="font-display text-lg text-ink">{selected.name}</h3>
                <p className="font-mono text-[10px] text-muted">{selected.owner}</p>
              </div>
              <Badge
                tone={
                  selected.health < 40 ? 'critical' : selected.health < 70 ? 'alert' : 'ok'
                }
              >
                {selected.health}% health
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {Object.entries(selected.metrics).map(([k, v]) => (
                <div key={k} className="rounded-lg bg-void/40 px-2 py-1.5">
                  <p className="font-mono text-[9px] uppercase text-muted">{k}</p>
                  <p className="font-display text-sm text-signal">{String(v)}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-critical">
                Root Cause
              </p>
              <p className="mt-1 text-xs text-ink-dim">{selected.rootCause}</p>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-alert">
                Downstream Impact
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {(selected.downstream.length ? selected.downstream : ['none']).map((d) => (
                  <Badge key={d} tone="muted">
                    {d}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-signal">
                Recommendations
              </p>
              <ul className="space-y-1.5">
                {(recs.length ? recs : report.recommendations.slice(0, 2)).map((r) => (
                  <li key={r.id} className="rounded-lg border border-line/50 bg-void/35 px-2 py-1.5">
                    <Badge tone={r.priority === 'P0' ? 'critical' : 'alert'}>{r.priority}</Badge>
                    <p className="mt-1 text-xs text-ink">{r.recommendation}</p>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">Select a service node</p>
        )}
      </Panel>
    </div>
  )
}
