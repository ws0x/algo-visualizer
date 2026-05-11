import { useState, useEffect, useMemo } from 'react'
import { colors, ALGORITHMS } from '../../constants/theme'
import { useAnimator } from '../../hooks/useAnimator'
import { generateSortingSteps } from './sortingAlgorithms'
import PlaybackControls from '../../components/Controls/PlaybackControls'
import SpeedControl from '../../components/Controls/SpeedControl'
import ArrayInput from '../../components/Controls/ArrayInput'
import InfoPanel from '../../components/InfoPanel'

const DEFAULT_ARRAY = [64, 34, 25, 12, 22, 11, 90]

function getBarColor(index, step) {
  if (!step) return colors.blue
  if (step.sorted && step.sorted.includes(index)) return colors.green
  if (step.swapping && step.swapping.includes(index)) return colors.red
  if (step.pivot === index) return colors.purple
  if (step.min === index) return colors.cyan
  if (step.comparing && step.comparing.includes(index)) return colors.yellow
  return colors.blue
}

export default function SortingVisualizer({ algorithmId }) {
  const [algorithm, setAlgorithm] = useState(algorithmId || 'bubble')
  const [array, setArray] = useState(DEFAULT_ARRAY)

  useEffect(() => {
    if (algorithmId && algorithmId !== algorithm) setAlgorithm(algorithmId)
  }, [algorithmId])

  const steps = useMemo(() => generateSortingSteps(algorithm, array), [algorithm, array])
  const animator = useAnimator(steps)
  const currentStep = steps[animator.currentStep] || steps[0]
  const maxVal = Math.max(...array, 1)
  const BAR_AREA_HEIGHT = 280
  const showLabels = array.length <= 15

  const algoMeta = ALGORITHMS.sorting.find(a => a.id === algorithm)

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
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {ALGORITHMS.sorting.map(algo => (
          <button
            key={algo.id}
            onClick={() => setAlgorithm(algo.id)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 12,
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
            onMouseEnter={e => {
              if (algorithm !== algo.id) {
                e.currentTarget.style.background = `${colors.blue}11`
                e.currentTarget.style.color = colors.text
              }
            }}
            onMouseLeave={e => {
              if (algorithm !== algo.id) {
                e.currentTarget.style.background = colors.card
                e.currentTarget.style.color = colors.muted
              }
            }}
          >
            <span>{algo.name}</span>
            <span style={{
              fontSize: 10,
              fontFamily: 'JetBrains Mono, monospace',
              opacity: 0.7,
            }}>{algo.time}</span>
          </button>
        ))}
      </div>

      {/* Bar Chart */}
      <div style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        padding: '20px 16px 12px',
        position: 'relative',
      }}>
        {/* Complexity badges inline */}
        {algoMeta && (
          <div style={{ position: 'absolute', top: 10, right: 12, display: 'flex', gap: 6 }}>
            <span style={{
              fontSize: 10,
              fontFamily: 'JetBrains Mono, monospace',
              padding: '2px 6px',
              borderRadius: 3,
              background: `${colors.yellow}18`,
              color: colors.yellow,
              border: `1px solid ${colors.yellow}33`,
            }}>T: {algoMeta.time}</span>
            <span style={{
              fontSize: 10,
              fontFamily: 'JetBrains Mono, monospace',
              padding: '2px 6px',
              borderRadius: 3,
              background: `${colors.cyan}18`,
              color: colors.cyan,
              border: `1px solid ${colors.cyan}33`,
            }}>S: {algoMeta.space}</span>
          </div>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: Math.max(2, Math.floor(8 - array.length / 4)),
          height: BAR_AREA_HEIGHT,
          justifyContent: 'center',
        }}>
          {(currentStep?.array || array).map((val, i) => {
            const barColor = getBarColor(i, currentStep)
            const height = Math.max(8, (val / maxVal) * (BAR_AREA_HEIGHT - 32))
            const barWidth = Math.max(18, Math.min(52, Math.floor(720 / array.length) - 4))

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  position: 'relative',
                }}
              >
                {showLabels && (
                  <span style={{
                    fontSize: Math.max(9, Math.min(13, barWidth - 4)),
                    fontFamily: 'JetBrains Mono, monospace',
                    color: barColor,
                    transition: 'color 0.15s',
                    lineHeight: 1,
                    position: 'absolute',
                    top: -(BAR_AREA_HEIGHT - height - 24),
                  }}>
                    {val}
                  </span>
                )}
                <div
                  style={{
                    width: barWidth,
                    height,
                    background: barColor,
                    borderRadius: '3px 3px 0 0',
                    transition: 'height 0.1s ease, background-color 0.15s ease',
                    boxShadow: barColor !== colors.blue ? `0 0 8px ${barColor}55` : 'none',
                  }}
                />
                <span style={{
                  fontSize: 9,
                  color: colors.muted,
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {i}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Color legend */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          { color: colors.blue, label: 'Default' },
          { color: colors.yellow, label: 'Comparing' },
          { color: colors.red, label: 'Swapping' },
          { color: colors.green, label: 'Sorted' },
          { color: colors.purple, label: 'Pivot' },
          { color: colors.cyan, label: 'Minimum' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
            <span style={{ fontSize: 11, color: colors.muted }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Info Panel */}
      <InfoPanel
        info={currentStep?.info}
        step={animator.currentStep}
        total={animator.totalSteps}
      />

      {/* Controls */}
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
        <PlaybackControls
          isPlaying={animator.isPlaying}
          play={animator.play}
          pause={animator.pause}
          reset={animator.reset}
          stepForward={animator.stepForward}
          stepBack={animator.stepBack}
          goToEnd={animator.goToEnd}
          currentStep={animator.currentStep}
          totalSteps={animator.totalSteps}
          progress={animator.progress}
          isDone={animator.isDone}
        />
        <SpeedControl speed={animator.speed} setSpeed={animator.setSpeed} />
      </div>

      {/* Array Input */}
      <ArrayInput
        onArrayChange={arr => setArray(arr)}
        showTarget={false}
        maxValues={20}
        currentArray={array}
      />
    </div>
  )
}
