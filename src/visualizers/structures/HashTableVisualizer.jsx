import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { colors } from '../../constants/theme'
import { Plus, Trash2, Search } from 'lucide-react'

const TABLE_SIZE = 7

function hashFn(key, size) {
  return ((key % size) + size) % size
}

function getInitialTable() {
  const table = Array.from({ length: TABLE_SIZE }, () => [])
  const initial = [{ k: 14, v: 'apple' }, { k: 21, v: 'banana' }, { k: 7, v: 'cherry' }, { k: 42, v: 'date' }]
  initial.forEach(({ k, v }) => {
    const h = hashFn(k, TABLE_SIZE)
    table[h].push({ key: k, value: v })
  })
  return table
}

export default function HashTableVisualizer() {
  const [table, setTable] = useState(getInitialTable)
  const [insertKey, setInsertKey] = useState('')
  const [insertVal, setInsertVal] = useState('')
  const [searchKey, setSearchKey] = useState('')
  const [deleteKey, setDeleteKey] = useState('')
  const [errors, setErrors] = useState({})
  const [animation, setAnimation] = useState(null) // { type, bucket, chainIdx, formula, key, value }
  const [log, setLog] = useState([])

  function addLog(msg) {
    setLog(prev => [msg, ...prev].slice(0, 6))
  }

  function totalElements() {
    return table.reduce((sum, chain) => sum + chain.length, 0)
  }

  function loadFactor() {
    return (totalElements() / TABLE_SIZE).toFixed(2)
  }

  function animateHash(key, callback) {
    const bucket = hashFn(key, TABLE_SIZE)
    const formula = `h(${key}) = ${key} % ${TABLE_SIZE} = ${bucket}`
    setAnimation({ type: 'hash', bucket, formula, key })
    setTimeout(() => {
      setAnimation({ type: 'bucket', bucket, formula, key })
      setTimeout(() => {
        callback(bucket)
        setAnimation(null)
      }, 600)
    }, 700)
  }

  function handleInsert() {
    const k = parseInt(insertKey)
    const v = insertVal.trim()
    if (isNaN(k) || k < 0 || k > 9999) { setErrors(e => ({ ...e, insert: 'Key: integer 0–9999' })); return }
    if (!v) { setErrors(e => ({ ...e, insert: 'Value cannot be empty' })); return }
    setErrors(e => ({ ...e, insert: '' }))

    animateHash(k, (bucket) => {
      setTable(prev => {
        const newTable = prev.map(chain => [...chain])
        const existingIdx = newTable[bucket].findIndex(item => item.key === k)
        if (existingIdx >= 0) {
          newTable[bucket][existingIdx].value = v
          addLog(`Update key ${k} in bucket ${bucket} → "${v}"`)
        } else {
          newTable[bucket].push({ key: k, value: v })
          addLog(`Insert {${k}: "${v}"} → bucket ${bucket}`)
        }
        return newTable
      })
      setAnimation({ type: 'inserted', bucket, key: k })
      setTimeout(() => setAnimation(null), 600)
    })
    setInsertKey(''); setInsertVal('')
  }

  function handleDelete() {
    const k = parseInt(deleteKey)
    if (isNaN(k)) { setErrors(e => ({ ...e, delete: 'Enter a key' })); return }

    animateHash(k, (bucket) => {
      const chain = table[bucket]
      const idx = chain.findIndex(item => item.key === k)
      if (idx === -1) {
        addLog(`Key ${k} not found in bucket ${bucket}`)
        setAnimation({ type: 'notfound', bucket, key: k })
        setTimeout(() => setAnimation(null), 600)
        return
      }
      setAnimation({ type: 'delete', bucket, chainIdx: idx, key: k })
      setTimeout(() => {
        setTable(prev => {
          const newTable = prev.map(chain => [...chain])
          newTable[bucket].splice(idx, 1)
          return newTable
        })
        addLog(`Delete key ${k} from bucket ${bucket}`)
        setAnimation(null)
      }, 500)
    })
    setDeleteKey('')
    setErrors(e => ({ ...e, delete: '' }))
  }

  function handleSearch() {
    const k = parseInt(searchKey)
    if (isNaN(k)) { setErrors(e => ({ ...e, search: 'Enter a key' })); return }

    animateHash(k, (bucket) => {
      const chain = table[bucket]
      const idx = chain.findIndex(item => item.key === k)
      if (idx === -1) {
        addLog(`Key ${k} not found (bucket ${bucket} checked)`)
        setAnimation({ type: 'notfound', bucket, key: k })
      } else {
        addLog(`Found key ${k} in bucket ${bucket}[${idx}] → "${chain[idx].value}"`)
        setAnimation({ type: 'found', bucket, chainIdx: idx, key: k })
      }
      setTimeout(() => setAnimation(null), 1200)
    })
    setSearchKey('')
    setErrors(e => ({ ...e, search: '' }))
  }

  const inputSty = (err) => ({
    background: colors.panel,
    border: `1px solid ${err ? colors.red : colors.border}`,
    borderRadius: 4,
    color: colors.text,
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 12,
    padding: '5px 8px',
    outline: 'none',
  })

  const btnSty = (c) => ({
    padding: '5px 10px', borderRadius: 4, fontSize: 12,
    background: `${c}22`, color: c, border: `1px solid ${c}`,
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 24px', gap: 16, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: colors.text }}>Hash Table</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: colors.muted }}>
          size={TABLE_SIZE} | h(k) = k % {TABLE_SIZE}
        </span>
        <span style={{
          padding: '2px 8px', borderRadius: 4, fontSize: 11,
          background: `${colors.orange}18`, color: colors.orange,
          border: `1px solid ${colors.orange}33`,
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          n={totalElements()} | λ={loadFactor()}
        </span>
      </div>

      {/* Hash formula animation */}
      <AnimatePresence>
        {animation?.type === 'hash' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              padding: '8px 14px',
              background: `${colors.yellow}18`,
              border: `1px solid ${colors.yellow}44`,
              borderRadius: 8,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 14,
              color: colors.yellow,
              fontWeight: 600,
            }}
          >
            🔑 Computing: {animation.formula}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table visualization */}
      <div style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        overflow: 'hidden',
      }}>
        {table.map((chain, bucketIdx) => {
          const isActiveBucket = animation?.bucket === bucketIdx
          const bucketColor = isActiveBucket
            ? (animation?.type === 'notfound' ? colors.red : animation?.type === 'found' ? colors.green : colors.yellow)
            : colors.muted

          return (
            <div
              key={bucketIdx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 0,
                borderBottom: bucketIdx < TABLE_SIZE - 1 ? `1px solid ${colors.border}` : 'none',
                background: isActiveBucket ? `${bucketColor}0a` : 'transparent',
                transition: 'background 0.2s',
                minHeight: 52,
              }}
            >
              {/* Bucket index */}
              <div style={{
                width: 52,
                height: '100%',
                minHeight: 52,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRight: `1px solid ${colors.border}`,
                background: isActiveBucket ? `${bucketColor}18` : colors.panel,
                flexShrink: 0,
                transition: 'background 0.2s',
              }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 14, fontWeight: 700,
                  color: isActiveBucket ? bucketColor : colors.muted,
                  transition: 'color 0.2s',
                }}>
                  [{bucketIdx}]
                </span>
              </div>

              {/* Chain */}
              <div style={{ flex: 1, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {chain.length === 0 ? (
                  <span style={{ fontSize: 12, color: `${colors.muted}55`, fontFamily: 'JetBrains Mono, monospace' }}>∅ empty</span>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {chain.map((item, chainIdx) => {
                      const isFoundItem = animation?.type === 'found' && animation.bucket === bucketIdx && animation.chainIdx === chainIdx
                      const isDeleteItem = animation?.type === 'delete' && animation.bucket === bucketIdx && animation.chainIdx === chainIdx
                      const isInsertItem = animation?.type === 'inserted' && animation.bucket === bucketIdx && item.key === animation.key

                      let nodeColor = colors.blue
                      let nodeBg = `${colors.blue}15`
                      if (isFoundItem) { nodeColor = colors.green; nodeBg = `${colors.green}22` }
                      if (isDeleteItem) { nodeColor = colors.red; nodeBg = `${colors.red}22` }
                      if (isInsertItem) { nodeColor = colors.green; nodeBg = `${colors.green}22` }

                      return (
                        <motion.div
                          key={`${item.key}-${chainIdx}`}
                          layout
                          initial={{ opacity: 0, scale: 0.7, x: -10 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ duration: 0.2 }}
                          style={{ display: 'flex', alignItems: 'center', gap: 3 }}
                        >
                          <div style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            background: nodeBg,
                            border: `1px solid ${nodeColor}44`,
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: 12,
                            color: nodeColor,
                            fontWeight: 600,
                            transition: 'all 0.2s',
                            boxShadow: isFoundItem || isInsertItem ? `0 0 8px ${nodeColor}44` : 'none',
                          }}>
                            <span style={{ color: colors.orange }}>{item.key}</span>
                            <span style={{ color: colors.muted }}>:</span>
                            <span style={{ color: colors.green, marginLeft: 2 }}>"{item.value}"</span>
                          </div>
                          {chainIdx < chain.length - 1 && (
                            <span style={{ color: `${colors.blue}88`, fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>→</span>
                          )}
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Operations */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: colors.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Insert / Update</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 10, color: colors.muted }}>Key</span>
              <input type="number" value={insertKey} onChange={e => setInsertKey(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleInsert()} style={{ ...inputSty(errors.insert), width: 64 }} placeholder="key" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 10, color: colors.muted }}>Value</span>
              <input type="text" value={insertVal} onChange={e => setInsertVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleInsert()} style={{ ...inputSty(errors.insert), width: 90 }} placeholder="value" />
            </div>
            <button onClick={handleInsert} style={{ ...btnSty(colors.green), marginTop: 16 }}>
              <Plus size={13} /> Insert
            </button>
          </div>
          {errors.insert && <div style={{ fontSize: 11, color: colors.red, marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>{errors.insert}</div>}
        </div>

        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: colors.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="number" value={searchKey} onChange={e => setSearchKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()} style={{ ...inputSty(errors.search), width: 70 }} placeholder="key" />
            <button onClick={handleSearch} style={btnSty(colors.cyan)}>
              <Search size={13} /> Search
            </button>
          </div>
          {errors.search && <div style={{ fontSize: 11, color: colors.red, marginTop: 4 }}>{errors.search}</div>}
        </div>

        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: colors.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delete</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="number" value={deleteKey} onChange={e => setDeleteKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDelete()} style={{ ...inputSty(errors.delete), width: 70 }} placeholder="key" />
            <button onClick={handleDelete} style={btnSty(colors.red)}>
              <Trash2 size={13} /> Delete
            </button>
          </div>
          {errors.delete && <div style={{ fontSize: 11, color: colors.red, marginTop: 4 }}>{errors.delete}</div>}
        </div>
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
        Insert/Search/Delete: O(1) avg, O(n) worst | Load factor λ={loadFactor()} | Separate chaining collision resolution
      </div>
    </div>
  )
}
