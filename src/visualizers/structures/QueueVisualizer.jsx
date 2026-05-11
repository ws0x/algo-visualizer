import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { colors } from '../../constants/theme'
import { Plus, ArrowRight, Eye } from 'lucide-react'

const MAX_SIZE = 10

export default function QueueVisualizer() {
  const [queue, setQueue] = useState([10, 25, 8, 42, 17])
  const [enqueueVal, setEnqueueVal] = useState('')
  const [highlighted, setHighlighted] = useState(null) // { idx, type }
  const [error, setError] = useState('')
  const [log, setLog] = useState([])

  function addLog(msg) {
    setLog(prev => [msg, ...prev].slice(0, 6))
  }

  function handleEnqueue() {
    const v = parseInt(enqueueVal)
    if (isNaN(v) || v < -9999 || v > 9999) { setError('Value -9999 to 9999'); return }
    if (queue.length >= MAX_SIZE) { setError('Queue full! Max size reached'); return }
    setError('')
    setQueue(prev => [...prev, v])
    setHighlighted({ idx: queue.length, type: 'enqueue' })
    addLog(`Enqueue ${v} (at rear)`)
    setTimeout(() => setHighlighted(null), 800)
    setEnqueueVal('')
  }

  function handleDequeue() {
    if (queue.length === 0) { setError('Queue is empty!'); return }
    setError('')
    const frontVal = queue[0]
    setHighlighted({ idx: 0, type: 'dequeue' })
    addLog(`Dequeue → ${frontVal} (from front)`)
    setTimeout(() => {
      setQueue(prev => prev.slice(1))
      setHighlighted(null)
    }, 450)
  }

  function handlePeek() {
    if (queue.length === 0) { setError('Queue is empty!'); return }
    setError('')
    setHighlighted({ idx: 0, type: 'peek' })
    addLog(`Peek → ${queue[0]} (front element)`)
    setTimeout(() => setHighlighted(null), 1200)
  }

  const CELL_W = 70
  const CELL_H = 64

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 24px', gap: 18, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: colors.text }}>Queue (FIFO)</span>
        <span style={{
          padding: '2px 8px', borderRadius: 4, fontSize: 11,
          background: queue.length >= MAX_SIZE ? `${colors.red}18` : `${colors.blue}18`,
          color: queue.length >= MAX_SIZE ? colors.red : colors.blue,
          border: `1px solid ${queue.length >= MAX_SIZE ? colors.red : colors.blue}33`,
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          {queue.length}/{MAX_SIZE}
        </span>
      </div>

      {/* Queue visualization */}
      <div style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        padding: '28px 20px 16px',
        overflowX: 'auto',
        minHeight: 140,
        position: 'relative',
      }}>
        {queue.length === 0 ? (
          <div style={{ color: colors.muted, fontSize: 13, fontStyle: 'italic', textAlign: 'center', padding: '16px 0' }}>
            Empty queue — enqueue an element to get started
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {/* Pointer labels */}
            <div style={{ display: 'flex', gap: 2, paddingLeft: 4, minWidth: 'fit-content' }}>
              <div style={{ width: CELL_W, textAlign: 'center' }}>
                <span style={{ fontSize: 10, color: colors.cyan, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>FRONT</span>
              </div>
              <div style={{ flex: 1 }} />
              {queue.length > 1 && (
                <div style={{ width: CELL_W, textAlign: 'center' }}>
                  <span style={{ fontSize: 10, color: colors.purple, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>REAR</span>
                </div>
              )}
            </div>

            {/* Queue cells */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 'fit-content' }}>
              {/* Dequeue arrow */}
              <div style={{ display: 'flex', alignItems: 'center', marginRight: 6 }}>
                <div style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderRight: `8px solid ${colors.red}` }} />
                <div style={{ width: 16, height: 2, background: colors.red }} />
              </div>

              <AnimatePresence mode="popLayout">
                {queue.map((val, i) => {
                  const isFront = i === 0
                  const isRear = i === queue.length - 1
                  const hlType = highlighted?.idx === i ? highlighted.type : null

                  let bg = colors.panel
                  let borderColor = colors.border
                  let textColor = colors.text
                  let shadow = 'none'

                  if (hlType === 'enqueue') { bg = `${colors.green}22`; borderColor = colors.green; textColor = colors.green; shadow = `0 0 10px ${colors.green}44` }
                  if (hlType === 'dequeue') { bg = `${colors.red}22`; borderColor = colors.red; textColor = colors.red; shadow = `0 0 10px ${colors.red}44` }
                  if (hlType === 'peek') { bg = `${colors.yellow}22`; borderColor = colors.yellow; textColor = colors.yellow; shadow = `0 0 10px ${colors.yellow}44` }
                  if (isFront && !hlType) borderColor = colors.cyan
                  if (isRear && !hlType) borderColor = colors.purple

                  return (
                    <motion.div
                      key={`${i}-${val}`}
                      layout
                      initial={{ opacity: 0, scale: 0.7, x: 30 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.7, x: -30 }}
                      transition={{ duration: 0.25 }}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <div style={{
                        width: CELL_W,
                        height: CELL_H,
                        background: bg,
                        border: `2px solid ${borderColor}`,
                        borderRadius: 0,
                        borderRight: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        boxShadow: shadow,
                        transition: 'background 0.2s, border-color 0.2s',
                        ...(i === 0 ? { borderRadius: '8px 0 0 8px', borderRight: 'none' } : {}),
                        ...(i === queue.length - 1 ? { borderRadius: i === 0 ? 8 : '0 8px 8px 0', borderRight: `2px solid ${borderColor}` } : {}),
                      }}>
                        <span style={{ fontSize: 10, color: colors.muted, fontFamily: 'JetBrains Mono, monospace' }}>
                          [{i}]
                        </span>
                        <span style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 18, fontWeight: 700,
                          color: textColor,
                          transition: 'color 0.2s',
                        }}>
                          {val}
                        </span>
                      </div>
                      {i < queue.length - 1 && (
                        <div style={{ width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: `8px solid ${borderColor}` }} />
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {/* Enqueue arrow */}
              <div style={{ display: 'flex', alignItems: 'center', marginLeft: 6 }}>
                <div style={{ width: 16, height: 2, background: colors.green }} />
                <div style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: `8px solid ${colors.green}` }} />
              </div>
            </div>

            {/* Direction labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: colors.muted, fontFamily: 'JetBrains Mono, monospace' }}>
              <span style={{ color: colors.red }}>← dequeue (front)</span>
              <span style={{ color: colors.green }}>enqueue (rear) →</span>
            </div>
          </div>
        )}
      </div>

      {/* Operations */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: colors.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enqueue</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="number" value={enqueueVal} onChange={e => setEnqueueVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEnqueue()}
              style={{
                background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 4,
                color: colors.text, fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
                padding: '5px 8px', outline: 'none', width: 80,
              }} placeholder="value" />
            <button onClick={handleEnqueue} style={{
              padding: '5px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer',
              background: `${colors.green}22`, color: colors.green, border: `1px solid ${colors.green}`,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Plus size={13} /> Enqueue
            </button>
          </div>
        </div>

        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dequeue / Peek</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleDequeue} style={{
              padding: '6px 14px', borderRadius: 4, fontSize: 12, cursor: 'pointer',
              background: `${colors.red}22`, color: colors.red, border: `1px solid ${colors.red}`,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <ArrowRight size={13} /> Dequeue
            </button>
            <button onClick={handlePeek} style={{
              padding: '6px 14px', borderRadius: 4, fontSize: 12, cursor: 'pointer',
              background: `${colors.yellow}22`, color: colors.yellow, border: `1px solid ${colors.yellow}`,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Eye size={13} /> Peek
            </button>
          </div>
        </div>

        {queue.length > 0 && (
          <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pointers</div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div>
                <span style={{ fontSize: 11, color: colors.cyan }}>Front: </span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700, color: colors.cyan }}>{queue[0]}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: colors.purple }}>Rear: </span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700, color: colors.purple }}>{queue[queue.length - 1]}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div style={{ fontSize: 12, color: colors.red, fontFamily: 'JetBrains Mono, monospace', padding: '6px 0' }}>✗ {error}</div>
      )}

      {/* Operation log */}
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
        Enqueue: O(1) | Dequeue: O(1) | Peek: O(1) | FIFO — First In, First Out
      </div>
    </div>
  )
}
