import { useState, useMemo } from 'react'
import { colors, ALGORITHMS } from '../../constants/theme'
import { useAnimator } from '../../hooks/useAnimator'
import { generateTreeSteps, buildDefaultTree, insertBST, deleteBST, getTreeValues, computeTreeLayout } from './treeAlgorithms'
import PlaybackControls from '../../components/Controls/PlaybackControls'
import SpeedControl from '../../components/Controls/SpeedControl'
import InfoPanel from '../../components/InfoPanel'
import { Plus, Trash2 } from 'lucide-react'

const NODE_R = 22

export default function TreeVisualizer({ algorithmId }) {
  const [traversal, setTraversal] = useState(algorithmId || 'inorder')
  const [tree, setTree] = useState(buildDefaultTree)
  const [insertVal, setInsertVal] = useState('')
  const [deleteVal, setDeleteVal] = useState('')
  const [insertError, setInsertError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  const steps = useMemo(() => generateTreeSteps(traversal, tree), [traversal, tree])
  const animator = useAnimator(steps)
  const step = steps[animator.currentStep] || steps[0]

  const layout = step ? { nodes: step.nodes, edges: step.edges } : computeTreeLayout(tree)
  const treeVals = getTreeValues(tree)

  // Compute SVG bounds
  const maxX = Math.max(...(layout.nodes.map(n => n.x)), 100) + NODE_R + 20
  const maxY = Math.max(...(layout.nodes.map(n => n.y)), 60) + NODE_R + 20

  function handleInsert() {
    const v = parseInt(insertVal)
    if (isNaN(v) || v < 1 || v > 9999) { setInsertError('Enter 1–9999'); return }
    setInsertError('')
    setTree(t => insertBST(t, v))
    setInsertVal('')
  }

  function handleDelete() {
    const v = parseInt(deleteVal)
    if (isNaN(v)) { setDeleteError('Enter a number'); return }
    if (!treeVals.includes(v)) { setDeleteError(`${v} not in tree`); return }
    setDeleteError('')
    setTree(t => deleteBST(t, v))
    setDeleteVal('')
  }

  function handleReset() {
    setTree(buildDefaultTree())
  }

  const inputSty = (err) => ({
    background: colors.card,
    border: `1px solid ${err ? colors.red : colors.border}`,
    borderRadius: 4,
    color: colors.text,
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 13,
    padding: '5px 8px',
    outline: 'none',
    width: 72,
  })

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '16px 20px',
      gap: 14,
      overflowY: 'auto',
    }}>
      {/* Traversal tabs */}
      <div style={{ display: 'flex', gap: 6 }}>
        {ALGORITHMS.tree.map(algo => (
          <button
            key={algo.id}
            onClick={() => setTraversal(algo.id)}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: traversal === algo.id ? 600 : 400,
              background: traversal === algo.id ? `${colors.blue}22` : colors.card,
              color: traversal === algo.id ? colors.blue : colors.muted,
              border: `1px solid ${traversal === algo.id ? colors.blue : colors.border}`,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {algo.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 14 }}>
        {/* Tree SVG */}
        <div style={{
          flex: 1,
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: 10,
          overflow: 'hidden',
          minHeight: 240,
        }}>
          <svg
            width="100%"
            height={Math.max(280, maxY)}
            viewBox={`0 0 ${Math.max(maxX, 300)} ${Math.max(280, maxY)}`}
            style={{ display: 'block' }}
          >
            {/* Edges */}
            {layout.edges.map((e, i) => {
              const fromNode = layout.nodes.find(n => n.val === e.from)
              const toNode = layout.nodes.find(n => n.val === e.to)
              if (!fromNode || !toNode) return null
              const isHighlighted = step?.visited?.includes(e.to) || step?.current === e.to
              return (
                <line
                  key={i}
                  x1={fromNode.x} y1={fromNode.y}
                  x2={toNode.x} y2={toNode.y}
                  stroke={isHighlighted ? colors.green : `${colors.muted}55`}
                  strokeWidth={isHighlighted ? 2 : 1.5}
                  style={{ transition: 'stroke 0.2s' }}
                />
              )
            })}

            {/* Nodes */}
            {layout.nodes.map(node => {
              const isCurrent = step?.current === node.val
              const isVisited = step?.visited?.includes(node.val)
              let fill = colors.panel
              let stroke = colors.muted
              let textFill = colors.text

              if (isCurrent) {
                fill = `${colors.yellow}33`
                stroke = colors.yellow
                textFill = colors.yellow
              } else if (isVisited) {
                fill = `${colors.green}22`
                stroke = colors.green
                textFill = colors.green
              }

              return (
                <g key={node.val} style={{ transition: 'all 0.2s' }}>
                  <circle
                    cx={node.x} cy={node.y} r={NODE_R}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isCurrent || isVisited ? 2 : 1.5}
                    style={{
                      filter: isCurrent ? `drop-shadow(0 0 6px ${colors.yellow})` : isVisited ? `drop-shadow(0 0 4px ${colors.green})` : 'none',
                      transition: 'all 0.2s',
                    }}
                  />
                  <text
                    x={node.x} y={node.y + 5}
                    textAnchor="middle"
                    fontFamily="JetBrains Mono, monospace"
                    fontSize={13}
                    fontWeight="700"
                    fill={textFill}
                    style={{ transition: 'fill 0.2s' }}
                  >
                    {node.val}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Side panel */}
        <div style={{ width: 200, display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
          {/* Insert */}
          <div style={{
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            padding: '10px 12px',
          }}>
            <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Insert Node
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                value={insertVal}
                onChange={e => { setInsertVal(e.target.value); setInsertError('') }}
                onKeyDown={e => e.key === 'Enter' && handleInsert()}
                placeholder="value"
                style={inputSty(insertError)}
                type="number"
              />
              <button
                onClick={handleInsert}
                style={{
                  padding: '5px 10px', borderRadius: 4, fontSize: 12,
                  background: `${colors.green}22`, color: colors.green,
                  border: `1px solid ${colors.green}`, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <Plus size={13} /> Add
              </button>
            </div>
            {insertError && <div style={{ fontSize: 11, color: colors.red, marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>{insertError}</div>}
          </div>

          {/* Delete */}
          <div style={{
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            padding: '10px 12px',
          }}>
            <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Delete Node
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                value={deleteVal}
                onChange={e => { setDeleteVal(e.target.value); setDeleteError('') }}
                onKeyDown={e => e.key === 'Enter' && handleDelete()}
                placeholder="value"
                style={inputSty(deleteError)}
                type="number"
              />
              <button
                onClick={handleDelete}
                style={{
                  padding: '5px 10px', borderRadius: 4, fontSize: 12,
                  background: `${colors.red}22`, color: colors.red,
                  border: `1px solid ${colors.red}`, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <Trash2 size={13} /> Del
              </button>
            </div>
            {deleteError && <div style={{ fontSize: 11, color: colors.red, marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>{deleteError}</div>}
          </div>

          {/* Tree values */}
          <div style={{
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            padding: '10px 12px',
          }}>
            <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tree Values ({treeVals.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {treeVals.map(v => (
                <span key={v} style={{
                  padding: '2px 6px', borderRadius: 3,
                  background: `${colors.blue}18`,
                  color: colors.blue,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11, fontWeight: 600,
                  border: `1px solid ${colors.blue}33`,
                }}>{v}</span>
              ))}
            </div>
            <button
              onClick={handleReset}
              style={{
                marginTop: 8, width: '100%',
                padding: '4px 0', borderRadius: 4, fontSize: 11,
                background: `${colors.muted}22`, color: colors.muted,
                border: `1px solid ${colors.border}`, cursor: 'pointer',
              }}
            >
              Reset to default
            </button>
          </div>
        </div>
      </div>

      {/* Traversal output */}
      {step?.visited && step.visited.length > 0 && (
        <div style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          padding: '10px 14px',
        }}>
          <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {traversal} traversal output
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
            {step.visited.map((v, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{
                  padding: '3px 8px', borderRadius: 4,
                  background: `${colors.green}22`,
                  color: colors.green,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 13, fontWeight: 600,
                  border: `1px solid ${colors.green}44`,
                }}>{v}</span>
                {i < step.visited.length - 1 && (
                  <span style={{ color: colors.muted, fontSize: 12 }}>→</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

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
