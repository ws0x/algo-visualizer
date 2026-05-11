import { Code2, ChevronRight } from 'lucide-react'
import { colors } from '../../constants/theme'

function ComplexityChip({ label, value, color }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 8px',
      borderRadius: 4,
      background: `${color}18`,
      border: `1px solid ${color}44`,
    }}>
      <span style={{ fontSize: 10, color: colors.muted }}>{label}</span>
      <span style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 12,
        color: color,
        fontWeight: 600,
      }}>
        {value}
      </span>
    </div>
  )
}

export default function Header({ currentAlgo, breadcrumb }) {
  return (
    <div style={{
      height: 48,
      background: colors.panel,
      borderBottom: `1px solid ${colors.border}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 16,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        textDecoration: 'none',
      }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          background: `${colors.blue}22`,
          border: `1px solid ${colors.blue}44`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Code2 size={15} color={colors.blue} />
        </div>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 700,
          fontSize: 15,
          color: colors.blue,
          letterSpacing: '-0.02em',
        }}>
          AlgoViz
        </span>
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 24, background: colors.border }} />

      {/* Breadcrumb */}
      {breadcrumb && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          flex: 1,
        }}>
          {breadcrumb.map((crumb, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {i > 0 && <ChevronRight size={12} color={colors.muted} />}
              <span style={{
                fontSize: 13,
                color: i === breadcrumb.length - 1 ? colors.text : colors.muted,
                fontWeight: i === breadcrumb.length - 1 ? 500 : 400,
              }}>
                {crumb}
              </span>
            </span>
          ))}
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* Complexity badges */}
      {currentAlgo && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {currentAlgo.time && (
            <ComplexityChip label="Time" value={currentAlgo.time} color={colors.yellow} />
          )}
          {currentAlgo.space && (
            <ComplexityChip label="Space" value={currentAlgo.space} color={colors.cyan} />
          )}
          {currentAlgo.stable !== undefined && (
            <div style={{
              padding: '2px 8px',
              borderRadius: 4,
              background: currentAlgo.stable ? `${colors.green}18` : `${colors.red}18`,
              border: `1px solid ${currentAlgo.stable ? colors.green : colors.red}44`,
              fontSize: 11,
              color: currentAlgo.stable ? colors.green : colors.red,
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              {currentAlgo.stable ? '✓ stable' : '✗ unstable'}
            </div>
          )}
          {currentAlgo.note && (
            <div style={{
              padding: '2px 8px',
              borderRadius: 4,
              background: `${colors.blue}18`,
              border: `1px solid ${colors.blue}44`,
              fontSize: 11,
              color: colors.blue,
            }}>
              {currentAlgo.note}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
