import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { colors } from '../../constants/theme'
import { Plus, Trash2, Search } from 'lucide-react'

let nodeCounter = 10

function makeNode(value) {
  return { id: nodeCounter++, value }
}

function getInitialList() {
  return [makeNode(10), makeNode(25), makeNode(8), makeNode(42)]
}

export default function LinkedListVisualizer() {
  const [nodes, setNodes] = useState(getInitialList)
  const [highlighted, setHighlighted] = useState({}) // id -> 'new'|'delete'|'search'|'found'
  const [headVal, setHeadVal] = useState('')
  const [tailVal, setTailVal] = useState('')
  const [posIdx, setPosIdx] = useState('')
  const [posVal, setPosVal] = useState('')
  const [delIdx, setDelIdx] = useState('')
  const [searchVal, setSearchVal] = useState('')
  const [errors, setErrors] = useState({})
  const [log, setLog] = useState([])

  function addLog(msg) {
    setLog(prev => [msg, ...prev].slice(0, 8))
  }

  function clearHighlight(delay = 800) {
    setTimeout(() => setHighlighted({}), delay)
  }

  function insertHead() {
    const v = parseInt(headVal)
    if (isNaN(v) || v < 1 || v > 9999) { setErrors(e => ({ ...e, head: 'Value 1–9999' })); return }
    if (nodes.length >= 12) { setErrors(e => ({ ...e, head: 'Max 12 nodes' })); return }
    setErrors(e => ({ ...e, head: '' }))
    const node = makeNode(v)
    setNodes(prev => [node, ...prev])
    setHighlighted({ [node.id]: 'new' })
    addLog(`Insert ${v} at head`)
    clearHighlight()
    setHeadVal('')
  }

  function insertTail() {
    const v = parseInt(tailVal)
    if (isNaN(v) || v < 1 || v > 9999) { setErrors(e => ({ ...e, tail: 'Value 1–9999' })); return }
    if (nodes.length >= 12) { setErrors(e => ({ ...e, tail: 'Max 12 nodes' })); return }
    setErrors(e => ({ ...e, tail: '' }))
    const node = makeNode(v)
    setNodes(prev => [...prev, node])
    setHighlighted({ [node.id]: 'new' })
    addLog(`Insert ${v} at tail`)
    clearHighlight()
    setTailVal('')
  }

  function insertAtPos() {
    const idx = parseInt(posIdx)
    const v = parseInt(posVal)
    if (isNaN(v) || v < 1 || v > 9999) { setErrors(e => ({ ...e, pos: 'Value 1–9999' })); return }
    if (isNaN(idx) || idx < 0 || idx > nodes.length) { setErrors(e => ({ ...e, pos: `Index 0–${nodes.length}` })); return }
    if (nodes.length >= 12) { setErrors(e => ({ ...e, pos: 'Max 12 nodes' })); return }
    setErrors(e => ({ ...e, pos: '' }))
    const node = makeNode(v)
    setNodes(prev => [...prev.slice(0, idx), node, ...prev.slice(idx)])
    setHighlighted({ [node.id]: 'new' })
    addLog(`Insert ${v} at position ${idx}`)
    clearHighlight()
    setPosIdx(''); setPosVal('')
  }

  function deleteAtPos() {
    const idx = parseInt(delIdx)
    if (isNaN(idx) || idx < 0 || idx >= nodes.length) { setErrors(e => ({ ...e, del: `Index 0–${nodes.length - 1}` })); return }
    setErrors(e => ({ ...e, del: '' }))
    const toDelete = nodes[idx]
    setHighlighted({ [toDelete.id]: 'delete' })
    addLog(`Delete node at position ${idx} (value=${toDelete.value})`)
    setTimeout(() => {
      setNodes(prev => prev.filter((_, i) => i !== idx))
      setHighlighted({})
    }, 450)
    setDelIdx('')
  }

  function searchNode() {
    const v = parseInt(searchVal)
    if (isNaN(v)) { setErrors(e => ({ ...e, search: 'Enter a number' })); return }
    setErrors(e => ({ ...e, search: '' }))
    addLog(`Searching for ${v}...`)

    // Animate traversal
    let i = 0
    const found = nodes.findIndex(n => n.value === v)

    function step() {
      if (i > nodes.length) return
      if (i < nodes.length) {
        const node = nodes[i]
        setHighlighted({ [node.id]: i === found ? 'found' : 'search' })
        if (i === found) {
          addLog(`Found ${v} at position ${found}`)
          setTimeout(() => setHighlighted({}), 1200)
          return
        }
      } else {
        addLog(`${v} not found`)
        setHighlighted({})
        return
      }
      i++
      setTimeout(step, 350)
    }
    step()
    setSearchVal('')
  }

  function cellColor(id) {
    const h = highlighted[id]
    if (h === 'new') return colors.green
    if (h === 'delete') return colors.red
    if (h === 'search') return colors.yellow
    if (h === 'found') return colors.green
    return colors.muted
  }

  function cellBg(id) {
    const h = highlighted[id]
    if (h === 'new') return `${colors.green}22`
    if (h === 'delete') return `${colors.red}22`
    if (h === 'search') return `${colors.yellow}22`
    if (h === 'found') return `${colors.green}33`
    return colors.card
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
    width: 60,
  })

  const btnSty = (c) => ({
    padding: '5px 10px', borderRadius: 4, fontSize: 12,
    background: `${c}22`, color: c, border: `1px solid ${c}`,
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
    transition: 'all 0.15s',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 24px', gap: 18, overflowY: 'auto' }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: colors.text }}>
        Singly Linked List
        <span style={{ fontSize: 12, color: colors.muted, marginLeft: 10 }}>({nodes.length} nodes)</span>
      </div>

      {/* Linked list visualization */}
      <div style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        padding: '28px 20px 16px',
        overflowX: 'auto',
        minHeight: 130,
        position: 'relative',
      }}>
        {nodes.length === 0 ? (
          <div style={{ color: colors.muted, fontSize: 13, fontStyle: 'italic', textAlign: 'center', marginTop: 20 }}>
            Empty list — insert a node to get started
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 'fit-content', paddingTop: 6 }}>
            {/* Head pointer */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 6 }}>
              <span style={{ fontSize: 10, color: colors.cyan, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>HEAD</span>
              <span style={{ color: colors.cyan, fontSize: 16, lineHeight: 1 }}>↓</span>
            </div>

            <AnimatePresence mode="popLayout">
              {nodes.map((node, i) => (
                <motion.div
                  key={node.id}
                  layout
                  initial={{ opacity: 0, scale: 0.7, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.7, x: 20 }}
                  transition={{ duration: 0.25 }}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  {/* Node box */}
                  <div style={{
                    display: 'flex',
                    border: `2px solid ${cellColor(node.id)}`,
                    borderRadius: 8,
                    overflow: 'hidden',
                    boxShadow: highlighted[node.id] ? `0 0 10px ${cellColor(node.id)}44` : 'none',
                    transition: 'all 0.2s',
                    background: cellBg(node.id),
                  }}>
                    {/* Value cell */}
                    <div style={{
                      width: 56, height: 56,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      borderRight: `1px solid ${cellColor(node.id)}44`,
                    }}>
                      <span style={{ fontSize: 10, color: colors.muted, fontFamily: 'JetBrains Mono, monospace' }}>val</span>
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 16, fontWeight: 700,
                        color: cellColor(node.id),
                        transition: 'color 0.2s',
                      }}>
                        {node.value}
                      </span>
                    </div>
                    {/* Next pointer cell */}
                    <div style={{
                      width: 36, height: 56,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <span style={{
                        fontSize: 12,
                        color: i < nodes.length - 1 ? colors.blue : colors.red,
                        fontFamily: 'JetBrains Mono, monospace',
                      }}>
                        {i < nodes.length - 1 ? '*' : '∅'}
                      </span>
                    </div>
                  </div>

                  {/* Arrow to next */}
                  {i < nodes.length - 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 2 }}>
                      <div style={{ width: 14, height: 2, background: colors.blue }} />
                      <div style={{
                        width: 0, height: 0,
                        borderTop: '5px solid transparent',
                        borderBottom: '5px solid transparent',
                        borderLeft: `7px solid ${colors.blue}`,
                      }} />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* NULL */}
            <div style={{ marginLeft: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 2, background: colors.red }} />
              <div style={{
                padding: '3px 8px', borderRadius: 4,
                background: `${colors.red}18`, border: `1px solid ${colors.red}44`,
                fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
                color: colors.red,
              }}>NULL</div>
            </div>
          </div>
        )}
      </div>

      {/* Operations */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Insert Head</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="number" value={headVal} onChange={e => setHeadVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && insertHead()} style={inputSty(errors.head)} placeholder="val" />
            <button onClick={insertHead} style={btnSty(colors.green)}><Plus size={13} /> Head</button>
          </div>
          {errors.head && <div style={{ fontSize: 11, color: colors.red, marginTop: 4 }}>{errors.head}</div>}
        </div>

        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Insert Tail</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="number" value={tailVal} onChange={e => setTailVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && insertTail()} style={inputSty(errors.tail)} placeholder="val" />
            <button onClick={insertTail} style={btnSty(colors.blue)}><Plus size={13} /> Tail</button>
          </div>
          {errors.tail && <div style={{ fontSize: 11, color: colors.red, marginTop: 4 }}>{errors.tail}</div>}
        </div>

        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Insert at Position</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="number" value={posIdx} onChange={e => setPosIdx(e.target.value)} style={inputSty(errors.pos)} placeholder="idx" />
            <input type="number" value={posVal} onChange={e => setPosVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && insertAtPos()} style={inputSty(errors.pos)} placeholder="val" />
            <button onClick={insertAtPos} style={btnSty(colors.purple)}><Plus size={13} /> Pos</button>
          </div>
          {errors.pos && <div style={{ fontSize: 11, color: colors.red, marginTop: 4 }}>{errors.pos}</div>}
        </div>

        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delete at Position</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="number" value={delIdx} onChange={e => setDelIdx(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && deleteAtPos()} style={inputSty(errors.del)} placeholder="idx" />
            <button onClick={deleteAtPos} style={btnSty(colors.red)}><Trash2 size={13} /> Del</button>
          </div>
          {errors.del && <div style={{ fontSize: 11, color: colors.red, marginTop: 4 }}>{errors.del}</div>}
        </div>

        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="number" value={searchVal} onChange={e => setSearchVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchNode()} style={inputSty(errors.search)} placeholder="val" />
            <button onClick={searchNode} style={btnSty(colors.cyan)}><Search size={13} /> Find</button>
          </div>
          {errors.search && <div style={{ fontSize: 11, color: colors.red, marginTop: 4 }}>{errors.search}</div>}
        </div>
      </div>

      {/* Operation log */}
      {log.length > 0 && (
        <div style={{
          background: colors.panel,
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          padding: '10px 14px',
        }}>
          <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operation Log</div>
          {log.map((entry, i) => (
            <div key={i} style={{
              fontSize: 12, color: i === 0 ? colors.text : colors.muted,
              fontFamily: 'JetBrains Mono, monospace',
              padding: '2px 0',
              borderBottom: i < log.length - 1 ? `1px solid ${colors.border}33` : 'none',
            }}>
              <span style={{ color: colors.muted, marginRight: 8 }}>{i === 0 ? '▶' : ' '}</span>
              {entry}
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: '10px 14px', background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 12, color: colors.muted, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.6 }}>
        Access: O(n) | Insert/Delete at head: O(1) | Insert/Delete at tail: O(n) | Search: O(n)
      </div>
    </div>
  )
}
