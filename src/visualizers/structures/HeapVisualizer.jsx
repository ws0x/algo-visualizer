import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { colors } from '../../constants/theme'
import { Plus, Minus } from 'lucide-react'

const NODE_R = 22

function computeHeapLayout(arr) {
  const nodes = arr.map((val, i) => {
    const depth = Math.floor(Math.log2(i + 1))
    const posInLevel = i - (Math.pow(2, depth) - 1)
    const nodesInLevel = Math.pow(2, depth)
    const totalWidth = 560
    const x = totalWidth * (posInLevel + 0.5) / nodesInLevel
    const y = depth * 70 + 36
    return { val, index: i, x, y }
  })
  const edges = arr.map((_, i) => {
    if (i === 0) return null
    const parent = Math.floor((i - 1) / 2)
    return { from: parent, to: i }
  }).filter(Boolean)
  return { nodes, edges }
}

export default function HeapVisualizer() {
  const [heapType, setHeapType] = useState('max')
  const [heap, setHeap] = useState([90, 42, 75, 17, 25, 60, 50])
  const [insertVal, setInsertVal] = useState('')
  const [error, setError] = useState('')
  const [steps, setSteps] = useState([])
  const [stepIdx, setStepIdx] = useState(-1)
  const [log, setLog] = useState([])

  function addLog(msg) {
    setLog(prev => [msg, ...prev].slice(0, 6))
  }

  function siftUp(arr, i, isMax) {
    const ops = []
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2)
      ops.push({ array: [...arr], comparing: [i, parent], info: `Comparing a[${i}]=${arr[i]} with parent a[${parent}]=${arr[parent]}` })
      const shouldSwap = isMax ? arr[i] > arr[parent] : arr[i] < arr[parent]
      if (shouldSwap) {
        ;[arr[i], arr[parent]] = [arr[parent], arr[i]]
        ops.push({ array: [...arr], swapping: [i, parent], info: `Swapping — heap property violated` })
        i = parent
      } else {
        ops.push({ array: [...arr], info: `Heap property satisfied — done sifting up` })
        break
      }
    }
    return ops
  }

  function siftDown(arr, i, end, isMax) {
    const ops = []
    while (true) {
      const left = 2 * i + 1
      const right = 2 * i + 2
      let target = i

      if (left < end) {
        ops.push({ array: [...arr], comparing: [i, left], info: `Comparing a[${i}]=${arr[i]} with left child a[${left}]=${arr[left]}` })
        if (isMax ? arr[left] > arr[target] : arr[left] < arr[target]) target = left
      }
      if (right < end) {
        ops.push({ array: [...arr], comparing: [i, right], info: `Comparing a[${i}]=${arr[i]} with right child a[${right}]=${arr[right]}` })
        if (isMax ? arr[right] > arr[target] : arr[right] < arr[target]) target = right
      }

      if (target !== i) {
        ;[arr[i], arr[target]] = [arr[target], arr[i]]
        ops.push({ array: [...arr], swapping: [i, target], info: `Swapping a[${i}] and a[${target}]` })
        i = target
      } else {
        ops.push({ array: [...arr], info: `Heap property satisfied at index ${i}` })
        break
      }
    }
    return ops
  }

  function playSteps(newSteps, finalArr, msg) {
    setSteps(newSteps)
    setStepIdx(0)
    addLog(msg)

    let i = 0
    function advance() {
      i++
      if (i < newSteps.length) {
        setStepIdx(i)
        setTimeout(advance, 600)
      } else {
        setHeap(finalArr)
        setTimeout(() => { setSteps([]); setStepIdx(-1) }, 400)
      }
    }
    setTimeout(advance, 600)
  }

  function handleInsert() {
    const v = parseInt(insertVal)
    if (isNaN(v) || v < 1 || v > 9999) { setError('Value 1–9999'); return }
    if (heap.length >= 15) { setError('Max 15 elements'); return }
    setError('')
    setInsertVal('')

    const arr = [...heap, v]
    const insertStep = { array: [...arr], inserting: arr.length - 1, info: `Insert ${v} at index ${arr.length - 1}` }
    const siftOps = siftUp(arr, arr.length - 1, heapType === 'max')
    playSteps([insertStep, ...siftOps], arr, `Insert ${v}`)
  }

  function handleExtract() {
    if (heap.length === 0) { setError('Heap is empty'); return }
    setError('')

    const arr = [...heap]
    const extracted = arr[0]
    const last = arr.pop()

    if (arr.length === 0) {
      setHeap([])
      addLog(`Extract ${extracted} — heap now empty`)
      return
    }

    arr[0] = last
    const extractStep = { array: [extracted, ...arr.slice(1)], swapping: [0, heap.length - 1], info: `Move last element ${last} to root, remove ${extracted}` }
    const replaceStep = { array: [...arr], info: `Root is now ${arr[0]} — sifting down` }
    const siftOps = siftDown(arr, 0, arr.length, heapType === 'max')
    playSteps([extractStep, replaceStep, ...siftOps], arr, `Extract ${heapType === 'max' ? 'max' : 'min'}: ${extracted}`)
  }

  const currentArr = steps.length > 0 && stepIdx >= 0 ? (steps[stepIdx]?.array || heap) : heap
  const currentComparing = steps.length > 0 && stepIdx >= 0 ? (steps[stepIdx]?.comparing || []) : []
  const currentSwapping = steps.length > 0 && stepIdx >= 0 ? (steps[stepIdx]?.swapping || []) : []
  const currentInserting = steps.length > 0 && stepIdx >= 0 ? steps[stepIdx]?.inserting : -1
  const currentInfo = steps.length > 0 && stepIdx >= 0 ? steps[stepIdx]?.info : ''

  const layout = computeHeapLayout(currentArr)

  function nodeColor(i) {
    if (currentSwapping.includes(i)) return colors.red
    if (currentComparing.includes(i)) return colors.yellow
    if (currentInserting === i) return colors.green
    if (i === 0) return heapType === 'max' ? colors.purple : colors.cyan
    return colors.border
  }

  function nodeStroke(i) {
    if (currentSwapping.includes(i)) return colors.red
    if (currentComparing.includes(i)) return colors.yellow
    if (currentInserting === i) return colors.green
    if (i === 0) return heapType === 'max' ? colors.purple : colors.cyan
    return colors.muted
  }

  const svgHeight = Math.max(200, (Math.floor(Math.log2(currentArr.length)) + 1) * 70 + 50)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 24px', gap: 16, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: colors.text }}>Heap</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {['max', 'min'].map(type => (
            <button key={type} onClick={() => { setHeapType(type); setHeap([]) }} style={{
              padding: '4px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer',
              background: heapType === type ? `${colors.purple}22` : colors.card,
              color: heapType === type ? colors.purple : colors.muted,
              border: `1px solid ${heapType === type ? colors.purple : colors.border}`,
              transition: 'all 0.15s',
            }}>
              {type === 'max' ? 'Max-Heap' : 'Min-Heap'}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 12, color: colors.muted, fontFamily: 'JetBrains Mono, monospace' }}>
          {currentArr.length} elements
        </span>
      </div>

      {/* Tree visualization */}
      <div style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        overflow: 'hidden',
        minHeight: 200,
      }}>
        <svg width="100%" height={svgHeight} viewBox={`0 0 560 ${svgHeight}`}>
          {layout.edges.map((e, i) => {
            const fromNode = layout.nodes[e.from]
            const toNode = layout.nodes[e.to]
            if (!fromNode || !toNode) return null
            const isActive = currentComparing.includes(e.from) && currentComparing.includes(e.to) ||
                             currentSwapping.includes(e.from) && currentSwapping.includes(e.to)
            return (
              <line key={i}
                x1={fromNode.x} y1={fromNode.y}
                x2={toNode.x} y2={toNode.y}
                stroke={isActive ? colors.yellow : `${colors.muted}44`}
                strokeWidth={isActive ? 2 : 1.5}
                style={{ transition: 'stroke 0.2s' }}
              />
            )
          })}

          {layout.nodes.map((node, i) => {
            const nc = nodeColor(i)
            const ns = nodeStroke(i)
            return (
              <g key={i}>
                <circle
                  cx={node.x} cy={node.y} r={NODE_R}
                  fill={`${nc}22`}
                  stroke={ns}
                  strokeWidth={currentComparing.includes(i) || currentSwapping.includes(i) ? 2.5 : 1.5}
                  style={{ filter: currentSwapping.includes(i) ? `drop-shadow(0 0 6px ${colors.red})` : currentComparing.includes(i) ? `drop-shadow(0 0 4px ${colors.yellow})` : 'none', transition: 'all 0.2s' }}
                />
                <text
                  x={node.x} y={node.y + 5}
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize={13} fontWeight="700"
                  fill={nc}
                  style={{ transition: 'fill 0.2s' }}
                >
                  {node.val}
                </text>
                <text
                  x={node.x} y={node.y + NODE_R + 12}
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize={9}
                  fill={colors.muted}
                >
                  [{i}]
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Array representation */}
      <div style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        padding: '12px 16px',
      }}>
        <div style={{ fontSize: 11, color: colors.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Array Representation</div>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {currentArr.map((val, i) => {
            const nc = nodeColor(i)
            return (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}>
                <div style={{
                  width: 44, height: 44,
                  background: currentComparing.includes(i) || currentSwapping.includes(i) || currentInserting === i ? `${nc}22` : colors.panel,
                  border: `1px solid ${nc}`,
                  borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 14, fontWeight: 700,
                  color: nc,
                  transition: 'all 0.2s',
                  boxShadow: currentComparing.includes(i) || currentSwapping.includes(i) ? `0 0 6px ${nc}44` : 'none',
                }}>
                  {val}
                </div>
                <span style={{ fontSize: 9, color: colors.muted, fontFamily: 'JetBrains Mono, monospace' }}>[{i}]</span>
              </div>
            )
          })}
          {currentArr.length === 0 && (
            <span style={{ fontSize: 12, color: colors.muted, fontStyle: 'italic' }}>Empty heap</span>
          )}
        </div>
        {currentInfo && (
          <div style={{
            marginTop: 8,
            padding: '6px 10px',
            background: colors.panel,
            borderRadius: 4,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            color: currentSwapping.length > 0 ? colors.red : currentComparing.length > 0 ? colors.yellow : colors.green,
          }}>
            {currentInfo}
          </div>
        )}
      </div>

      {/* Operations */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: colors.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Insert</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="number" value={insertVal} onChange={e => setInsertVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleInsert()}
              style={{
                background: colors.panel, border: `1px solid ${error ? colors.red : colors.border}`,
                borderRadius: 4, color: colors.text, fontFamily: 'JetBrains Mono, monospace',
                fontSize: 13, padding: '5px 8px', outline: 'none', width: 80,
              }} placeholder="value" />
            <button onClick={handleInsert} disabled={steps.length > 0} style={{
              padding: '5px 12px', borderRadius: 4, fontSize: 12, cursor: steps.length > 0 ? 'not-allowed' : 'pointer',
              background: `${colors.green}22`, color: colors.green, border: `1px solid ${colors.green}`,
              display: 'flex', alignItems: 'center', gap: 4, opacity: steps.length > 0 ? 0.5 : 1,
            }}>
              <Plus size={13} /> Insert
            </button>
          </div>
          {error && <div style={{ fontSize: 11, color: colors.red, marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>{error}</div>}
        </div>

        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Extract {heapType === 'max' ? 'Max' : 'Min'}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={handleExtract} disabled={steps.length > 0} style={{
              padding: '6px 14px', borderRadius: 4, fontSize: 12, cursor: steps.length > 0 ? 'not-allowed' : 'pointer',
              background: `${colors.red}22`, color: colors.red, border: `1px solid ${colors.red}`,
              display: 'flex', alignItems: 'center', gap: 4, opacity: steps.length > 0 ? 0.5 : 1,
            }}>
              <Minus size={13} /> Extract {heapType === 'max' ? 'Max' : 'Min'}
            </button>
            {heap.length > 0 && (
              <span style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700,
                color: heapType === 'max' ? colors.purple : colors.cyan,
              }}>
                = {heap[0]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          { color: heapType === 'max' ? colors.purple : colors.cyan, label: 'Root (max/min)' },
          { color: colors.yellow, label: 'Comparing' },
          { color: colors.red, label: 'Swapping' },
          { color: colors.green, label: 'Inserting' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 11, color: colors.muted }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Log */}
      {log.length > 0 && (
        <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '10px 14px' }}>
          <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operation Log</div>
          {log.map((entry, i) => (
            <div key={i} style={{ fontSize: 12, color: i === 0 ? colors.text : colors.muted, fontFamily: 'JetBrains Mono, monospace', padding: '2px 0' }}>
              <span style={{ color: colors.muted, marginRight: 8 }}>{i === 0 ? '▶' : ' '}</span>
              {entry}
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: '10px 14px', background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 12, color: colors.muted, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.6 }}>
        Insert: O(log n) | Extract: O(log n) | Peek: O(1) | Parent: ⌊(i-1)/2⌋ | Children: 2i+1, 2i+2
      </div>
    </div>
  )
}
