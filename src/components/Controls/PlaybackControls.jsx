import { SkipBack, ChevronLeft, Play, Pause, ChevronRight, SkipForward } from 'lucide-react'
import { colors } from '../../constants/theme'

export default function PlaybackControls({
  isPlaying, play, pause, reset, stepForward, stepBack, goToEnd,
  currentStep, totalSteps, progress, isDone
}) {
  const btnStyle = (active = false) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: active ? `${colors.blue}22` : 'transparent',
    color: active ? colors.blue : colors.text,
    border: `1px solid ${active ? colors.blue : colors.border}`,
    cursor: 'pointer',
    transition: 'all 0.15s',
  })

  const playBtnStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: colors.blue,
    color: colors.bg,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s',
    boxShadow: `0 0 12px ${colors.blue}44`,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          style={btnStyle()}
          onClick={reset}
          title="Reset to beginning"
          onMouseEnter={e => { e.currentTarget.style.background = `${colors.border}66`; e.currentTarget.style.color = colors.blue }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = colors.text }}
        >
          <SkipBack size={15} />
        </button>

        <button
          style={btnStyle()}
          onClick={stepBack}
          title="Step back"
          disabled={currentStep === 0}
          onMouseEnter={e => { if (currentStep > 0) { e.currentTarget.style.background = `${colors.border}66`; e.currentTarget.style.color = colors.blue } }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = colors.text }}
        >
          <ChevronLeft size={15} />
        </button>

        <button
          style={playBtnStyle}
          onClick={isPlaying ? pause : play}
          title={isPlaying ? 'Pause' : 'Play'}
          onMouseEnter={e => { e.currentTarget.style.background = '#74bdf0'; e.currentTarget.style.boxShadow = `0 0 18px ${colors.blue}66` }}
          onMouseLeave={e => { e.currentTarget.style.background = colors.blue; e.currentTarget.style.boxShadow = `0 0 12px ${colors.blue}44` }}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
        </button>

        <button
          style={btnStyle()}
          onClick={stepForward}
          title="Step forward"
          disabled={isDone}
          onMouseEnter={e => { if (!isDone) { e.currentTarget.style.background = `${colors.border}66`; e.currentTarget.style.color = colors.blue } }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = colors.text }}
        >
          <ChevronRight size={15} />
        </button>

        <button
          style={btnStyle()}
          onClick={goToEnd}
          title="Skip to end"
          onMouseEnter={e => { e.currentTarget.style.background = `${colors.border}66`; e.currentTarget.style.color = colors.blue }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = colors.text }}
        >
          <SkipForward size={15} />
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div
          style={{
            width: '100%',
            height: 4,
            background: colors.border,
            borderRadius: 2,
            overflow: 'hidden',
            cursor: 'pointer',
          }}
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect()
            const pct = (e.clientX - rect.left) / rect.width
            const target = Math.round(pct * (totalSteps - 1))
            // We can't directly call setCurrentStep here, but we can use stepForward/stepBack conceptually
            // For now just skip — the controls suffice
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: colors.blue,
              borderRadius: 2,
              transition: 'width 0.1s',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: colors.muted, fontFamily: 'JetBrains Mono, monospace' }}>
          <span>Step {currentStep + 1}</span>
          <span>{totalSteps} total</span>
        </div>
      </div>
    </div>
  )
}
