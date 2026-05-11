import { useState, useEffect, useMemo } from 'react'
import { colors, ALGORITHMS } from '../../constants/theme'
import { useAnimator } from '../../hooks/useAnimator'
import { generateSearchingSteps } from './searchingAlgorithms'
import PlaybackControls from '../../components/Controls/PlaybackControls'
import SpeedControl from '../../components/Controls/SpeedControl'
import ArrayInput from '../../components/Controls/ArrayInput'
import InfoPanel from '../../components/InfoPanel'
import { AlertTriangle } from 'lucide-react'

const DEFAULT_ARRAY = [64, 34, 25, 12, 22, 11, 90]
const DEFAULT_TARGET = 25

function isSorted(arr) {
  for (let i = 1; i < arr.length; i++) if (arr[i] < arr[i - 1]) return false
  return true
}

export default function SearchingVisualizer({ algorithmId }) {
  const [algorithm, setAlgorithm] = useState(algorithmId || 'linear')
  const [array, setArray] = useState(DEFAULT_ARRAY)
  const [target, setTarget] = useState(DEFAULT_TARGET)

  useEffect(() => {
    if (algorithmId && algorithmId !== algorithm) setAlgorithm(algorithmId)
  }, [algorithmId])

  const steps = useMemo(() => generateSearchingSteps(algorithm, array, target), [algorithm, array, target])
  const animator = useAnimator(steps)
  const step = steps[animator.currentStep] || steps[0]

  const displayArray = step?.array || array
  const needsSorted = algorithm === 'binary'
  const showWarning = needsSorted && !isSorted(array)

  const cellSize = Math.max(44, Math.min(64, Math.floor(700 / displayArray.length)))

  function getCellStyle(i) {
    const isFound = step?.found === i
    const isCurrent = step?.current === i
    const isMid = step?.mid === i
    const isEliminated = step?.eliminated?.includes(i)
    const isLow = step?.low === i
    const isHigh = step?.high === i

    let bg = colors.border
    let border = `1px solid ${colors.muted}`
    let textColor = colors.text
    let shadow = 'none'

    if (isEliminated) {
      bg = colors.panel
      textColor = colors.muted
      border = `1px solid ${colors.border}33`
    }
    if (isLow) border = `2px solid ${colors.blue}`
    if (isHigh) border = `2px solid ${colors.purple}`
    if (isMid) {
      bg = `${colors.yellow}22`
      border = `2px solid ${colors.yellow}`
    }
    if (isCurrent) {
      bg = `${colors.yellow}22`
      border = `2px solid ${colors.yellow}`
      shadow = `0 0 10px ${colors.yellow}44`
    }
    if (isFound) {
      bg = `${colors.green}22`
      border = `2px solid ${colors.green}`
      textColor = colors.green
      shadow = `0 0 12px ${colors.green}55`
    }

    return { bg, border, textColor, shadow }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '16px 20px',
      gap: 14,
      overflowY: 'auto',
    }}>
      {/* Algorithm tabs */}
      <div style={{ display: 'flex', gap: 6 }}>
        {ALGORITHMS.searching.map(algo => (
          <button
            key={algo.id}
            onClick={() => setAlgorithm(algo.id)}
            style={{
              padding: '6px 16px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: algorithm === algo.id ? 600 : 400,
              background: algorithm === algo.id ? `${colors.blue}22` : colors.card,
              color: algorithm === algo.id ? colors.blue : colors.muted,
              border: `1px solid ${algorithm === algo.id ? colors.blue : colors.border}`,
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <span>{algo.name}</span>
            <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', opacity: 0.7 }}>{algo.time}</span>
          </button>
        ))}
      </div>

      {showWarning && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: `${colors.yellow}18`,
          border: `1px solid ${colors.yellow}44`,
          borderRadius: 6,
          fontSize: 12,
          color: colors.yellow,
        }}>
          <AlertTriangle size={14} />
          Array will be sorted automatically for Binary Search
        </div>
      )}

      {/* Target display */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 14px',
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
      }}>
        <span style={{ fontSize: 13, color: colors.muted }}>Searching for:</span>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 22,
          fontWeight: 700,
          color: step?.found !== undefined && step.found >= 0 ? colors.green : colors.orange,
        }}>
          {step?.target ?? target}
        </span>
        {step?.found !== undefined && step.found >= 0 && (
          <span style={{ fontSize: 12, color: colors.green, fontFamily: 'JetBrains Mono, monospace' }}>
            ✓ found at index {step.found}
          </span>
        )}
      </div>

      {/* Array visualization */}
      <div style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        padding: '24px 20px 16px',
        overflowX: 'auto',
      }}>
        <div style={{ display: 'flex', gap: 4, minWidth: 'fit-content', position: 'relative' }}>
          {displayArray.map((val, i) => {
            const { bg, border, textColor, shadow } = getCellStyle(i)
            const isLow = step?.low === i
            const isHigh = step?.high === i
            const isMid = step?.mid === i

            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                {/* Pointer labels */}
                <div style={{ height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isMid && <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: colors.yellow, fontWeight: 700 }}>M</span>}
                  {isLow && !isMid && <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: colors.blue, fontWeight: 700 }}>L</span>}
                  {isHigh && !isMid && <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: colors.purple, fontWeight: 700 }}>H</span>}
                </div>

                <div style={{
                  width: cellSize,
                  height: cellSize,
                  background: bg,
                  border,
                  borderRadius: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  boxShadow: shadow,
                  transition: 'all 0.15s',
                }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: Math.max(13, Math.min(18, cellSize - 24)),
                    fontWeight: 600,
                    color: textColor,
                    transition: 'color 0.15s',
                  }}>
                    {val}
                  </span>
                </div>

                <span style={{ fontSize: 10, color: colors.muted, fontFamily: 'JetBrains Mono, monospace' }}>
                  {i}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          { color: colors.yellow, label: 'Checking/Mid' },
          { color: colors.green, label: 'Found' },
          { color: colors.blue, label: 'Low (L)' },
          { color: colors.purple, label: 'High (H)' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
            <span style={{ fontSize: 11, color: colors.muted }}>{label}</span>
          </div>
        ))}
      </div>

      <InfoPanel info={step?.info} step={animator.currentStep} total={animator.totalSteps} />

      <div style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <PlaybackControls {...animator} />
        <SpeedControl speed={animator.speed} setSpeed={animator.setSpeed} />
      </div>

      <ArrayInput
        onArrayChange={arr => setArray(arr)}
        onTargetChange={t => setTarget(t)}
        showTarget={true}
        maxValues={20}
        currentArray={array}
        currentTarget={target}
      />
    </div>
  )
}
