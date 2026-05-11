import { useState } from 'react'
import { GitBranch, Database, ChevronRight } from 'lucide-react'
import { colors, ALGORITHMS, STRUCTURES } from '../../constants/theme'

function SectionHeader({ icon: Icon, label, isOpen, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        background: 'none',
        border: 'none',
        color: colors.muted,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'color 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = colors.text }}
      onMouseLeave={e => { e.currentTarget.style.color = colors.muted }}
    >
      <Icon size={13} />
      <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
      <ChevronRight
        size={13}
        style={{
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
        }}
      />
    </button>
  )
}

function CategoryGroup({ label, items, currentCategory, currentId, catKey, onSelect, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const isActiveCat = items.some(item => item.id === currentId && currentCategory === catKey)

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px 6px 20px',
          background: 'none',
          border: 'none',
          color: isActiveCat ? colors.blue : colors.text,
          fontSize: 13,
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { if (!isActiveCat) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
      >
        <ChevronRight
          size={12}
          style={{
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            color: colors.muted,
          }}
        />
        <span>{label}</span>
      </button>

      {open && (
        <div>
          {items.map(item => {
            const isActive = currentCategory === catKey && currentId === item.id
            return (
              <button
                key={item.id}
                onClick={() => onSelect(catKey, item.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '5px 12px 5px 38px',
                  background: isActive ? `rgba(97,175,239,0.1)` : 'none',
                  border: 'none',
                  borderLeft: isActive ? `2px solid ${colors.blue}` : '2px solid transparent',
                  color: isActive ? colors.blue : colors.muted,
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 6,
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.color = colors.text
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'none'
                    e.currentTarget.style.color = colors.muted
                  }
                }}
              >
                <span>{item.name}</span>
                {item.time && (
                  <span style={{
                    fontSize: 10,
                    fontFamily: 'JetBrains Mono, monospace',
                    color: isActive ? `${colors.blue}99` : `${colors.muted}88`,
                    whiteSpace: 'nowrap',
                  }}>
                    {item.time}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ onSelect, currentCategory, currentId }) {
  const [algoOpen, setAlgoOpen] = useState(true)
  const [structOpen, setStructOpen] = useState(true)

  return (
    <div style={{
      width: 240,
      minWidth: 240,
      background: colors.panel,
      borderRight: `1px solid ${colors.border}`,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>
      {/* Algorithms Section */}
      <div style={{ marginTop: 8 }}>
        <SectionHeader
          icon={GitBranch}
          label="Algorithms"
          isOpen={algoOpen}
          onToggle={() => setAlgoOpen(v => !v)}
        />
        {algoOpen && (
          <div>
            <CategoryGroup
              label="Sorting"
              items={ALGORITHMS.sorting}
              currentCategory={currentCategory}
              currentId={currentId}
              catKey="sorting"
              onSelect={onSelect}
              defaultOpen={currentCategory === 'sorting'}
            />
            <CategoryGroup
              label="Searching"
              items={ALGORITHMS.searching}
              currentCategory={currentCategory}
              currentId={currentId}
              catKey="searching"
              onSelect={onSelect}
              defaultOpen={currentCategory === 'searching'}
            />
            <CategoryGroup
              label="Graph"
              items={ALGORITHMS.graph}
              currentCategory={currentCategory}
              currentId={currentId}
              catKey="graph"
              onSelect={onSelect}
              defaultOpen={currentCategory === 'graph'}
            />
            <CategoryGroup
              label="Trees"
              items={ALGORITHMS.tree}
              currentCategory={currentCategory}
              currentId={currentId}
              catKey="tree"
              onSelect={onSelect}
              defaultOpen={currentCategory === 'tree'}
            />
          </div>
        )}
      </div>

      <div style={{ height: 1, background: colors.border, margin: '8px 0' }} />

      {/* Data Structures Section */}
      <div>
        <SectionHeader
          icon={Database}
          label="Data Structures"
          isOpen={structOpen}
          onToggle={() => setStructOpen(v => !v)}
        />
        {structOpen && (
          <div>
            {STRUCTURES.map(s => {
              const isActive = currentCategory === 'structure' && currentId === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => onSelect('structure', s.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '6px 12px 6px 28px',
                    background: isActive ? `rgba(97,175,239,0.1)` : 'none',
                    border: 'none',
                    borderLeft: isActive ? `2px solid ${colors.blue}` : '2px solid transparent',
                    color: isActive ? colors.blue : colors.text,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                      e.currentTarget.style.color = colors.blue
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'none'
                      e.currentTarget.style.color = colors.text
                    }
                  }}
                >
                  <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{s.icon}</span>
                  <span>{s.name}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* Footer */}
      <div style={{
        padding: '10px 12px',
        borderTop: `1px solid ${colors.border}`,
        fontSize: 11,
        color: colors.muted,
        fontFamily: 'JetBrains Mono, monospace',
      }}>
        AlgoViz v1.0.0
      </div>
    </div>
  )
}
