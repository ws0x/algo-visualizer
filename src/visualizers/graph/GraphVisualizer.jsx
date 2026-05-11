import { useState, useEffect, useMemo, useRef } from 'react'
import { colors, ALGORITHMS } from '../../constants/theme'
import { useAnimator } from '../../hooks/useAnimator'
import { generateGraphSteps, PRESET_GRAPHS } from './graphAlgorithms'
import PlaybackControls from '../../components/Controls/PlaybackControls'
import SpeedControl from '../../components/Controls/SpeedControl'
import InfoPanel from '../../components/InfoPanel'

const NODE_RADIUS = 24

function getNodeColor(id, step) {
  if (!step) return colors.border
  if (step.current === id) return colors.yellow
  if (step.visited && step.visited.has(id)) return colors.green
  if (step.frontier && step.frontier.includes(id)) return colors.blue
  return colors.border
}

function getEdgeColor(edge, step) {
  if (!step) return colors.border
  const isPath = step.path && step.path.some(
    e => (e.from === edge.from && e.to === edge.to) || (e.from === edge.to && e.to === edge.from)
  )
  return isPath ? colors.blue : `${colors.muted}66`
}

// Interactive mode for data structures
function InteractiveGraph() {
  const [nodes, setNodes] = useState([
    { id: 'A', x: 300, y: 150 },
    { id: 'B', x: 150, y: 280 },
    { id: 'C', x: 450, y: 280 },
  ])
  const [edges, setEdges] = useState([
    { from: 'A', to: 'B', weight: 1 },
    { from: 'A', to: 'C', weight: 1 },
  ])
  const [selectedNode, setSelectedNode] = useState(null)
  const [newNodeLabel, setNewNodeLabel] = useState('')
  const [edgeFrom, setEdgeFrom] = useState('')
  const [edgeTo, setEdgeTo] = useState('')
  const [edgeWeight, setEdgeWeight] = useState('1')
  const [directed, setDirected] = useState(false)
  const svgRef = useRef(null)

  const nodeIds = nodes.map(n => n.id)

  function addNode() {
    const label = newNodeLabel.trim().toUpperCase()
    if (!label || nodes.find(n => n.id === label)) return
    const angle = (nodes.length / Math.max(nodes.length, 6)) * Math.PI * 2
    setNodes(prev => [...prev, { id: label, x: 300 + 180 * Math.cos(angle), y: 220 + 150 * Math.sin(angle) }])
    setNewNodeLabel('')
  }

  function removeNode(id) {
    setNodes(prev => prev.filter(n => n.id !== id))
    setEdges(prev => prev.filter(e => e.from !== id && e.to !== id))
  }

  function addEdge() {
    if (!edgeFrom || !edgeTo || edgeFrom === edgeTo) return
    const w = parseInt(edgeWeight) || 1
    if (!edges.find(e => e.from === edgeFrom && e.to === edgeTo)) {
      setEdges(prev => [...prev, { from: edgeFrom, to: edgeTo, weight: w }])
    }
    setEdgeFrom('')
    setEdgeTo('')
    setEdgeWeight('1')
  }

  const inputSty = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 4,
    color: colors.text,
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 12,
    padding: '4px 8px',
    outline: 'none',
  }

  const selectSty = { ...inputSty, cursor: 'pointer' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', padding: '16px 20px', overflowY: 'auto' }}>
      <div style={{ fontSize: 14, color: colors.text, fontWeight: 500 }}>Interactive Graph Editor</div>

      <div style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        overflow: 'hidden',
      }}>
        <svg ref={svgRef} width="100%" height="380" viewBox="0 0 620 380" style={{ background: colors.card }}>
          <defs>
            <marker id="arrow-int" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill={colors.blue} />
            </marker>
          </defs>
          {edges.map((e, i) => {
            const from = nodes.find(n => n.id === e.from)
            const to = nodes.find(n => n.id === e.to)
            if (!from || !to) return null
            const mx = (from.x + to.x) / 2
            const my = (from.y + to.y) / 2
            return (
              <g key={i}>
                <line
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={colors.blue} strokeWidth={1.5} strokeOpacity={0.5}
                  markerEnd={directed ? 'url(#arrow-int)' : undefined}
                />
                <text x={mx} y={my - 6} textAnchor="middle" fontSize={11}
                  fontFamily="JetBrains Mono, monospace" fill={colors.orange}>{e.weight}</text>
              </g>
            )
          })}
          {nodes.map(node => (
            <g key={node.id} style={{ cursor: 'pointer' }}
              onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}>
              <circle cx={node.x} cy={node.y} r={NODE_RADIUS}
                fill={selectedNode === node.id ? `${colors.blue}44` : colors.panel}
                stroke={selectedNode === node.id ? colors.blue : colors.muted}
                strokeWidth={selectedNode === node.id ? 2 : 1.5}
              />
              <text x={node.x} y={node.y + 5} textAnchor="middle"
                fontFamily="JetBrains Mono, monospace" fontSize={14} fontWeight="700"
                fill={selectedNode === node.id ? colors.blue : colors.text}>{node.id}</text>
            </g>
          ))}
        </svg>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: colors.muted }}>Add Node:</span>
          <input value={newNodeLabel} onChange={e => setNewNodeLabel(e.target.value.slice(0, 2))}
            placeholder="ID" style={{ ...inputSty, width: 50 }}
            onKeyDown={e => e.key === 'Enter' && addNode()} />
          <button onClick={addNode} style={{
            padding: '4px 10px', borderRadius: 4, fontSize: 12, background: `${colors.green}22`,
            color: colors.green, border: `1px solid ${colors.green}`, cursor: 'pointer',
          }}>+ Add</button>
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: colors.muted }}>Add Edge:</span>
          <select value={edgeFrom} onChange={e => setEdgeFrom(e.target.value)} style={{ ...selectSty, width: 52 }}>
            <option value="">From</option>
            {nodeIds.map(id => <option key={id} value={id}>{id}</option>)}
          </select>
          <span style={{ color: colors.muted }}>→</span>
          <select value={edgeTo} onChange={e => setEdgeTo(e.target.value)} style={{ ...selectSty, width: 52 }}>
            <option value="">To</option>
            {nodeIds.map(id => <option key={id} value={id}>{id}</option>)}
          </select>
          <input value={edgeWeight} onChange={e => setEdgeWeight(e.target.value)}
            placeholder="W" style={{ ...inputSty, width: 40 }} type="number" min="1" />
          <button onClick={addEdge} style={{
            padding: '4px 10px', borderRadius: 4, fontSize: 12, background: `${colors.blue}22`,
            color: colors.blue, border: `1px solid ${colors.blue}`, cursor: 'pointer',
          }}>Add</button>
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 12, color: colors.muted }}>
            <input type="checkbox" checked={directed} onChange={e => setDirected(e.target.checked)} />
            Directed
          </label>
        </div>

        {selectedNode && (
          <button onClick={() => removeNode(selectedNode)} style={{
            padding: '4px 10px', borderRadius: 4, fontSize: 12, background: `${colors.red}22`,
            color: colors.red, border: `1px solid ${colors.red}`, cursor: 'pointer',
          }}>Delete Node {selectedNode}</button>
        )}
      </div>

      <div style={{ fontSize: 12, color: colors.muted }}>
        Click a node to select it. Nodes: {nodes.length} | Edges: {edges.length}
      </div>
    </div>
  )
}

export default function GraphVisualizer({ algorithmId, mode = 'algorithm' }) {
  if (mode === 'structure') return <InteractiveGraph />

  const [algorithm, setAlgorithm] = useState(algorithmId || 'bfs')
  const [graph, setGraph] = useState(PRESET_GRAPHS.simple)
  const [startId, setStartId] = useState('A')

  useEffect(() => {
    if (algorithmId && algorithmId !== algorithm) setAlgorithm(algorithmId)
  }, [algorithmId])

  const steps = useMemo(() => generateGraphSteps(algorithm, graph, startId), [algorithm, graph, startId])
  const animator = useAnimator(steps)
  const step = steps[animator.currentStep] || steps[0]

  const svgWidth = 620
  const svgHeight = 400

  function edgeKey(e) { return `${e.from}-${e.to}` }

  const isPathEdge = (e) => step?.path?.some(
    p => (p.from === e.from && p.to === e.to) || (p.from === e.to && p.to === e.from)
  )

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '16px 20px',
      gap: 14,
      overflowY: 'auto',
    }}>
      {/* Algorithm tabs */}
      <div style={{ display: 'flex', gap: 6 }}>
        {ALGORITHMS.graph.map(algo => (
          <button
            key={algo.id}
            onClick={() => setAlgorithm(algo.id)}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: algorithm === algo.id ? 600 : 400,
              background: algorithm === algo.id ? `${colors.blue}22` : colors.card,
              color: algorithm === algo.id ? colors.blue : colors.muted,
              border: `1px solid ${algorithm === algo.id ? colors.blue : colors.border}`,
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            }}
          >
            <span>{algo.name}</span>
            <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', opacity: 0.7 }}>{algo.time}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        {/* SVG Graph */}
        <div style={{
          flex: 1,
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: 10,
          overflow: 'hidden',
        }}>
          <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="29" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill={colors.blue} />
              </marker>
            </defs>

            {/* Edges */}
            {graph.edges.map((e, i) => {
              const from = graph.nodes.find(n => n.id === e.from)
              const to = graph.nodes.find(n => n.id === e.to)
              if (!from || !to) return null
              const edgeColor = getEdgeColor(e, step)
              const mx = (from.x + to.x) / 2
              const my = (from.y + to.y) / 2
              const isActive = isPathEdge(e)

              return (
                <g key={i}>
                  <line
                    x1={from.x} y1={from.y}
                    x2={to.x} y2={to.y}
                    stroke={edgeColor}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    strokeOpacity={isActive ? 1 : 0.5}
                  />
                  <text
                    x={mx} y={my - 8}
                    textAnchor="middle"
                    fontSize={11}
                    fontFamily="JetBrains Mono, monospace"
                    fill={isActive ? colors.orange : colors.muted}
                  >
                    {e.weight}
                  </text>
                </g>
              )
            })}

            {/* Nodes */}
            {graph.nodes.map(node => {
              const nc = getNodeColor(node.id, step)
              const isVisited = step?.visited?.has(node.id)
              const isCurrent = step?.current === node.id

              return (
                <g key={node.id}>
                  <circle
                    cx={node.x} cy={node.y} r={NODE_RADIUS}
                    fill={nc}
                    stroke={isCurrent ? colors.yellow : isVisited ? colors.green : colors.muted}
                    strokeWidth={isCurrent || isVisited ? 2.5 : 1.5}
                    style={{ filter: isCurrent ? `drop-shadow(0 0 6px ${colors.yellow})` : isVisited ? `drop-shadow(0 0 4px ${colors.green})` : 'none', transition: 'all 0.2s' }}
                  />
                  <text
                    x={node.x} y={node.y + 5}
                    textAnchor="middle"
                    fontFamily="JetBrains Mono, monospace"
                    fontSize={14}
                    fontWeight="700"
                    fill={isCurrent ? colors.bg : isVisited ? colors.bg : colors.text}
                  >
                    {node.id}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Side Panel */}
        <div style={{
          width: 180,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          flexShrink: 0,
        }}>
          {/* Start node selector */}
          <div style={{
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            padding: '10px 12px',
          }}>
            <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Start Node
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {graph.nodes.map(n => (
                <button
                  key={n.id}
                  onClick={() => setStartId(n.id)}
                  style={{
                    width: 32, height: 32, borderRadius: 6,
                    background: startId === n.id ? colors.blue : colors.panel,
                    color: startId === n.id ? colors.bg : colors.text,
                    border: `1px solid ${startId === n.id ? colors.blue : colors.border}`,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >{n.id}</button>
              ))}
            </div>
          </div>

          {/* BFS Queue */}
          {algorithm === 'bfs' && (
            <div style={{
              background: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              padding: '10px 12px',
            }}>
              <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Queue (FIFO)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {(step?.queue || []).length === 0
                  ? <span style={{ fontSize: 11, color: `${colors.muted}88`, fontStyle: 'italic' }}>empty</span>
                  : (step?.queue || []).map((id, i) => (
                    <div key={i} style={{
                      padding: '2px 8px', borderRadius: 4,
                      background: `${colors.blue}22`,
                      color: colors.blue,
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 12, fontWeight: 600,
                      border: `1px solid ${colors.blue}44`,
                      display: 'flex', justifyContent: 'space-between',
                    }}>
                      <span>{id}</span>
                      <span style={{ color: colors.muted, fontSize: 10 }}>[{i}]</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* DFS Stack */}
          {algorithm === 'dfs' && (
            <div style={{
              background: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              padding: '10px 12px',
            }}>
              <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Call Stack (LIFO)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {(step?.stack || []).length === 0
                  ? <span style={{ fontSize: 11, color: `${colors.muted}88`, fontStyle: 'italic' }}>empty</span>
                  : [...(step?.stack || [])].reverse().map((id, i) => (
                    <div key={i} style={{
                      padding: '2px 8px', borderRadius: 4,
                      background: i === 0 ? `${colors.yellow}22` : `${colors.purple}18`,
                      color: i === 0 ? colors.yellow : colors.purple,
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 12, fontWeight: 600,
                      border: `1px solid ${i === 0 ? colors.yellow : colors.purple}44`,
                    }}>{id}{i === 0 ? ' ← top' : ''}</div>
                  ))}
              </div>
            </div>
          )}

          {/* Dijkstra distance table */}
          {algorithm === 'dijkstra' && (
            <div style={{
              background: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              padding: '10px 12px',
            }}>
              <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Distances from {startId}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {graph.nodes.map(n => {
                  const dist = step?.distances?.[n.id]
                  const isVisited = step?.visited?.has(n.id)
                  const distStr = dist === undefined || dist === Infinity ? '∞' : dist
                  return (
                    <div key={n.id} style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '3px 6px', borderRadius: 4,
                      background: isVisited ? `${colors.green}18` : 'transparent',
                    }}>
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 13, fontWeight: 700,
                        color: n.id === step?.current ? colors.yellow : isVisited ? colors.green : colors.text,
                      }}>{n.id}</span>
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 13,
                        color: distStr === '∞' ? colors.muted : colors.orange,
                        fontWeight: 600,
                      }}>{distStr}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Legend */}
          <div style={{
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            padding: '10px 12px',
          }}>
            <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legend</div>
            {[
              { color: colors.yellow, label: 'Current' },
              { color: colors.green, label: 'Visited' },
              { color: colors.blue, label: 'Frontier' },
              { color: colors.border, label: 'Unvisited' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 11, color: colors.muted }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <InfoPanel info={step?.info} step={animator.currentStep} total={animator.totalSteps} />

      <div style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <PlaybackControls {...animator} />
        <SpeedControl speed={animator.speed} setSpeed={animator.setSpeed} />
      </div>
    </div>
  )
}
