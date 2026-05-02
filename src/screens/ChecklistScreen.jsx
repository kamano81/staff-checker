import { useState } from 'react'
import { getPositionsForTL } from '../data/teams'

function fmt(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
}

function abbr(text) {
  return (text ?? '').replace(/Entré /g, 'E ').replace(/Hiss /g, 'H ').replace(/Plan /g, 'P ')
}

// ── Icons ──────────────────────────────────────────────────────────────────
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
    <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const FilterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
    <line x1="2" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="5" cy="5" r="1.75" fill="currentColor"/>
    <line x1="2" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="11" cy="11" r="1.75" fill="currentColor"/>
  </svg>
)
const ClockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const CheckCircleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

// ── Constants ──────────────────────────────────────────────────────────────
const FF    = "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
const LIME  = '#ACF532'
const BG    = '#0e0e0e'
const CARD  = '#1c1c1e'
const DIM   = '#2a2a2c'
const MUTED = '#8c8c8c'

// ── Card ───────────────────────────────────────────────────────────────────
function PersonCard({ person, onUpdate }) {
  function checkIn()  { onUpdate({ checkedIn: true,  checkedInAt: new Date().toISOString() }) }
  function checkOut() { onUpdate({ checkedOut: true, checkedOutAt: new Date().toISOString() }) }
  function undoIn()   { onUpdate({ checkedIn: false, checkedInAt: null, checkedOut: false, checkedOutAt: null }) }
  function undoOut()  { onUpdate({ checkedOut: false, checkedOutAt: null }) }

  const isIn  = person.checkedIn && !person.checkedOut
  const isOut = person.checkedOut

  const late = isIn && person.checkedInAt && person.passStart && (() => {
    const [h, m] = person.passStart.split(':').map(Number)
    const sched = new Date(person.checkedInAt)
    sched.setHours(h, m, 0, 0)
    return new Date(person.checkedInAt) > sched
  })()

  const displayTime = isOut ? fmt(person.checkedOutAt) : late ? fmt(person.checkedInAt) : person.passStart
  const timeColor   = isOut ? MUTED : isIn ? LIME : '#ffffff'
  const timeSub     = isOut ? 'slut' : `→ ${person.passEnd}`

  const isTL = person.roll === 'tl' || person.roll === 'tl-ass'
  const metaParts = isTL
    ? [person.teamleader].filter(Boolean)
    : [abbr(person.position), person.teamleader].filter(Boolean)

  const iconBg     = isIn ? LIME : DIM
  const iconColor  = isIn ? BG : isOut ? '#5a5a5c' : LIME
  const CardIcon   = isIn ? CheckIcon : isOut ? CheckCircleIcon : ClockIcon

  const fieldStyle = {
    background: isOut ? 'transparent' : DIM,
    border: isOut ? `1px solid ${DIM}` : 'none',
    borderRadius: 12, padding: '8px 12px',
    display: 'flex', alignItems: 'center', gap: 8, minWidth: 0,
  }

  return (
    <div style={{ background: CARD, borderRadius: 20, padding: 14, opacity: isOut ? 0.7 : 1 }}>
      {/* Top row: icon | info | time */}
      <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr auto', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, flexShrink: 0 }}>
          <CardIcon />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: isOut ? MUTED : '#ffffff', letterSpacing: '-0.015em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, margin: 0 }}>
              {person.name || '(inget namn)'}
            </p>
            {isTL && (
              <span style={{ flexShrink: 0, fontSize: 9, fontWeight: 800, letterSpacing: '0.04em', padding: '1px 5px', borderRadius: 4, textTransform: 'uppercase', color: isOut ? MUTED : BG, background: isOut ? '#3a3a3c' : LIME }}>
                {person.roll === 'tl' ? 'TL' : 'TL Ass'}
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: MUTED, fontWeight: 500, margin: '3px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {metaParts.map((part, i) => (
              <span key={i}>{i > 0 && <span style={{ margin: '0 4px', color: '#48484a' }}>·</span>}{part}</span>
            ))}
          </p>
        </div>

        {/* Time — click to undo check-in */}
        <div onClick={isIn ? undoIn : undefined} title={isIn ? 'Klicka för att ångra incheckning' : undefined}
          style={{ textAlign: 'right', cursor: isIn ? 'pointer' : 'default' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: timeColor, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {displayTime || '—'}
          </div>
          <div style={{ fontSize: 11, color: isIn ? LIME : MUTED, marginTop: 3, fontWeight: 500, opacity: isIn ? 0.85 : 1 }}>
            {timeSub}
          </div>
        </div>
      </div>

      {/* Actions row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${DIM}`, alignItems: 'center' }}>
        <label style={fieldStyle}>
          <span style={{ fontSize: 10, color: MUTED, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>Radio</span>
          {isOut
            ? <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: MUTED, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{person.radio || '—'}</span>
            : <input type="text" inputMode="numeric" placeholder="—" value={person.radio} onChange={e => onUpdate({ radio: e.target.value })}
                style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: 16, fontWeight: 600, color: '#ffffff', fontFamily: FF, textAlign: 'right', fontVariantNumeric: 'tabular-nums', padding: 0 }} />
          }
        </label>
        <label style={fieldStyle}>
          <span style={{ fontSize: 10, color: MUTED, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>Kort</span>
          {isOut
            ? <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: MUTED, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{person.kort || '—'}</span>
            : <input type="text" inputMode="numeric" placeholder="—" value={person.kort} onChange={e => onUpdate({ kort: e.target.value })}
                style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: 16, fontWeight: 600, color: '#ffffff', fontFamily: FF, textAlign: 'right', fontVariantNumeric: 'tabular-nums', padding: 0 }} />
          }
        </label>
        {!isIn && !isOut && (
          <button onClick={checkIn} style={{ background: LIME, color: BG, border: 'none', borderRadius: 999, padding: '8px 16px', fontSize: 12, fontWeight: 700, fontFamily: FF, cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '-0.005em' }}>
            Checka in
          </button>
        )}
        {isIn && (
          <button onClick={checkOut} style={{ background: '#ff8a4d', color: BG, border: 'none', borderRadius: 999, padding: '8px 16px', fontSize: 12, fontWeight: 700, fontFamily: FF, cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '-0.005em' }}>
            Checka ut
          </button>
        )}
        {isOut && (
          <span onClick={undoOut} title="Klicka för att ångra utcheckning"
            style={{ color: MUTED, fontSize: 12, fontWeight: 600, padding: '8px 16px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            ✓ Klar
          </span>
        )}
      </div>
    </div>
  )
}

// ── Data ───────────────────────────────────────────────────────────────────
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

function chip(active) {
  return { background: active ? LIME : 'transparent', color: active ? BG : MUTED, fontWeight: active ? 700 : 600, border: `1px solid ${active ? LIME : DIM}`, borderRadius: 999, padding: '8px 16px', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: FF, letterSpacing: '-0.005em' }
}

function IconBtn({ onClick, active, title, children }) {
  return (
    <button onClick={onClick} title={title}
      style={{ width: 46, height: 46, borderRadius: '50%', background: active ? LIME : CARD, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: active ? BG : '#ffffff', flexShrink: 0, fontFamily: FF }}>
      {children}
    </button>
  )
}

// ── Screen ─────────────────────────────────────────────────────────────────
export default function ChecklistScreen({ people, onUpdate, onExport, onBack, onReset }) {
  const [search, setSearch]                 = useState('')
  const [activeArea, setActiveArea]         = useState('Alla')
  const [activePosition, setActivePosition] = useState('Alla')
  const [activeRoll, setActiveRoll]         = useState('Alla')
  const [activeStatus, setActiveStatus]     = useState('Alla')
  const [showFilters, setShowFilters]       = useState(false)
  const [showMenu, setShowMenu]             = useState(false)
  const [sortBy, setSortBy]                 = useState('namn')

  const activeTab    = AREA_TABS.find(t => t.label === activeArea) ?? AREA_TABS[0]
  const positionTabs = activeArea === 'Alla'
    ? []
    : [...new Set(activeTab.tls.flatMap(tl => getPositionsForTL(tl)))]

  const hasActiveFilters = activeRoll !== 'Alla' || activeStatus !== 'Alla' || sortBy !== 'namn' || activeArea !== 'Alla' || activePosition !== 'Alla'

  function handleAreaChange(label) {
    setActiveArea(a => a === label && label !== 'Alla' ? 'Alla' : label)
    setActivePosition('Alla')
  }

  // Quick status pills
  const QUICK_PILLS = [
    { label: 'Alla',    status: 'Alla',   roll: 'Alla' },
    { label: 'Aktiva',  status: 'Inne',   roll: 'Alla' },
    { label: 'Väntar',  status: 'Väntar', roll: 'Alla' },
    { label: 'TL',      status: 'Alla',   roll: 'tl'   },
    { label: 'Klara',   status: 'Slutat', roll: 'Alla' },
  ]
  const activePill = QUICK_PILLS.find(p => p.status === activeStatus && p.roll === activeRoll) ?? null

  function setQuickPill(pill) {
    setActiveStatus(pill.status)
    setActiveRoll(pill.roll)
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
        return p.name.toLowerCase().split(/\s+/).some(word => word.startsWith(q))
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
      if (sortBy === 'borjar') {
        const t = (a.passStart ?? '').localeCompare(b.passStart ?? '')
        if (t !== 0) return t
      }
      if (sortBy === 'slutar') {
        const t = (a.passEnd ?? '').localeCompare(b.passEnd ?? '')
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
    <div style={{ background: BG, minHeight: '100svh', fontFamily: FF, WebkitFontSmoothing: 'antialiased', color: '#ffffff' }}>

      {/* ── Sticky header ─────────────────────────────────────────── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: BG }}>
        <div style={{ maxWidth: 460, margin: '0 auto', padding: '16px 16px 0' }}>

          {/* Title row + icon buttons */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '4px 4px 14px', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', color: '#ffffff', margin: 0, lineHeight: 1.1 }}>Incheckning</h1>
              <div style={{ fontSize: 13, color: MUTED, marginTop: 4, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                <span style={{ color: LIME, fontWeight: 700 }}>{stats.in}</span> inne · {stats.out} ute · {stats.total} totalt
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, paddingTop: 2, position: 'relative' }}>
              <IconBtn onClick={() => setShowFilters(f => !f)} active={showFilters || (hasActiveFilters && !activePill)} title="Filter"><FilterIcon /></IconBtn>
              <IconBtn onClick={() => setShowMenu(m => !m)} active={showMenu} title="Meny"><MenuIcon /></IconBtn>
              {showMenu && (
                <>
                  <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                  <div style={{ position: 'absolute', top: 54, right: 0, zIndex: 50, background: CARD, borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', border: `1px solid ${DIM}`, minWidth: 190, overflow: 'hidden' }}>
                    {[
                      { label: 'Redigera lista', action: () => { setShowMenu(false); onBack() } },
                      { label: 'Exportera',       action: () => { setShowMenu(false); onExport() } },
                      { label: 'Rensa data',      action: () => { setShowMenu(false); if (confirm('Rensa all data och börja om?')) onReset() }, danger: true },
                    ].map(({ label, action, danger }) => (
                      <button key={label} onClick={action} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '14px 18px', fontSize: 15, fontWeight: 600, fontFamily: FF, color: danger ? '#ff453a' : '#ffffff', cursor: 'pointer', letterSpacing: '-0.01em' }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Advanced filter panel */}
          {showFilters && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 14, borderTop: `1px solid ${DIM}`, paddingTop: 14 }}>
              {[
                { label: 'Sortera', items: [['namn','A–Ö'],['position','Position'],['borjar','Börjar'],['slutar','Slutar']], active: sortBy, set: setSortBy },
                { label: 'Område',  items: AREA_TABS.map(t => [t.label, t.label]), active: activeArea, set: handleAreaChange },
              ].map(({ label, items, active, set }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: MUTED, width: 52, flexShrink: 0, fontWeight: 600 }}>{label}</span>
                  <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
                    {items.map(([val, lbl]) => (
                      <button key={val} onClick={() => set(val)} style={chip(active === val)}>{lbl}</button>
                    ))}
                  </div>
                </div>
              ))}
              {activeArea !== 'Alla' && positionTabs.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: MUTED, width: 52, flexShrink: 0, fontWeight: 600 }}>Position</span>
                  <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
                    {[['Alla','Alla'], ...positionTabs.map(p => [p,p])].map(([val, lbl]) => (
                      <button key={val} onClick={() => setActivePosition(val)} style={chip(activePosition === val)}>{lbl}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick filter pills */}
          <div style={{ display: 'flex', gap: 8, paddingBottom: 12, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {QUICK_PILLS.map(pill => (
              <button key={pill.label} onClick={() => setQuickPill(pill)}
                style={chip(activePill?.label === pill.label)}>
                {pill.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* ── Cards ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 460, margin: '0 auto', padding: '4px 16px 100px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: MUTED, fontSize: 15, fontWeight: 500, padding: '64px 0' }}>Inga resultat</p>
        )}
        {filtered.map(person => (
          <PersonCard key={person.id} person={person} onUpdate={changes => onUpdate(person.id, changes)} />
        ))}
      </div>

      {/* ── Fixed search at bottom ─────────────────────────────────── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30, background: BG, borderTop: `1px solid ${DIM}`, padding: '10px 16px', paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}>
        <div style={{ maxWidth: 460, margin: '0 auto' }}>
          <input
            type="search"
            placeholder="Sök namn…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', background: CARD, border: 'none', borderRadius: 16, padding: '17px 16px', fontSize: 16, color: '#ffffff', outline: 'none', fontFamily: FF, letterSpacing: '-0.005em', boxSizing: 'border-box' }}
          />
        </div>
      </div>

    </div>
  )
}
