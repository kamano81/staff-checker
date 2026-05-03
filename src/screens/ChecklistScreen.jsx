import { useState, useRef, useEffect } from 'react'
import { getPositionsForTL } from '../data/teams'

function fmt(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
}

function abbr(text) {
  return (text ?? '').replace(/Entré /g, 'E ').replace(/Hiss /g, 'H ').replace(/Plan /g, 'P ')
}

function initials(name) {
  const parts = (name ?? '').trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
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
const FF    = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
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

  const iconBg    = isIn ? LIME : DIM
  const iconColor = isIn ? BG : isOut ? '#5a5a5c' : LIME
  const CardIcon  = isIn ? CheckIcon : isOut ? CheckCircleIcon : ClockIcon

  const fieldBg = isOut ? 'transparent' : DIM
  const fieldBorder = isOut ? `1px solid ${DIM}` : 'none'

  return (
    <div style={{ background: CARD, borderRadius: 20, padding: 14, border: `1px solid ${DIM}` }}>
      <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr auto', alignItems: 'center', gap: 12 }}>

        <div style={{ width: 44, height: 44, borderRadius: 14, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, flexShrink: 0 }}>
          <CardIcon />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: isOut ? MUTED : '#ffffff', letterSpacing: '-0.015em', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, margin: 0 }}>
              {person.name || '(inget namn)'}
            </p>
            {isTL && (
              <span style={{ flexShrink: 0, fontSize: 9, fontWeight: 800, letterSpacing: '0.04em', padding: '1px 5px', borderRadius: 4, textTransform: 'uppercase', color: isOut ? MUTED : BG, background: isOut ? '#3a3a3c' : LIME }}>
                {person.roll === 'tl' ? 'TL' : 'TL Ass'}
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: MUTED, fontWeight: 500, lineHeight: 1.2, margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {metaParts.map((part, i) => (
              <span key={i}>{i > 0 && <span style={{ margin: '0 4px', color: '#48484a' }}>·</span>}{part}</span>
            ))}
          </p>
        </div>

        <div onClick={isIn ? undoIn : undefined} title={isIn ? 'Klicka för att ångra incheckning' : undefined}
          style={{ textAlign: 'right', cursor: isIn ? 'pointer' : 'default' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: timeColor, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {displayTime || '—'}
          </div>
          <div style={{ fontSize: 11, color: isIn ? LIME : MUTED, marginTop: 3, fontWeight: 500 }}>
            {timeSub}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${DIM}`, alignItems: 'center' }}>
        <label style={{ background: fieldBg, border: fieldBorder, borderRadius: 12, padding: '0 12px', height: 32, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 10, color: MUTED, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>Radio</span>
          {isOut
            ? <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: MUTED, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{person.radio || '—'}</span>
            : <input type="text" inputMode="numeric" placeholder="—" value={person.radio} onChange={e => onUpdate({ radio: e.target.value })}
                autoComplete="new-password" autoCorrect="off" autoCapitalize="none" spellCheck={false}
                style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: 16, fontWeight: 600, color: person.radio ? '#fff' : '#5a5a5c', fontFamily: FF, textAlign: 'right', fontVariantNumeric: 'tabular-nums', padding: 0 }} />
          }
        </label>
        <label style={{ background: fieldBg, border: fieldBorder, borderRadius: 12, padding: '0 12px', height: 32, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 10, color: MUTED, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>Kort</span>
          {isOut
            ? <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: MUTED, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{person.kort || '—'}</span>
            : <input type="text" inputMode="numeric" placeholder="—" value={person.kort} onChange={e => onUpdate({ kort: e.target.value })}
                autoComplete="new-password" autoCorrect="off" autoCapitalize="none" spellCheck={false}
                style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: 16, fontWeight: 600, color: person.kort ? '#fff' : '#5a5a5c', fontFamily: FF, textAlign: 'right', fontVariantNumeric: 'tabular-nums', padding: 0 }} />
          }
        </label>
        {!isIn && !isOut && (
          <button onClick={checkIn} style={{ background: LIME, color: BG, border: 'none', borderRadius: 999, padding: '0 16px', height: 31, fontSize: 12, fontWeight: 700, fontFamily: FF, cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '-0.005em' }}>
            Checka in
          </button>
        )}
        {isIn && (
          <button onClick={checkOut} style={{ background: '#ff8a4d', color: BG, border: 'none', borderRadius: 999, padding: '0 16px', height: 31, fontSize: 12, fontWeight: 700, fontFamily: FF, cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '-0.005em' }}>
            Checka ut
          </button>
        )}
        {isOut && (
          <span onClick={undoOut} title="Klicka för att ångra utcheckning"
            style={{ color: MUTED, fontSize: 12, fontWeight: 600, padding: '8px 16px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
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
      style={{ width: 44, height: 44, borderRadius: '50%', background: active ? LIME : CARD, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: active ? BG : '#ffffff', flexShrink: 0, fontFamily: FF }}>
      {children}
    </button>
  )
}

const QUICK_PILLS = [
  { label: 'Alla',   status: 'Alla',   roll: 'Alla' },
  { label: 'Aktiva', status: 'Inne',   roll: 'Alla' },
  { label: 'Väntar', status: 'Väntar', roll: 'Alla' },
  { label: 'TL',     status: 'Alla',   roll: 'tl'   },
  { label: 'Klara',  status: 'Slutat', roll: 'Alla' },
]

// ── Screen ─────────────────────────────────────────────────────────────────
export default function ChecklistScreen({ people, eventName, onUpdate, onExport, onBack, onReset }) {
  const [search, setSearch]                 = useState('')
  const [activeArea, setActiveArea]         = useState('Alla')
  const [activePosition, setActivePosition] = useState('Alla')
  const [activeRoll, setActiveRoll]         = useState('Alla')
  const [activeStatus, setActiveStatus]     = useState('Alla')
  const [showFilters, setShowFilters]       = useState(false)
  const [showMenu, setShowMenu]             = useState(false)
  const [sortBy, setSortBy]                 = useState('namn')
  const listRef       = useRef(null)
  const [kbBottom, setKbBottom] = useState(0)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    function update() {
      const gap = window.innerHeight - vv.height - vv.offsetTop
      setKbBottom(Math.max(0, gap))
    }
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => { vv.removeEventListener('resize', update); vv.removeEventListener('scroll', update) }
  }, [])

  const activeTab    = AREA_TABS.find(t => t.label === activeArea) ?? AREA_TABS[0]
  const positionTabs = activeArea === 'Alla'
    ? []
    : [...new Set(activeTab.tls.flatMap(tl => getPositionsForTL(tl)))]

  const hasAdvancedFilters = sortBy !== 'namn' || activeArea !== 'Alla' || activePosition !== 'Alla'

  function handleAreaChange(label) {
    setActiveArea(a => a === label && label !== 'Alla' ? 'Alla' : label)
    setActivePosition('Alla')
  }

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
    total:   people.length,
    in:      people.filter(p => p.checkedIn && !p.checkedOut).length,
    out:     people.filter(p => p.checkedOut).length,
    waiting: people.filter(p => !p.checkedIn && !p.checkedOut).length,
  }

  const today = new Date().toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })

  return (
    <div style={{ background: BG, minHeight: '100svh', fontFamily: FF, WebkitFontSmoothing: 'antialiased', color: '#ffffff' }}>
      <div style={{ maxWidth: 460, margin: '0 auto', padding: '24px 16px 120px' }}>

        {/* ── Top header ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 4px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #2a2a2a, #1a1a1a)', border: `2px solid ${LIME}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              👋
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 600, color: '#fff', letterSpacing: '-0.015em', lineHeight: 1.1 }}>Incheckning</div>
              <div style={{ fontSize: 13, color: MUTED, marginTop: 2, fontWeight: 500 }}>{eventName || 'Skift ikväll'} · {today}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
            <IconBtn onClick={() => setShowFilters(f => !f)} active={showFilters || hasAdvancedFilters} title="Filter"><FilterIcon /></IconBtn>
            <IconBtn onClick={() => setShowMenu(m => !m)} active={showMenu} title="Meny"><MenuIcon /></IconBtn>
            {showMenu && (
              <>
                <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                <div style={{ position: 'absolute', top: 52, right: 0, zIndex: 50, background: CARD, borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', border: `1px solid ${DIM}`, minWidth: 190, overflow: 'hidden' }}>
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

        {/* ── Advanced filter panel ─────────────────────────────────── */}
        {showFilters && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: CARD, borderRadius: 20, padding: '16px 16px', marginBottom: 20 }}>
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

        {/* ── Hero stats card ───────────────────────────────────────── */}
        <div style={{ background: CARD, border: `1px solid ${DIM}`, borderRadius: 24, padding: '18px 20px 20px', marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: MUTED, fontWeight: 500, marginBottom: 14 }}>Status ikväll</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[
              { label: 'Inne',   val: stats.in,      color: LIME },
              { label: 'Ute',    val: stats.out,     color: '#ff8a4d' },
              { label: 'Väntar', val: stats.waiting, color: '#ffffff' },
              { label: 'Totalt', val: stats.total,   color: MUTED },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                <span style={{ fontSize: 32, fontWeight: 700, color, letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{val}</span>
                <span style={{ fontSize: 12, color: MUTED, fontWeight: 500, letterSpacing: '-0.005em' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Personal section ─────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px', marginTop: 4 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.015em' }}>Personal</div>
          <span style={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>{filtered.length} st</span>
        </div>

        {/* Quick filter pills */}
        <div style={{ display: 'flex', gap: 8, padding: '4px 4px 12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {QUICK_PILLS.map(pill => (
            <button key={pill.label} onClick={() => setQuickPill(pill)} style={chip(activePill?.label === pill.label)}>
              {pill.label}
            </button>
          ))}
        </div>

        {/* ── Cards ──────────────────────────────────────────────────── */}
        <div ref={listRef} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: MUTED, fontSize: 15, fontWeight: 500, padding: '48px 0' }}>Inga resultat</p>
          )}
          {filtered.map(person => (
            <PersonCard key={person.id} person={person} onUpdate={changes => onUpdate(person.id, changes)} />
          ))}
        </div>

      </div>

      {/* ── Floating search at bottom ─────────────────────────────────── */}
      <div style={{ position: 'fixed', bottom: kbBottom > 0 ? kbBottom + 8 : 'max(24px, env(safe-area-inset-bottom))', left: '50%', transform: 'translateX(-50%)', zIndex: 30, width: 'calc(100% - 32px)', maxWidth: 428, transition: 'bottom 0.1s ease' }}>
        <div style={{ background: 'rgba(28,28,30,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: 999, border: `1px solid ${DIM}`, padding: '4px 8px 4px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: MUTED }}>
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Sök namn…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => {
              setTimeout(() => {
                listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }, 350)
            }}
            autoComplete="new-password" autoCorrect="off" autoCapitalize="none" spellCheck={false}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 16, color: '#ffffff', fontFamily: FF, letterSpacing: '-0.005em', padding: '10px 0' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: DIM, border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: MUTED, flexShrink: 0, fontSize: 14 }}>✕</button>
          )}
        </div>
      </div>

    </div>
  )
}
