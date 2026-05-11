import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { colors } from '../../constants/theme'
import { Plus, Minus, Eye } from 'lucide-react'

const MAX_SIZE = 10

export default function StackVisualizer() {
  const [stack, setStack] = useState([42, 17, 8, 25])
  const [pushVal, setPushVal] = useState('')
  const [highlighted, setHighlighted] = useState(null) // { idx, type }
  const [error, setError] = useState('')
  const [log, setLog] = useState([])
  const [peeking, setPeeking] = useState(false)

  function addLog(msg) {
    setLog(prev => [msg, ...prev].slice(0, 6))
  }

  function handlePush() {
    const v = parseInt(pushVal)
    if (isNaN(v) || v < -9999 || v > 9999) { setError('Value must be -9999 to 9999'); return }
    if (stack.length >= MAX_SIZE) { setError('Stack overflow! Max size reached'); return }
    setError('')
    setStack(prev => [...prev, v])
    setHighlighted({ idx: stack.length, type: 'push' })
    addLog(`Push ${v}`)
    setTimeout(() => setHighlighted(null), 800)
    setPushVal('')
  }

  function handlePop() {
    if (stack.length === 0) { setError('Stack underflow! Stack is empty'); return }
    setError('')
    const topVal = stack[stack.length - 1]
    setHighlighted({ idx: stack.length - 1, type: 'pop' })
    addLog(`Pop → ${topVal}`)
    setTimeout(() => {
      setStack(prev => prev.slice(0, -1))
      setHighlighted(null)
    }, 400)
  }

  function handlePeek() {
    if (stack.length === 0) { setError('Stack is empty'); return }
    setError('')
    setPeeking(true)
    setHighlighted({ idx: stack.length - 1, type: 'peek' })
    addLog(`Peek → ${stack[stack.length - 1]}`)
    setTimeout(() => {
      setPeeking(false)
      setHighlighted(null)
    }, 1200)
  }

  const displayStack = [...stack].reverse() // show top at top

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 24px', gap: 18, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: colors.text }}>Stack (LIFO)</span>
        <span style={{
          padding: '2px 8px', borderRadius: 4, fontSize: 11,
          background: stack.length >= MAX_SIZE ? `${colors.red}18` : `${colors.blue}18`,
          color: stack.length >= MAX_SIZE ? colors.red : colors.blue,
          border: `1px solid ${stack.length >= MAX_SIZE ? colors.red : colors.blue}33`,
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          {stack.length}/{MAX_SIZE}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {/* Stack visual */}
        <div style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: 10,
          padding: '16px',
          width: 200,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: 0,
          position: 'relative',
        }}>
          {stack.length === 0 && (
            <div style={{ textAlign: 'center', color: colors.muted, fontSize: 13, padding: '20px 0', fontStyle: 'italic' }}>
              (empty)
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {displayStack.map((val, dispIdx) => {
              const actualIdx = stack.length - 1 - dispIdx
              const isTop = actualIdx === stack.length - 1
              const hlType = highlighted?.idx === actualIdx ? highlighted.type : null

              let bg = colors.panel
              let borderColor = colors.border
              let textColor = colors.text
              let shadow = 'none'

              if (hlType === 'push') { bg = `${colors.green}22`; borderColor = colors.green; textColor = colors.green; shadow = `0 0 10px ${colors.green}44` }
              if (hlType === 'pop') { bg = `${colors.red}22`; borderColor = colors.red; textColor = colors.red; shadow = `0 0 10px ${colors.red}44` }
              if (hlType === 'peek') { bg = `${colors.yellow}22`; borderColor = colors.yellow; textColor = colors.yellow; shadow = `0 0 10px ${colors.yellow}44` }

              return (
                <motion.div
                  key={`${actualIdx}-${val}`}
                  layout
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: 52, y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    background: bg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: dispIdx === 0 ? '6px 6px 0 0' : dispIdx === displayStack.length - 1 ? '0 0 6px 6px' : '0',
                    marginBottom: dispIdx < displayStack.length - 1 ? -1 : 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 12px',
                    boxShadow: shadow,
                    transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
                    zIndex: isTop ? 2 : 1,
                    position: 'relative',
                  }}
                >
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 18, fontWeight: 700,
                    color: textColor,
                    transition: 'color 0.2s',
                  }}>
                    {val}
                  </span>
                  {isTop && (
                    <span style={{
                      fontSize: 10, color: colors.cyan,
                      fontFamily: 'JetBrains Mono, monospace',
                      fontWeight: 700,
                      padding: '2px 5px',
                      background: `${colors.cyan}18`,
                      borderRadius: 3,
                      border: `1px solid ${colors.cyan}33`,
                    }}>TOP</span>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* Bottom label */}
          {stack.length > 0 && (
            <div style={{
              marginTop: 4,
              textAlign: 'center',
              fontSize: 10,
              color: colors.muted,
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              ── BOTTOM ──
            </div>
          )}
        </div>

        {/* Controls + log */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Operations */}
          <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operations</div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="number"
                value={pushVal}
                onChange={e => setPushVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePush()}
                placeholder="value"
                style={{
                  background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 4,
                  color: colors.text, fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
                  padding: '6px 10px', outline: 'none', width: 100,
                }}
              />
              <button onClick={handlePush} style={{
                padding: '6px 14px', borderRadius: 4, fontSize: 13, cursor: 'pointer',
                background: `${colors.green}22`, color: colors.green, border: `1px solid ${colors.green}`,
                display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500,
              }}>
                <Plus size={14} /> Push
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handlePop} style={{
                padding: '6px 14px', borderRadius: 4, fontSize: 13, cursor: 'pointer',
                background: `${colors.red}22`, color: colors.red, border: `1px solid ${colors.red}`,
                display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500,
              }}>
                <Minus size={14} /> Pop
              </button>
              <button onClick={handlePeek} style={{
                padding: '6px 14px', borderRadius: 4, fontSize: 13, cursor: 'pointer',
                background: `${colors.yellow}22`, color: colors.yellow, border: `1px solid ${colors.yellow}`,
                display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500,
              }}>
                <Eye size={14} /> Peek
              </button>
            </div>

            {error && (
              <div style={{ fontSize: 12, color: colors.red, fontFamily: 'JetBrains Mono, monospace' }}>
                ✗ {error}
              </div>
            )}
          </div>

          {/* Top value */}
          {stack.length > 0 && (
            <div style={{
              background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 12, color: colors.muted }}>Top:</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700, color: colors.cyan }}>
                {stack[stack.length - 1]}
              </span>
            </div>
          )}

          {/* Operation log */}
          {log.length > 0 && (
            <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operation Log</div>
              {log.map((entry, i) => (
                <div key={i} style={{
                  fontSize: 12, color: i === 0 ? colors.text : colors.muted,
                  fontFamily: 'JetBrains Mono, monospace',
                  padding: '2px 0',
                }}>
                  <span style={{ color: colors.muted, marginRight: 8 }}>{i === 0 ? '▶' : ' '}</span>
                  {entry}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '10px 14px', background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 12, color: colors.muted, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.6 }}>
        Push: O(1) | Pop: O(1) | Peek: O(1) | LIFO — Last In, First Out
      </div>
    </div>
  )
}
