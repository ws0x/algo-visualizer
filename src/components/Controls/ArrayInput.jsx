import { useState } from 'react'
import { Shuffle, Check, Search } from 'lucide-react'
import { colors } from '../../constants/theme'

const SIZE_OPTIONS = [5, 10, 15, 20]

function inputStyle(focused) {
  return {
    background: colors.card,
    border: `1px solid ${focused ? colors.blue : colors.border}`,
    borderRadius: 4,
    color: colors.text,
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 13,
    padding: '5px 10px',
    outline: 'none',
    transition: 'border-color 0.15s',
  }
}

export default function ArrayInput({ onArrayChange, onTargetChange, showTarget, maxValues = 20, currentArray, currentTarget }) {
  const [inputText, setInputText] = useState(currentArray ? currentArray.join(', ') : '64, 34, 25, 12, 22, 11, 90')
  const [targetText, setTargetText] = useState(currentTarget !== undefined ? String(currentTarget) : '25')
  const [genSize, setGenSize] = useState(10)
  const [error, setError] = useState('')
  const [inputFocused, setInputFocused] = useState(false)
  const [targetFocused, setTargetFocused] = useState(false)

  function validate(arr) {
    if (arr.length === 0) return 'Enter at least 1 value'
    if (arr.length > maxValues) return `Max ${maxValues} values`
    if (arr.some(v => isNaN(v) || v < 1 || v > 999 || !Number.isInteger(v)))
      return 'Only positive integers 1–999'
    return ''
  }

  function handleApply() {
    const parts = inputText.split(',').map(s => parseInt(s.trim(), 10))
    const err = validate(parts)
    if (err) { setError(err); return }
    setError('')
    onArrayChange(parts)
    if (showTarget && onTargetChange) {
      const t = parseInt(targetText, 10)
      if (!isNaN(t) && t >= 1 && t <= 999) onTargetChange(t)
    }
  }

  function handleGenerate() {
    const arr = Array.from({ length: genSize }, () => Math.floor(Math.random() * 99) + 1)
    setInputText(arr.join(', '))
    setError('')
    onArrayChange(arr)
    if (showTarget && onTargetChange) {
      const t = arr[Math.floor(Math.random() * arr.length)]
      setTargetText(String(t))
      onTargetChange(t)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleApply()
  }

  return (
    <div style={{
      background: colors.panel,
      border: `1px solid ${colors.border}`,
      borderRadius: 8,
      padding: '12px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: colors.muted, whiteSpace: 'nowrap' }}>Array</span>
        <input
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          placeholder="e.g. 5, 3, 1, 8, 2"
          style={{ ...inputStyle(inputFocused), flex: 1, minWidth: 160 }}
        />

        {showTarget && (
          <>
            <span style={{ fontSize: 12, color: colors.muted, whiteSpace: 'nowrap' }}>
              <Search size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              Target
            </span>
            <input
              value={targetText}
              onChange={e => setTargetText(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setTargetFocused(true)}
              onBlur={() => setTargetFocused(false)}
              placeholder="e.g. 25"
              style={{ ...inputStyle(targetFocused), width: 72 }}
            />
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: colors.muted }}>n=</span>
          {SIZE_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setGenSize(s)}
              style={{
                padding: '3px 7px',
                borderRadius: 4,
                fontSize: 12,
                fontFamily: 'JetBrains Mono, monospace',
                background: genSize === s ? `${colors.purple}22` : colors.card,
                color: genSize === s ? colors.purple : colors.muted,
                border: `1px solid ${genSize === s ? colors.purple : colors.border}`,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 12px', borderRadius: 4,
            background: `${colors.purple}22`,
            color: colors.purple,
            border: `1px solid ${colors.purple}`,
            fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `${colors.purple}44` }}
          onMouseLeave={e => { e.currentTarget.style.background = `${colors.purple}22` }}
        >
          <Shuffle size={13} />
          Generate
        </button>

        <button
          onClick={handleApply}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 12px', borderRadius: 4,
            background: `${colors.green}22`,
            color: colors.green,
            border: `1px solid ${colors.green}`,
            fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `${colors.green}44` }}
          onMouseLeave={e => { e.currentTarget.style.background = `${colors.green}22` }}
        >
          <Check size={13} />
          Apply
        </button>
      </div>

      {error && (
        <div style={{ fontSize: 12, color: colors.red, fontFamily: 'JetBrains Mono, monospace' }}>
          ✗ {error}
        </div>
      )}
    </div>
  )
}
