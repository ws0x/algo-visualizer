import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { colors } from '../../constants/theme'
import { Plus, Trash2, List } from 'lucide-react'

function getInitialArray() {
  return [10, 25, 8, 42, 17]
}

const CELL_SIZE = 64

export default function ArrayVisualizer() {
  const [items, setItems] = useState(getInitialArray)
  const [highlighted, setHighlighted] = useState({}) // index -> 'insert'|'delete'|'shift'
  const [insertIdx, setInsertIdx] = useState('')
  const [insertVal, setInsertVal] = useState('')
  const [deleteIdx, setDeleteIdx] = useState('')
  const [appendVal, setAppendVal] = useState('')
  const [errors, setErrors] = useState({})

  function clearHighlight(delay = 900) {
    setTimeout(() => setHighlighted({}), delay)
  }

  function handleInsert() {
    const idx = parseInt(insertIdx)
    const val = parseInt(insertVal)
    if (isNaN(idx) || idx < 0 || idx > items.length) {
      setErrors(e => ({ ...e, insert: `Index must be 0–${items.length}` }))
      return
    }
    if (isNaN(val) || val < 1 || val > 9999) {
      setErrors(e => ({ ...e, insert: 'Value must be 1–9999' }))
      return
    }
    if (items.length >= 18) {
      setErrors(e => ({ ...e, insert: 'Array full (max 18)' }))
      return
    }
    setErrors(e => ({ ...e, insert: '' }))

    // Highlight shifting elements
    const shiftMap = {}
    for (let i = idx; i < items.length; i++) shiftMap[i] = 'shift'
    setHighlighted(shiftMap)

    setTimeout(() => {
      setItems(prev => [...prev.slice(0, idx), val, ...prev.slice(idx)])
      setHighlighted({ [idx]: 'insert' })
      clearHighlight()
    }, 350)
    setInsertIdx('')
    setInsertVal('')
  }

  function handleDelete() {
    const idx = parseInt(deleteIdx)
    if (isNaN(idx) || idx < 0 || idx >= items.length) {
      setErrors(e => ({ ...e, delete: `Index must be 0–${items.length - 1}` }))
      return
    }
    setErrors(e => ({ ...e, delete: '' }))
    setHighlighted({ [idx]: 'delete' })

    setTimeout(() => {
      setItems(prev => {
        const newArr = [...prev]
        newArr.splice(idx, 1)
        return newArr
      })
      setHighlighted({})
    }, 450)
    setDeleteIdx('')
  }

  function handleAppend() {
    const val = parseInt(appendVal)
    if (isNaN(val) || val < 1 || val > 9999) {
      setErrors(e => ({ ...e, append: 'Value must be 1–9999' }))
      return
    }
    if (items.length >= 18) {
      setErrors(e => ({ ...e, append: 'Array full (max 18)' }))
      return
    }
    setErrors(e => ({ ...e, append: '' }))
    setItems(prev => [...prev, val])
    setHighlighted({ [items.length]: 'insert' })
    clearHighlight()
    setAppendVal('')
  }

  function cellBg(idx) {
    const h = highlighted[idx]
    if (h === 'insert') return `${colors.green}22`
    if (h === 'delete') return `${colors.red}22`
    if (h === 'shift') return `${colors.yellow}22`
    return colors.card
  }

  function cellBorder(idx) {
    const h = highlighted[idx]
    if (h === 'insert') return `2px solid ${colors.green}`
    if (h === 'delete') return `2px solid ${colors.red}`
    if (h === 'shift') return `2px solid ${colors.yellow}`
    return `1px solid ${colors.border}`
  }

  function cellTextColor(idx) {
    const h = highlighted[idx]
    if (h === 'insert') return colors.green
    if (h === 'delete') return colors.red
    if (h === 'shift') return colors.yellow
    return colors.text
  }

  const inputSty = (err) => ({
    background: colors.panel,
    border: `1px solid ${err ? colors.red : colors.border}`,
    borderRadius: 4,
    color: colors.text,
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 13,
    padding: '5px 8px',
    outline: 'none',
    width: 64,
  })

  const capacity = items.length + 2

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 24px', gap: 20, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <List size={16} color={colors.blue} />
        <span style={{ fontSize: 15, fontWeight: 600, color: colors.text }}>Array</span>
        <span style={{
          padding: '2px 8px', borderRadius: 4, fontSize: 11,
          background: `${colors.blue}18`, color: colors.blue,
          border: `1px solid ${colors.blue}33`,
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          length: {items.length} / capacity: {capacity}
        </span>
      </div>

      {/* Array visualization */}
      <div style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        padding: '24px 20px 16px',
        overflowX: 'auto',
      }}>
        <div style={{ display: 'flex', gap: 4, minWidth: 'fit-content' }}>
          <AnimatePresence mode="popLayout">
            {items.map((val, i) => (
              <motion.div
                key={`${i}-${val}`}
                layout
                initial={{ opacity: 0, scale: 0.7, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.7, y: 20 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
              >
                <div style={{
                  width: CELL_SIZE, height: CELL_SIZE,
                  background: cellBg(i),
                  border: cellBorder(i),
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  transition: 'background 0.2s, border-color 0.2s',
                  position: 'relative',
                }}>
                  <span style={{ fontSize: 10, color: colors.muted, position: 'absolute', top: 5, left: 0, right: 0, textAlign: 'center', fontFamily: 'JetBrains Mono, monospace' }}>
                    [{i}]
                  </span>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 18, fontWeight: 700,
                    color: cellTextColor(i),
                    transition: 'color 0.2s',
                  }}>
                    {val}
                  </span>
                </div>
              </motion.div>
            ))}

            {/* Capacity ghost cells */}
            {Array.from({ length: 2 }).map((_, i) => (
              <motion.div
                key={`ghost-${i}`}
                layout
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
              >
                <div style={{
                  width: CELL_SIZE, height: CELL_SIZE,
                  background: 'transparent',
                  border: `1px dashed ${colors.border}33`,
                  borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 10, color: `${colors.muted}44`, fontFamily: 'JetBrains Mono, monospace' }}>—</span>
                </div>
                <span style={{ fontSize: 10, color: `${colors.muted}44`, fontFamily: 'JetBrains Mono, monospace' }}>
                  [{items.length + i}]
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Operations */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {/* Insert at index */}
        <div style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: 8, padding: '12px 14px',
        }}>
          <div style={{ fontSize: 11, color: colors.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Insert at Index
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 10, color: colors.muted }}>Index (0–{items.length})</span>
              <input type="number" value={insertIdx} onChange={e => setInsertIdx(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleInsert()}
                style={inputSty(errors.insert)} placeholder="idx" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 10, color: colors.muted }}>Value</span>
              <input type="number" value={insertVal} onChange={e => setInsertVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleInsert()}
                style={inputSty(errors.insert)} placeholder="val" />
            </div>
            <button onClick={handleInsert} style={{
              marginTop: 18, padding: '5px 12px', borderRadius: 4, fontSize: 12,
              background: `${colors.green}22`, color: colors.green,
              border: `1px solid ${colors.green}`, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Plus size={13} /> Insert
            </button>
          </div>
          {errors.insert && <div style={{ fontSize: 11, color: colors.red, marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>{errors.insert}</div>}
        </div>

        {/* Append */}
        <div style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: 8, padding: '12px 14px',
        }}>
          <div style={{ fontSize: 11, color: colors.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Append
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 10, color: colors.muted }}>Value</span>
              <input type="number" value={appendVal} onChange={e => setAppendVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAppend()}
                style={inputSty(errors.append)} placeholder="val" />
            </div>
            <button onClick={handleAppend} style={{
              marginTop: 18, padding: '5px 12px', borderRadius: 4, fontSize: 12,
              background: `${colors.blue}22`, color: colors.blue,
              border: `1px solid ${colors.blue}`, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Plus size={13} /> Append
            </button>
          </div>
          {errors.append && <div style={{ fontSize: 11, color: colors.red, marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>{errors.append}</div>}
        </div>

        {/* Delete */}
        <div style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: 8, padding: '12px 14px',
        }}>
          <div style={{ fontSize: 11, color: colors.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Delete at Index
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 10, color: colors.muted }}>Index (0–{items.length - 1})</span>
              <input type="number" value={deleteIdx} onChange={e => setDeleteIdx(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleDelete()}
                style={inputSty(errors.delete)} placeholder="idx" />
            </div>
            <button onClick={handleDelete} style={{
              marginTop: 18, padding: '5px 12px', borderRadius: 4, fontSize: 12,
              background: `${colors.red}22`, color: colors.red,
              border: `1px solid ${colors.red}`, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Trash2 size={13} /> Delete
            </button>
          </div>
          {errors.delete && <div style={{ fontSize: 11, color: colors.red, marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>{errors.delete}</div>}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12 }}>
        {[
          { color: colors.green, label: 'Inserted' },
          { color: colors.red, label: 'Deleted' },
          { color: colors.yellow, label: 'Shifted' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
            <span style={{ fontSize: 11, color: colors.muted }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{
        padding: '10px 14px',
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        fontSize: 12,
        color: colors.muted,
        fontFamily: 'JetBrains Mono, monospace',
        lineHeight: 1.6,
      }}>
        Access: O(1) | Insert/Delete at end: O(1) amortized | Insert/Delete at index: O(n) due to shifting
      </div>
    </div>
  )
}
