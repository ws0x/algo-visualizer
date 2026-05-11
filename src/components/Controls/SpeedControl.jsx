import { Zap } from 'lucide-react'
import { colors } from '../../constants/theme'

const SPEED_OPTIONS = [
  { label: '0.25×', value: 0.5 },
  { label: '0.5×', value: 1 },
  { label: '1×', value: 2 },
  { label: '2×', value: 4 },
  { label: '4×', value: 8 },
]

export default function SpeedControl({ speed, setSpeed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: colors.muted, fontSize: 12 }}>
        <Zap size={13} />
        <span>Speed</span>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {SPEED_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setSpeed(opt.value)}
            style={{
              padding: '3px 9px',
              borderRadius: 4,
              fontSize: 12,
              fontFamily: 'JetBrains Mono, monospace',
              background: speed === opt.value ? colors.blue : colors.card,
              color: speed === opt.value ? colors.bg : colors.muted,
              border: `1px solid ${speed === opt.value ? colors.blue : colors.border}`,
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontWeight: speed === opt.value ? 600 : 400,
            }}
            onMouseEnter={e => {
              if (speed !== opt.value) {
                e.currentTarget.style.background = `${colors.blue}22`
                e.currentTarget.style.color = colors.blue
                e.currentTarget.style.borderColor = colors.blue
              }
            }}
            onMouseLeave={e => {
              if (speed !== opt.value) {
                e.currentTarget.style.background = colors.card
                e.currentTarget.style.color = colors.muted
                e.currentTarget.style.borderColor = colors.border
              }
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
