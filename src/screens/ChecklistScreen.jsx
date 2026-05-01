import { useState } from 'react'
import { getPositionsForTL, ALL_POSITIONS } from '../data/teams'

function fmt(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
}

function abbr(text) {
  return (text ?? '').replace(/Entré /g, 'E ').replace(/Hiss /g, 'H ').replace(/Plan /g, 'P ')
}

function PersonCard({ person, onUpdate }) {
  function checkIn()  { onUpdate({ checkedIn: true,  checkedInAt: new Date().toISOString() }) }
  function checkOut() { onUpdate({ checkedOut: true, checkedOutAt: new Date().toISOString() }) }
  function undoIn()   { onUpdate({ checkedIn: false, checkedInAt: null, checkedOut: false, checkedOutAt: null }) }
  function undoOut()  { onUpdate({ checkedOut: false, checkedOutAt: null }) }

  const isIn  = person.checkedIn && !person.checkedOut
  const isOut = person.checkedOut

  const cardBg   = isIn || isOut ? '#e8e8e6' : '#f1f1ef'
  const fieldBg  = isIn || isOut ? '#ededeb' : '#ffffff'
  const nameCls  = isIn || isOut ? 'text-[#6a6a67]' : 'text-[#0a0a0a]'
  const inputCls = isIn || isOut ? 'text-[#6a6a67]' : 'text-[#0a0a0a]'

  const metaParts = person.roll === 'tl' || person.roll === 'tl-ass'
    ? [person.roll === 'tl' ? 'TL' : 'TL Ass', person.teamleader].filter(Boolean)
    : [abbr(person.position), person.teamleader].filter(Boolean)

  const timeStr = [person.passStart, person.passEnd].filter(Boolean).join(' — ')

  return (
    <div
      style={{ background: cardBg, borderRadius: 18, padding: '14px 14px 14px 16px', opacity: isOut ? 0.6 : 1 }}
      className="grid gap-x-3 gap-y-2.5 transition-all"
      css-grid="1fr auto / auto auto"
    >
      {/* Use inline style for grid since arbitrary cols need JIT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gridTemplateRows: 'auto auto', gap: '10px 12px' }}>

        {/* Name + meta */}
        <div style={{ gridColumn: 1, gridRow: 1, minWidth: 0 }}>
          <p className={`font-semibold text-[17px] leading-tight tracking-[-0.01em] truncate ${nameCls}`}>
            {person.name || '(inget namn)'}
          </p>
          <p className="text-[12px] text-[#6a6a67] mt-0.5 truncate">
            {metaParts.map((part, i) => (
              <span key={i}>
                {i > 0 && <span style={{ color: '#c4c4c1', margin: '0 5px' }}>·</span>}
                {part}
              </span>
            ))}
          </p>
        </div>

        {/* Time pill */}
        {timeStr ? (
          <div style={{ gridColumn: 2, gridRow: 1, alignSelf: 'start' }}
            className="bg-white rounded-full px-[10px] py-[5px] text-[12px] text-[#1a1a1a] tabular-nums whitespace-nowrap">
            {timeStr}
          </div>
        ) : <div style={{ gridColumn: 2, gridRow: 1 }} />}

        {/* Actions row */}
        <div style={{ gridColumn: '1 / -1', gridRow: 2, display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8 }}>

          {/* Radio */}
          <label className="flex items-center gap-2 rounded-xl px-[10px] py-2 min-w-0"
            style={{ background: fieldBg }}>
            <span className="text-[11px] text-[#8a8a87] uppercase tracking-[0.02em] font-medium shrink-0">Radio</span>
            <input
              className={`flex-1 min-w-0 text-right text-[14px] font-medium bg-transparent outline-none border-none font-[inherit] ${inputCls} placeholder-[#c4c4c1]`}
              type="text"
              inputMode="numeric"
              placeholder="Nr"
              value={person.radio}
              onChange={e => onUpdate({ radio: e.target.value })}
              disabled={isIn || isOut}
            />
          </label>

          {/* Kort */}
          <label className="flex items-center gap-2 rounded-xl px-[10px] py-2 min-w-0"
            style={{ background: fieldBg }}>
            <span className="text-[11px] text-[#8a8a87] uppercase tracking-[0.02em] font-medium shrink-0">Kort</span>
            <input
              className={`flex-1 min-w-0 text-right text-[14px] font-medium bg-transparent outline-none border-none font-[inherit] ${inputCls} placeholder-[#c4c4c1]`}
              type="text"
              inputMode="numeric"
              placeholder="Nr"
              value={person.kort}
              onChange={e => onUpdate({ kort: e.target.value })}
              disabled={isIn || isOut}
            />
          </label>

          {/* Action button */}
          <div className="flex flex-col items-stretch gap-1">
            {!person.checkedIn && (
              <button onClick={checkIn}
                className="bg-[#0a0a0a] text-white rounded-xl px-4 h-full text-[13px] font-medium whitespace-nowrap active:scale-[0.97] transition-transform">
                Checka in
              </button>
            )}
            {isIn && (
              <>
                <button disabled
                  className="bg-[#1a5a3a] text-white rounded-xl px-3 py-2 text-[13px] font-medium whitespace-nowrap">
                  ✓ Incheckad
                </button>
                <button onClick={checkOut}
                  className="text-[11px] text-[#8a8a87] underline underline-offset-2 text-center">
                  Checka ut
                </button>
              </>
            )}
            {isOut && (
              <>
                <div className="text-[11px] text-[#6a6a67] text-right tabular-nums leading-tight">
                  <div>IN {fmt(person.checkedInAt)}</div>
                  <div>UT {fmt(person.checkedOutAt)}</div>
                </div>
                <button onClick={undoOut}
                  className="text-[11px] text-[#8a8a87] underline underline-offset-2 text-center">
                  Ångra
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

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

  // Pill style matching the mockup
  const chip = active => ({
    background: active ? '#0a0a0a' : '#f1f1ef',
    color: active ? '#ffffff' : '#0a0a0a',
    fontWeight: active ? 600 : 500,
    borderRadius: 999,
    padding: '6px 14px',
    fontSize: 13,
    border: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  })

  return (
    <div style={{ background: '#d9d9d6', minHeight: '100svh', fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Helvetica Neue', sans-serif" }}>

      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: '#d9d9d6', paddingTop: 16 }}>
        <div style={{ maxWidth: 460, margin: '0 auto', padding: '0 16px' }}>

          {/* Top bar */}
          <div className="flex items-center justify-between pb-3">
            <button onClick={onBack} style={{ color: '#0a0a0a', fontWeight: 500, fontSize: 15, background: 'none', border: 'none', cursor: 'pointer' }}>
              ← Redigera
            </button>
            <div style={{ fontSize: 13, color: '#6a6a67', tabularNums: true }} className="tabular-nums">
              {stats.in} / {stats.total} incheckade
            </div>
            <div className="flex gap-3 items-center">
              <button onClick={() => { if (confirm('Rensa all data och börja om?')) onReset() }}
                style={{ color: '#8a8a87', fontWeight: 500, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer' }}>
                Rensa
              </button>
              <button onClick={onExport}
                style={{ background: '#0a0a0a', color: '#fff', fontWeight: 500, fontSize: 13, borderRadius: 999, padding: '6px 14px', border: 'none', cursor: 'pointer' }}>
                Export
              </button>
            </div>
          </div>

          {/* Search + filter */}
          <div className="flex gap-2 pb-3">
            <input
              type="search"
              placeholder="Sök namn eller position…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, background: '#f1f1ef', border: 'none', borderRadius: 12, padding: '9px 14px', fontSize: 15, color: '#0a0a0a', outline: 'none', fontFamily: 'inherit' }}
            />
            <button
              onClick={() => setShowFilters(f => !f)}
              style={{ ...chip(hasActiveFilters), background: hasActiveFilters ? '#0a0a0a' : '#f1f1ef' }}>
              Filter{hasActiveFilters ? ' ●' : ''}
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-col gap-2.5 pb-3">
              {[
                { label: 'Sortera', items: [['namn','A–Ö'],['position','Position'],['tid','Tid']], active: sortBy,       set: setSortBy },
                { label: 'Roll',    items: ['Alla','personal','tl','tl-ass'].map(r => [r, r === 'Alla' ? 'Alla' : ROLL_LABELS[r]]), active: activeRoll,   set: setActiveRoll },
                { label: 'Status',  items: ['Alla','Väntar','Inne','Slutat'].map(s => [s,s]),      active: activeStatus, set: setActiveStatus },
              ].map(({ label, items, active, set }) => (
                <div key={label} className="flex items-center gap-2">
                  <span style={{ fontSize: 11, color: '#8a8a87', width: 56, flexShrink: 0, fontWeight: 500 }}>{label}</span>
                  <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                    {items.map(([val, lbl]) => (
                      <button key={val} onClick={() => set(val)} style={chip(active === val)}>{lbl}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Area chips */}
          <div className="flex gap-2 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
            {AREA_TABS.map(({ label }) => (
              <button key={label} onClick={() => handleAreaChange(label)} style={chip(activeArea === label)}>{label}</button>
            ))}
          </div>

          {activeArea !== 'Alla' && (
            <div className="flex gap-2 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
              {positionTabs.map(pos => (
                <button key={pos} onClick={() => setActivePosition(pos)} style={chip(activePosition === pos)}>{pos}</button>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Card list */}
      <div style={{ maxWidth: 460, margin: '0 auto', padding: '0 16px 40px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: '#8a8a87', fontSize: 15, fontWeight: 500, padding: '64px 0' }}>Inga resultat</p>
        )}
        {filtered.map(person => (
          <PersonCard key={person.id} person={person} onUpdate={changes => onUpdate(person.id, changes)} />
        ))}
      </div>
    </div>
  )
}
