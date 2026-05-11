import { colors } from '../constants/theme'
import { Terminal } from 'lucide-react'

function getInfoColor(info) {
  if (!info) return colors.text
  const lower = info.toLowerCase()
  if (lower.includes('swap') || lower.includes('swapping')) return colors.red
  if (lower.includes('compar') || lower.includes('checking')) return colors.yellow
  if (lower.includes('sorted') || lower.includes('found') || lower.includes('✓') || lower.includes('complete') || lower.includes('done') || lower.includes('success')) return colors.green
  if (lower.includes('pivot')) return colors.purple
  if (lower.includes('minimum') || lower.includes('min ')) return colors.cyan
  if (lower.includes('insert') || lower.includes('visit')) return colors.blue
  return colors.text
}

export default function InfoPanel({ info, step, total }) {
  const textColor = getInfoColor(info)

  return (
    <div style={{
      background: colors.panel,
      border: `1px solid ${colors.border}`,
      borderRadius: 8,
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      minHeight: 44,
    }}>
      <Terminal size={14} style={{ color: colors.muted, marginTop: 2, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <span
          className="mono"
          style={{
            fontSize: 13,
            color: textColor,
            lineHeight: 1.5,
            display: 'block',
            transition: 'color 0.2s',
          }}
        >
          {info || <span style={{ color: colors.muted }}>Ready. Press Play to start.</span>}
        </span>
      </div>
      {total > 0 && (
        <span style={{
          fontSize: 11,
          color: colors.muted,
          fontFamily: 'JetBrains Mono, monospace',
          whiteSpace: 'nowrap',
          marginTop: 2,
        }}>
          {step + 1}/{total}
        </span>
      )}
    </div>
  )
}
