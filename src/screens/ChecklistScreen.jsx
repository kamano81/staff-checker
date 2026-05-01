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

  return (
    <div className={`
      rounded-3xl px-5 py-4 flex gap-4 transition-all
      ${isIn  ? 'bg-[#1D1D1F] shadow-lg shadow-black/10' : ''}
      ${isOut ? 'bg-white shadow-sm shadow-black/5 opacity-40' : ''}
      ${!isIn && !isOut ? 'bg-white shadow-sm shadow-black/5' : ''}
    `}>

      {/* Left column */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-5">
        <div>
          <p className={`font-semibold text-[17px] leading-snug ${isIn ? 'text-white' : 'text-[#1D1D1F]'}`}>
            {person.name || '(inget namn)'}
          </p>
          {person.roll === 'tl' && (
            <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
              isIn ? 'bg-white/10 text-white' : 'bg-[#1D1D1F] text-white'
            }`}>
              {person.teamleader}
            </span>
          )}
          {person.roll === 'tl-ass' && (
            <span className={`inline-block mt-1.5 text-[10px] font-medium px-2.5 py-0.5 rounded-full ${
              isIn ? 'bg-white/10 text-white/60' : 'bg-[#F5F5F7] text-[#6E6E73]'
            }`}>
              {person.teamleader}
            </span>
          )}
        </div>

        <p className={`text-[12px] leading-tight ${isIn ? 'text-white/40' : 'text-[#AEAEB2]'}`}>
          {person.roll === 'tl' || person.roll === 'tl-ass'
            ? [person.passStart, person.passEnd].filter(Boolean).join('–')
            : [abbr(person.position), person.teamleader, [person.passStart, person.passEnd].filter(Boolean).join('–')].filter(Boolean).join(' · ')
          }
        </p>
      </div>

      {/* Right column */}
      <div className="shrink-0 flex flex-col justify-between items-end gap-3">

        {/* Radio + Kort */}
        <div className="flex gap-2">
          {['Radio', 'Kort'].map((label, i) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className={`text-[9px] font-medium uppercase tracking-widest ${isIn ? 'text-white/30' : 'text-[#C7C7CC]'}`}>{label}</span>
              <input
                className={`w-12 rounded-2xl py-1.5 text-xs font-semibold text-center outline-none transition-colors ${
                  isIn
                    ? 'bg-white/10 text-white placeholder-white/20 focus:bg-white/20'
                    : 'bg-[#F5F5F7] text-[#1D1D1F] placeholder-[#C7C7CC] focus:bg-[#E5E5EA]'
                }`}
                placeholder="–"
                value={i === 0 ? person.radio : person.kort}
                onChange={e => onUpdate(i === 0 ? { radio: e.target.value } : { kort: e.target.value })}
                inputMode="numeric"
              />
            </div>
          ))}
        </div>

        {/* Action */}
        <div className="flex flex-col items-end gap-1.5">
          {!person.checkedIn && (
            <button onClick={checkIn}
              className="px-4 h-9 bg-[#0071E3] text-white text-[13px] font-semibold rounded-full active:opacity-75 transition-opacity">
              Checka in
            </button>
          )}
          {isIn && (
            <>
              <span className="text-[11px] font-medium text-[#30D158] tabular-nums">IN {fmt(person.checkedInAt)}</span>
              <button onClick={checkOut}
                className="px-4 h-9 bg-[#FF3B30] text-white text-[13px] font-semibold rounded-full active:opacity-75 transition-opacity">
                Checka ut
              </button>
              <button onClick={undoIn} className="text-[11px] text-white/30 underline underline-offset-2">Ångra</button>
            </>
          )}
          {isOut && (
            <>
              <span className="text-[11px] text-[#AEAEB2] tabular-nums">IN {fmt(person.checkedInAt)}</span>
              <span className="text-[11px] text-[#AEAEB2] tabular-nums">UT {fmt(person.checkedOutAt)}</span>
              <button onClick={undoOut} className="text-[11px] text-[#AEAEB2] underline underline-offset-2">Ångra</button>
            </>
          )}
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

  const chip = active => active
    ? 'bg-[#1D1D1F] text-white font-semibold shadow-sm'
    : 'bg-white text-[#1D1D1F] font-medium shadow-sm shadow-black/5'

  return (
    <div className="flex flex-col min-h-svh bg-[#F2F2F7]">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#F2F2F7]">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <button onClick={onBack} className="text-[#0071E3] font-medium text-[15px]">← Redigera</button>
          <div className="text-[13px] font-medium text-center">
            <span className="text-[#30D158]">{stats.in} inne</span>
            <span className="text-[#C7C7CC]"> · </span>
            <span className="text-[#6E6E73]">{stats.out} slutat</span>
            <span className="text-[#C7C7CC]"> · </span>
            <span className="text-[#AEAEB2]">{stats.total - stats.in - stats.out} väntar</span>
          </div>
          <div className="flex gap-3 items-center">
            <button onClick={() => { if (confirm('Rensa all data och börja om?')) onReset() }}
              className="text-[#6E6E73] font-medium text-[15px]">Rensa</button>
            <button onClick={onExport}
              className="bg-[#0071E3] text-white text-[13px] font-semibold px-4 py-1.5 rounded-full active:opacity-75 transition-opacity">
              Export
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-3 flex gap-2">
          <input
            type="search"
            placeholder="Sök namn eller position…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-white shadow-sm shadow-black/5 rounded-2xl px-4 py-2.5 text-[15px] text-[#1D1D1F] outline-none placeholder-[#C7C7CC] transition-colors"
          />
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`shrink-0 px-4 py-2 rounded-2xl text-[13px] font-semibold transition-colors shadow-sm ${
              hasActiveFilters ? 'bg-[#1D1D1F] text-white' : 'bg-white text-[#1D1D1F] shadow-black/5'
            }`}
          >
            Filter{hasActiveFilters ? ' ●' : ''}
          </button>
        </div>

        {showFilters && (
          <div className="px-4 pb-3 flex flex-col gap-3 pt-1">
            {[
              { label: 'Sortera', items: [['namn','A–Ö'],['position','Position'],['tid','Tid']], active: sortBy,       set: setSortBy },
              { label: 'Roll',    items: ['Alla','personal','tl','tl-ass'].map(r => [r, r === 'Alla' ? 'Alla' : ROLL_LABELS[r]]), active: activeRoll,   set: setActiveRoll },
              { label: 'Status',  items: ['Alla','Väntar','Inne','Slutat'].map(s => [s,s]),      active: activeStatus, set: setActiveStatus },
            ].map(({ label, items, active, set }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-[#6E6E73] w-14 shrink-0">{label}</span>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                  {items.map(([val, lbl]) => (
                    <button key={val} onClick={() => set(val)}
                      className={`shrink-0 px-3 py-1 rounded-full text-[12px] transition-colors ${chip(active === val)}`}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Area chips */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-none">
          {AREA_TABS.map(({ label }) => (
            <button key={label} onClick={() => handleAreaChange(label)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] transition-colors ${chip(activeArea === label)}`}>
              {label}
            </button>
          ))}
        </div>

        {activeArea !== 'Alla' && (
          <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-none">
            {positionTabs.map(pos => (
              <button key={pos} onClick={() => setActivePosition(pos)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] transition-colors ${chip(activePosition === pos)}`}>
                {pos}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 px-4 py-2 flex flex-col gap-2.5 pb-8">
        {filtered.length === 0 && (
          <p className="text-center text-[#AEAEB2] text-[15px] font-medium py-16">Inga resultat</p>
        )}
        {filtered.map(person => (
          <PersonCard key={person.id} person={person} onUpdate={changes => onUpdate(person.id, changes)} />
        ))}
      </div>
    </div>
  )
}
