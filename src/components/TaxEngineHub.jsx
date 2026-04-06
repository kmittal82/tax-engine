import { useState } from 'react'

const TAPESTRY_URL = 'https://database.tapestrycompliance.com/'

const NODES = [
  {
    id: 'tapestry',
    label: 'Global Tax\nPull',
    sublabel: 'Tapestry',
    cx: 250, cy: 70,
    fill: '#003087', stroke: '#1e40af',
    badge: 'Live',
    badgeColor: 'bg-green-500',
    description: 'Connect to Tapestry Compliance to pull real-time global tax rates, withholding tables, and treaty data across 100+ jurisdictions.',
    action: { label: 'Open Tapestry', href: TAPESTRY_URL, external: true },
    icon: '🌐',
  },
  {
    id: 'mobility',
    label: 'Mobility &\nPro Rata',
    sublabel: '',
    cx: 406, cy: 160,
    fill: '#1d4ed8', stroke: '#3b82f6',
    badge: 'Active',
    badgeColor: 'bg-blue-500',
    description: 'Track employee cross-border mobility events and automatically compute pro rata tax allocations based on work-day counts per jurisdiction.',
    action: { label: 'Run Calculation', href: null },
    icon: '✈',
  },
  {
    id: 'import',
    label: 'Tax Import\nAPI / File',
    sublabel: '',
    cx: 406, cy: 340,
    fill: '#6d28d9', stroke: '#8b5cf6',
    badge: 'Ready',
    badgeColor: 'bg-violet-500',
    description: 'Ingest tax data via REST API or flat-file upload (CSV / Excel). Supports withholding tables, tax codes, and jurisdiction overrides.',
    action: { label: 'Import Now', href: null },
    icon: '⬇',
  },
  {
    id: 'calculator',
    label: 'Tax\nCalculator',
    sublabel: '',
    cx: 250, cy: 430,
    fill: '#065f46', stroke: '#10b981',
    badge: 'Ready',
    badgeColor: 'bg-emerald-500',
    description: 'Compute income tax, CGT, and withholding on equity vesting events. Handles RSU, ESPP, Options. Outputs per-employee tax liability breakdowns.',
    action: { label: 'Calculate', href: null },
    icon: '🧮',
  },
  {
    id: 'compliance',
    label: 'Local Law\nCompliance',
    sublabel: '',
    cx: 94, cy: 340,
    fill: '#92400e', stroke: '#f59e0b',
    badge: 'Monitor',
    badgeColor: 'bg-amber-500',
    description: 'Validate equity tax treatment against local law requirements. Flags statutory deadlines, filing obligations, and jurisdiction-specific restrictions.',
    action: { label: 'Review Rules', href: null },
    icon: '⚖',
  },
  {
    id: 'audit',
    label: 'Audit &\nFlag',
    sublabel: '',
    cx: 94, cy: 160,
    fill: '#9f1239', stroke: '#f43f5e',
    badge: 'Active',
    badgeColor: 'bg-rose-500',
    description: 'Full audit trail of all tax calculations, data imports, overrides, and rate changes. Flag anomalies, mismatches, and compliance exceptions for review.',
    action: { label: 'View Audit Log', href: null },
    icon: '🔍',
  },
]

function HubDiagram({ activeNode, setActiveNode }) {
  const R_CENTER = 60
  const R_NODE = 42

  return (
    <svg
      viewBox="0 0 500 500"
      className="w-full max-w-lg mx-auto select-none"
      style={{ filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.10))' }}
    >
      {/* Defs */}
      <defs>
        <radialGradient id="centerGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#003087" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Spoke lines */}
      {NODES.map((n) => (
        <line
          key={`line-${n.id}`}
          x1={250} y1={250}
          x2={n.cx} y2={n.cy}
          stroke={activeNode === n.id ? n.fill : '#cbd5e1'}
          strokeWidth={activeNode === n.id ? 2.5 : 1.5}
          strokeDasharray={activeNode === n.id ? '0' : '5 4'}
          style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
        />
      ))}

      {/* Outer ring */}
      <circle cx={250} cy={250} r={185} fill="none" stroke="#e2e8f0" strokeWidth={1} strokeDasharray="6 6" />

      {/* Outer nodes */}
      {NODES.map((n) => {
        const isActive = activeNode === n.id
        const lines = n.label.split('\n')
        return (
          <g
            key={n.id}
            onClick={() => setActiveNode(isActive ? null : n.id)}
            style={{ cursor: 'pointer' }}
          >
            <circle
              cx={n.cx} cy={n.cy} r={R_NODE + (isActive ? 6 : 0)}
              fill={isActive ? n.fill : '#f8fafc'}
              stroke={n.fill}
              strokeWidth={isActive ? 0 : 2}
              style={{ transition: 'all 0.2s' }}
              filter={isActive ? 'url(#glow)' : undefined}
            />
            <text
              x={n.cx} y={n.cy - (lines.length > 1 ? 8 : 0)}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="10"
              fontWeight="600"
              fill={isActive ? '#ffffff' : n.fill}
              style={{ transition: 'fill 0.2s', pointerEvents: 'none' }}
            >
              {lines[0]}
            </text>
            {lines[1] && (
              <text
                x={n.cx} y={n.cy + 10}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="10" fontWeight="600"
                fill={isActive ? '#ffffff' : n.fill}
                style={{ pointerEvents: 'none' }}
              >
                {lines[1]}
              </text>
            )}
          </g>
        )
      })}

      {/* Center node */}
      <circle cx={250} cy={250} r={R_CENTER} fill="url(#centerGrad)" />
      <circle cx={250} cy={250} r={R_CENTER - 4} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} />
      <text x={250} y={242} textAnchor="middle" dominantBaseline="middle"
        fontSize="11" fontWeight="700" fill="white">
        Central
      </text>
      <text x={250} y={256} textAnchor="middle" dominantBaseline="middle"
        fontSize="11" fontWeight="700" fill="white">
        Tax Engine
      </text>
    </svg>
  )
}

function NodeCard({ node }) {
  if (!node) return null
  return (
    <div
      className="bg-white rounded-2xl border-2 p-6 shadow-lg animate-fade-in"
      style={{ borderColor: node.fill }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{node.icon}</span>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {node.label.replace('\n', ' ')}
            </h3>
            {node.sublabel && (
              <span className="text-xs font-medium" style={{ color: node.fill }}>{node.sublabel}</span>
            )}
          </div>
        </div>
        <span className={`text-xs font-medium text-white px-2 py-0.5 rounded-full ${node.badgeColor}`}>
          {node.badge}
        </span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">{node.description}</p>
      {node.action.href ? (
        <a
          href={node.action.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg transition hover:opacity-90"
          style={{ backgroundColor: node.fill }}
        >
          {node.action.label}
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      ) : (
        <button
          className="inline-flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg transition hover:opacity-90"
          style={{ backgroundColor: node.fill }}
        >
          {node.action.label}
        </button>
      )}
    </div>
  )
}

export default function TaxEngineHub() {
  const [activeNode, setActiveNode] = useState(null)

  const activeData = NODES.find((n) => n.id === activeNode) || null

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#003087] to-[#1d4ed8] rounded-2xl px-8 py-6 text-white flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-200">Tax Intelligence</span>
          </div>
          <h2 className="text-2xl font-bold">Central Tax Engine</h2>
          <p className="text-sm text-blue-200 mt-1 max-w-lg">
            Global tax data, mobility tracking, and compliance — all connected through a single engine.
            Powered by{' '}
            <a
              href={TAPESTRY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-semibold underline hover:text-blue-100"
            >
              Tapestry Compliance
            </a>.
          </p>
        </div>
        <div className="hidden md:flex flex-col items-end gap-2 text-right">
          <span className="text-xs text-blue-300">Connected to</span>
          <a
            href={TAPESTRY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Tapestry Compliance DB
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* Hub + Detail panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Hub diagram */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-xs text-gray-400 text-center mb-4 uppercase tracking-wide font-medium">
            Click a node to explore
          </p>
          <HubDiagram activeNode={activeNode} setActiveNode={setActiveNode} />
          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {NODES.map((n) => (
              <button
                key={n.id}
                onClick={() => setActiveNode(activeNode === n.id ? null : n.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition
                  ${activeNode === n.id ? 'text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                style={activeNode === n.id ? { backgroundColor: n.fill } : {}}
              >
                <span className="text-sm">{n.icon}</span>
                {n.label.replace('\n', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div>
          {activeData ? (
            <NodeCard node={activeData} />
          ) : (
            <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500">Select an integration</p>
              <p className="text-xs text-gray-400 mt-1">Click any node in the diagram to see details</p>
            </div>
          )}

          {/* All integrations summary */}
          <div className="mt-4 space-y-2">
            {NODES.filter((n) => n.id !== activeNode).map((n) => (
              <button
                key={n.id}
                onClick={() => setActiveNode(n.id)}
                className="w-full flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3
                  hover:border-gray-300 hover:shadow-sm transition text-left"
              >
                <span className="text-lg">{n.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{n.label.replace('\n', ' ')}</p>
                  <p className="text-xs text-gray-400 truncate">{n.description.slice(0, 65)}…</p>
                </div>
                <span className={`text-xs font-medium text-white px-2 py-0.5 rounded-full flex-shrink-0 ${n.badgeColor}`}>
                  {n.badge}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
