import { useMemo } from 'react'
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { mockReport } from '@/data/mockReport'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Panel } from '@/components/ui/panel'

const positions: Record<string, { x: number; y: number }> = {
  frontend: { x: 40, y: 40 },
  'api-gateway': { x: 40, y: 140 },
  checkout: { x: 260, y: 140 },
  payment: { x: 500, y: 140 },
  'fraud-detection': { x: 260, y: 40 },
  inventory: { x: 260, y: 260 },
  order: { x: 740, y: 140 },
  notification: { x: 980, y: 140 },
  postgres: { x: 500, y: 280 },
  redis: { x: 700, y: 280 },
  kafka: { x: 900, y: 280 },
}

function nodeStyle(highlight?: boolean, criticality?: string) {
  const border =
    highlight
      ? '#ff3b4e'
      : criticality === 'critical'
        ? '#ff7a18'
        : '#2f9bff'
  return {
    background: highlight ? '#2a1016' : '#0a1220',
    color: '#e8f1ff',
    border: `1px solid ${border}`,
    borderRadius: 10,
    fontFamily: 'Rajdhani, sans-serif',
    fontSize: 13,
    fontWeight: 600,
    padding: '10px 14px',
    boxShadow: highlight ? '0 0 24px rgba(255,59,78,0.35)' : '0 0 16px rgba(47,155,255,0.15)',
  }
}

export function DependencyGraphSection() {
  const nodes: Node[] = useMemo(
    () =>
      mockReport.dependencyNodes.map((n) => ({
        id: n.id,
        position: positions[n.id] ?? { x: 0, y: 0 },
        data: { label: `${n.label}` },
        style: nodeStyle('highlight' in n && n.highlight, n.criticality),
      })),
    [],
  )

  const edges: Edge[] = useMemo(
    () =>
      mockReport.dependencyEdges.map((e, i) => {
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
    [],
  )

  return (
    <section id="dependencies" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <SectionHeader
        index={7}
        title="Top 10 Dependency Graph"
        subtitle="React Flow blast-radius map — payment and Postgres glow as the failure epicenter."
      />
      <Panel className="h-[420px] overflow-hidden p-0" glow="red">
        <ReactFlow nodes={nodes} edges={edges} fitView proOptions={{ hideAttribution: true }}>
          <Background color="#1a2f4a" gap={22} />
          <MiniMap
            nodeColor={(n) => ((n.style as { border?: string })?.border === '#ff3b4e' ? '#ff3b4e' : '#2f9bff')}
            maskColor="rgba(5,8,15,0.7)"
            style={{ background: '#0a1220' }}
          />
          <Controls />
        </ReactFlow>
      </Panel>
    </section>
  )
}
