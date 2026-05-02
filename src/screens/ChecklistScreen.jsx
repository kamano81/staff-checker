import { useState } from 'react'
import { getPositionsForTL, ALL_POSITIONS } from '../data/teams'

function fmt(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
}

function abbr(text) {
  return (text ?? '').replace(/Entré /g, 'E ').replace(/Hiss /g, 'H ').replace(/Plan /g, 'P ')
}

// ── Icons ──────────────────────────────────────────────────────────────────
const BackIcon = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
    <path d="M10.5 3.5L5.5 8.5L10.5 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2.5 4h11M6 4V2.5h4V4M5.5 4l.5 8.5h4l.5-8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const ExportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 9.5V1.5M5.5 4L8 1.5L10.5 4M4.5 10v3.5h7V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 4h12M4.5 8h7M7 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

// ── Card styles ────────────────────────────────────────────────────────────
const S = {
  field:      { display: 'flex', alignItems: 'center', background: '#ffffff', borderRadius: 10, padding: '7px 10px', gap: 8, minWidth: 0 },
  fieldMuted: { display: 'flex', alignItems: 'center', background: '#f5f5f7', borderRadius: 10, padding: '7px 10px', gap: 8, minWidth: 0 },
  label:      { fontSize: 11, color: '#6e6e73', fontWeight: 500, flexShrink: 0 },
  labelMuted: { fontSize: 11, color: '#8e8e93', fontWeight: 500, flexShrink: 0 },
  input:      { flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontWeight: 500, color: '#1d1d1f', fontFamily: 'inherit', textAlign: 'right', fontVariantNumeric: 'tabular-nums', padding: 0 },
  pillBtn:    (bg) => ({ background: bg, color: '#fff', border: 'none', borderRadius: 980, padding: '0 14px', height: 32, fontSize: 12, fontWeight: 500, fontFamily: 'inherit', letterSpacing: '-0.005em', cursor: 'pointer', whiteSpace: 'nowrap' }),
}

function PersonCard({ person, onUpdate }) {
  function checkIn()  { onUpdate({ checkedIn: true,  checkedInAt: new Date().toISOString() }) }
  function checkOut() { onUpdate({ checkedOut: true, checkedOutAt: new Date().toISOString() }) }
  function undoIn()   { onUpdate({ checkedIn: false, checkedInAt: null, checkedOut: false, checkedOutAt: null }) }
  function undoOut()  { onUpdate({ checkedOut: false, checkedOutAt: null }) }

  const isIn  = person.checkedIn && !person.checkedOut
  const isOut = person.checkedOut

  const cardBg     = isIn ? '#ecfaf0' : isOut ? '#ededeb' : '#f5f5f7'
  const cardBorder = isIn ? '#c8ebd5' : isOut ? '#d4d4d2' : '#e0e0e3'
  const nameColor  = isOut ? '#6e6e73' : '#1d1d1f'

  const metaParts = person.roll === 'tl' || person.roll === 'tl-ass'
    ? [person.teamleader].filter(Boolean)
    : [abbr(person.position), person.teamleader].filter(Boolean)

  return (
    <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: '12px 14px', opacity: isOut ? 0.85 : 1, transition: 'background 0.25s ease, border-color 0.25s ease' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gridTemplateRows: 'auto auto', gap: '10px 12px', alignItems: 'center' }}>

        {/* Name + meta */}
        <div style={{ gridColumn: 1, gridRow: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: nameColor, letterSpacing: '-0.018em', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, margin: 0 }}>
              {person.name || '(inget namn)'}
            </p>
            {(person.roll === 'tl' || person.roll === 'tl-ass') && (
              <span style={{ flexShrink: 0, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase', color: '#fff', background: '#8c52d6' }}>
                {person.roll === 'tl' ? 'TL' : 'TL Ass'}
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: '#6e6e73', marginTop: 2, lineHeight: 1.3, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '2px 0 0' }}>
            {metaParts.map((part, i) => (
              <span key={i}>{i > 0 && <span style={{ margin: '0 5px', color: '#c7c7cc' }}>·</span>}{part}</span>
            ))}
          </p>
        </div>

        {/* Time pill — click ✓ to undo check-in */}
        <div
          onClick={isIn ? undoIn : undefined}
          title={isIn ? 'Klicka för att ångra incheckning' : undefined}
          style={{ gridColumn: 2, gridRow: 1, flexShrink: 0, fontSize: 11, fontWeight: 500, background: isOut ? '#e5e5ea' : '#ffffff', borderRadius: 999, padding: '4px 10px', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', letterSpacing: '-0.005em', display: 'inline-flex', alignItems: 'center', gap: 4, cursor: isIn ? 'pointer' : 'default' }}>
          {isIn && <span style={{ color: '#1a8f3c', fontWeight: 700, fontSize: 11 }}>✓</span>}
          <span style={{ color: isIn ? '#1a8f3c' : isOut ? '#6e6e73' : '#1d1d1f', fontWeight: isIn ? 600 : 500 }}>
            {person.passStart || ''}
          </span>
          {person.passEnd && <span style={{ color: isOut ? '#6e6e73' : '#1d1d1f' }}> — {person.passEnd}</span>}
        </div>

        {/* DEFAULT */}
        {!isIn && !isOut && (
          <div style={{ gridColumn: '1 / -1', gridRow: 2, display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 6 }}>
            <label style={S.field}>
              <span style={S.label}>Radio</span>
              <input style={S.input} type="text" inputMode="numeric" placeholder="Nr"
                value={person.radio} onChange={e => onUpdate({ radio: e.target.value })} />
            </label>
            <label style={S.field}>
              <span style={S.label}>Kort</span>
              <input style={S.input} type="text" inputMode="numeric" placeholder="Nr"
                value={person.kort} onChange={e => onUpdate({ kort: e.target.value })} />
            </label>
            <button onClick={checkIn} style={S.pillBtn('#1d1d1f')}>Checka in</button>
          </div>
        )}

        {/* CHECKED IN — click ✓ in time pill to undo */}
        {isIn && (
          <div style={{ gridColumn: '1 / -1', gridRow: 2, display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 6 }}>
            <label style={S.field}>
              <span style={S.label}>Radio</span>
              <input style={S.input} type="text" inputMode="numeric" placeholder="Nr"
                value={person.radio} onChange={e => onUpdate({ radio: e.target.value })} />
            </label>
            <label style={S.field}>
              <span style={S.label}>Kort</span>
              <input style={S.input} type="text" inputMode="numeric" placeholder="Nr"
                value={person.kort} onChange={e => onUpdate({ kort: e.target.value })} />
            </label>
            <button onClick={checkOut} style={S.pillBtn('#f56300')}>Checka ut</button>
          </div>
        )}

        {/* CHECKED OUT — click ✓ dot to undo */}
        {isOut && (
          <div style={{ gridColumn: '1 / -1', gridRow: 2, display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 6, alignItems: 'center' }}>
            <div style={S.fieldMuted}>
              <span style={S.labelMuted}>Radio</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#6e6e73', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{person.radio || '—'}</span>
            </div>
            <div style={S.fieldMuted}>
              <span style={S.labelMuted}>Kort</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#6e6e73', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{person.kort || '—'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 4px', whiteSpace: 'nowrap' }}>
              <span
                onClick={undoOut}
                title="Klicka för att ångra utcheckning"
                style={{ width: 16, height: 16, borderRadius: '50%', background: '#8e8e93', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0, cursor: 'pointer' }}>
                ✓
              </span>
              <span style={{ fontSize: 12, color: '#6e6e73', fontWeight: 600, letterSpacing: '-0.005em' }}>
                Utcheckad <span style={{ fontVariantNumeric: 'tabular-nums', color: '#1d1d1f' }}>{fmt(person.checkedOutAt)}</span>
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ── Tabs & filter ──────────────────────────────────────────────────────────
const AREA_TABS = [
  { label: 'Alla',   tls: [] },
  { label: 'Norr',   tls: ['TL Norr'] },
  { label: 'Söder',  tls: ['TL Söder', 'TL Ass Söder'] },
  { label: 'Öst',    tls: ['TL Ass Öst'] },
  { label: 'Väst',   tls: ['TL Ass Väst'] },
  { label: 'Plan 6', tls: ['TL Plan 6'] },
  { label: 'Rond',   tls: ['TL Rond'] },
]
const ROLL_LABELS = { personal: 'Personal', tl: 'TL', 'tl-ass': 'TL Ass' }

const FF = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif"

function chip(active) {
  return { background: active ? '#1d1d1f' : '#f0f0f2', color: active ? '#fff' : '#1d1d1f', fontWeight: active ? 600 : 500, border: 'none', borderRadius: 999, padding: '6px 14px', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: FF, letterSpacing: '-0.005em' }
}

function IconBtn({ onClick, active, title, children }) {
  return (
    <button onClick={onClick} title={title}
      style={{ width: 36, height: 36, borderRadius: '50%', background: active ? '#1d1d1f' : '#f0f0f2', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: active ? '#fff' : '#1d1d1f', flexShrink: 0, fontFamily: FF }}>
      {children}
    </button>
  )
}

export default function ChecklistScreen({ people, onUpdate, onExport, onBack, onReset }) {
  const [search, setSearch]                 = useState('')
  const [activeArea, setActiveArea]         = useState('Alla')
  const [activePosition, setActivePosition] = useState('Alla')
  const [activeRoll, setActiveRoll]         = useState('Alla')
  const [activeStatus, setActiveStatus]     = useState('Alla')
  const [showFilters, setShowFilters]       = useState(false)
  const [sortBy, setSortBy]                 = useState('namn')

  const activeTab    = AREA_TABS.find(t => t.label === activeArea) ?? AREA_TABS[0]
  const positionTabs = activeArea === 'Alla'
    ? ['Alla', ...ALL_POSITIONS]
    : ['Alla', ...[...new Set(activeTab.tls.flatMap(tl => getPositionsForTL(tl)))]]

  const hasActiveFilters = activeRoll !== 'Alla' || activeStatus !== 'Alla' || sortBy !== 'namn'

  function handleAreaChange(label) {
    setActiveArea(a => a === label && label !== 'Alla' ? 'Alla' : label)
    setActivePosition('Alla')
  }

  const filtered = people
    .filter(p => {
      if (activeArea !== 'Alla' && !activeTab.tls.includes(p.teamleader)) return false
      if (activePosition !== 'Alla' && p.position !== activePosition) return false
      if (activeRoll !== 'Alla' && (p.roll ?? 'personal') !== activeRoll) return false
      if (activeStatus === 'Väntar' && (p.checkedIn || p.checkedOut)) return false
      if (activeStatus === 'Inne'   && !(p.checkedIn && !p.checkedOut)) return false
      if (activeStatus === 'Slutat' && !p.checkedOut) return false
      if (search) {
        const q = search.toLowerCase()
        return p.name.toLowerCase().includes(q) || p.position.toLowerCase().includes(q)
      }
      return true
    })
    .sort((a, b) => {
      if (a.checkedOut && !b.checkedOut) return 1
      if (!a.checkedOut && b.checkedOut) return -1
      if (a.checkedIn && !b.checkedIn) return 1
      if (!a.checkedIn && b.checkedIn) return -1
      if (sortBy === 'position') {
        const ro = { tl: 0, 'tl-ass': 1, personal: 2 }
        const r = (ro[a.roll ?? 'personal'] ?? 2) - (ro[b.roll ?? 'personal'] ?? 2)
        if (r !== 0) return r
        const pos = (a.position || 'Ö').localeCompare(b.position || 'Ö', 'sv')
        if (pos !== 0) return pos
      }
      if (sortBy === 'tid') {
        const t = (a.passStart ?? '').localeCompare(b.passStart ?? '')
        if (t !== 0) return t
      }
      return a.name.localeCompare(b.name, 'sv')
    })

  const stats = {
    total: people.length,
    in:    people.filter(p => p.checkedIn && !p.checkedOut).length,
    out:   people.filter(p => p.checkedOut).length,
  }

  return (
    <div style={{ background: '#ffffff', minHeight: '100svh', fontFamily: FF, WebkitFontSmoothing: 'antialiased', color: '#1d1d1f' }}>

      {/* ── Sticky header ─────────────────────────────────────────── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: '#ffffff' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 16px 0' }}>

          {/* Title + sub */}
          <div style={{ padding: '4px 4px 10px' }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.022em', color: '#1d1d1f', margin: 0, lineHeight: 1.1 }}>Incheckning</h1>
            <div style={{ fontSize: 13, color: '#6e6e73', marginTop: 3, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
              {stats.in} incheckade · {stats.out} klara · {stats.total} totalt
            </div>
          </div>

          {/* Icon button row */}
          <div style={{ display: 'flex', gap: 8, paddingBottom: 10, alignItems: 'center' }}>
            <IconBtn onClick={onBack} title="Redigera lista">
              <BackIcon />
            </IconBtn>
            <IconBtn onClick={() => setShowFilters(f => !f)} active={showFilters || hasActiveFilters} title="Filter">
              <FilterIcon />
            </IconBtn>
            <IconBtn onClick={() => { if (confirm('Rensa all data och börja om?')) onReset() }} title="Rensa">
              <TrashIcon />
            </IconBtn>
            <IconBtn onClick={onExport} title="Exportera">
              <ExportIcon />
            </IconBtn>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 10 }}>
              {[
                { label: 'Sortera', items: [['namn','A–Ö'],['position','Position'],['tid','Tid']], active: sortBy,       set: setSortBy },
                { label: 'Roll',    items: ['Alla','personal','tl','tl-ass'].map(r => [r, r === 'Alla' ? 'Alla' : ROLL_LABELS[r]]), active: activeRoll,   set: setActiveRoll },
                { label: 'Status',  items: ['Alla','Väntar','Inne','Slutat'].map(s => [s,s]),      active: activeStatus, set: setActiveStatus },
              ].map(({ label, items, active, set }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#6e6e73', width: 52, flexShrink: 0, fontWeight: 500 }}>{label}</span>
                  <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
                    {items.map(([val, lbl]) => (
                      <button key={val} onClick={() => set(val)} style={chip(active === val)}>{lbl}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Area chips */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 10 }}>
            {AREA_TABS.map(({ label }) => (
              <button key={label} onClick={() => handleAreaChange(label)} style={chip(activeArea === label)}>{label}</button>
            ))}
          </div>

          {activeArea !== 'Alla' && (
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 10 }}>
              {positionTabs.map(pos => (
                <button key={pos} onClick={() => setActivePosition(pos)} style={chip(activePosition === pos)}>{pos}</button>
              ))}
            </div>
          )}

          {/* Search — bottom of header, taller */}
          <div style={{ paddingBottom: 12 }}>
            <input
              type="search"
              placeholder="Sök namn eller position…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', background: '#f5f5f7', border: 'none', borderRadius: 14, padding: '13px 16px', fontSize: 15, color: '#1d1d1f', outline: 'none', fontFamily: FF, letterSpacing: '-0.005em', boxSizing: 'border-box' }}
            />
          </div>

        </div>
      </div>

      {/* ── Cards ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px 48px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: '#8e8e93', fontSize: 15, fontWeight: 500, padding: '64px 0' }}>Inga resultat</p>
        )}
        {filtered.map(person => (
          <PersonCard key={person.id} person={person} onUpdate={changes => onUpdate(person.id, changes)} />
        ))}
      </div>
    </div>
  )
}
