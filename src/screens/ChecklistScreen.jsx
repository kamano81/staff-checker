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

  const cardCls   = isIn  ? 'bg-[#1D1D1F]' : 'bg-white'
  const nameCls   = isIn  ? 'text-white'    : 'text-[#1D1D1F]'
  const subCls    = isIn  ? 'text-[#86868B]': 'text-[#6E6E73]'
  const labelCls  = isIn  ? 'text-[#48484A]': 'text-[#AEAEB2]'
  const inputCls  = isIn
    ? 'bg-[#2C2C2E] border-[#3A3A3C] text-white placeholder-[#48484A] focus:border-[#636366]'
    : 'bg-[#F5F5F7] border-transparent text-[#1D1D1F] placeholder-[#AEAEB2] focus:border-[#0071E3]'
  const badgeTLCls    = isIn ? 'bg-white text-[#1D1D1F]'                  : 'bg-[#1D1D1F] text-white'
  const badgeAssCls   = isIn ? 'border border-[#3A3A3C] text-[#86868B]'   : 'border border-[#D1D1D6] text-[#6E6E73]'

  return (
    <div className={`${cardCls} ${isOut ? 'opacity-40' : ''} rounded-2xl p-4 flex gap-3 transition-colors`}>

      {/* Left: name top, info bottom */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-4">
        <div className="flex flex-wrap items-start gap-1.5">
          <p className={`font-semibold text-[17px] leading-snug ${nameCls}`}>
            {person.name || '(inget namn)'}
          </p>
          {person.roll === 'tl' && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap mt-0.5 ${badgeTLCls}`}>
              {person.teamleader}
            </span>
          )}
          {person.roll === 'tl-ass' && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap mt-0.5 ${badgeAssCls}`}>
              {person.teamleader}
            </span>
          )}
        </div>

        <p className={`text-[13px] leading-tight ${subCls}`}>
          {person.roll === 'tl' || person.roll === 'tl-ass'
            ? [person.passStart, person.passEnd].filter(Boolean).join('–')
            : [abbr(person.position), person.teamleader, [person.passStart, person.passEnd].filter(Boolean).join('–')].filter(Boolean).join(' · ')
          }
        </p>
      </div>

      {/* Right: Radio/Kort top, action bottom */}
      <div className="shrink-0 flex flex-col items-end justify-between gap-2">
        <div className="flex gap-1.5">
          {['Radio', 'Kort'].map((label, i) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className={`text-[9px] font-semibold uppercase tracking-widest ${labelCls}`}>{label}</span>
              <input
                className={`w-12 border rounded-xl px-1.5 py-1.5 text-xs font-semibold text-center outline-none transition-colors ${inputCls}`}
                placeholder="–"
                value={i === 0 ? person.radio : person.kort}
                onChange={e => onUpdate(i === 0 ? { radio: e.target.value } : { kort: e.target.value })}
                inputMode="numeric"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col items-end gap-1">
          {!person.checkedIn && (
            <button onClick={checkIn}
              className="w-12 h-10 bg-[#0071E3] text-white text-xs font-semibold rounded-xl active:opacity-80 transition-opacity">
              IN
            </button>
          )}
          {isIn && (
            <>
              <span className="text-[11px] font-semibold text-[#30D158] tabular-nums">IN {fmt(person.checkedInAt)}</span>
              <button onClick={checkOut}
                className="w-12 h-10 bg-[#FF3B30] text-white text-xs font-semibold rounded-xl active:opacity-80 transition-opacity">
                UT
              </button>
              <button onClick={undoIn} className="text-[10px] text-[#636366] underline">Ångra</button>
            </>
          )}
          {isOut && (
            <>
              <span className="text-[10px] text-[#86868B] tabular-nums">IN {fmt(person.checkedInAt)}</span>
              <span className="text-[10px] text-[#86868B] tabular-nums">UT {fmt(person.checkedOutAt)}</span>
              <button onClick={undoOut} className="text-[10px] text-[#86868B] underline">Ångra</button>
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
  const [search, setSearch]               = useState('')
  const [activeArea, setActiveArea]       = useState('Alla')
  const [activePosition, setActivePosition] = useState('Alla')
  const [activeRoll, setActiveRoll]       = useState('Alla')
  const [activeStatus, setActiveStatus]   = useState('Alla')
  const [showFilters, setShowFilters]     = useState(false)
  const [sortBy, setSortBy]               = useState('namn')

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

  const pill = active => active
    ? 'bg-[#0071E3] text-white font-semibold'
    : 'bg-white text-[#1D1D1F] font-medium border border-[#D1D1D6]'

  return (
    <div className="flex flex-col min-h-svh bg-[#F5F5F7]">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#F5F5F7]">
        <div className="flex items-center justify-between px-4 pt-5 pb-2">
          <button onClick={onBack} className="text-[#0071E3] font-medium text-sm">← Redigera</button>
          <div className="text-xs font-semibold text-center">
            <span className="text-[#30D158]">{stats.in} inne</span>
            <span className="text-[#D1D1D6]"> · </span>
            <span className="text-[#6E6E73]">{stats.out} slutat</span>
            <span className="text-[#D1D1D6]"> · </span>
            <span className="text-[#AEAEB2]">{stats.total - stats.in - stats.out} väntar</span>
          </div>
          <div className="flex gap-3 items-center">
            <button onClick={() => { if (confirm('Rensa all data och börja om?')) onReset() }}
              className="text-[#6E6E73] font-medium text-sm">Rensa</button>
            <button onClick={onExport}
              className="bg-[#0071E3] text-white text-xs font-semibold px-3 py-1.5 rounded-full">Export</button>
          </div>
        </div>

        <div className="px-4 pb-3 flex gap-2">
          <input
            type="search"
            placeholder="Sök namn eller position…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-white border border-[#D1D1D6] rounded-xl px-4 py-2 text-sm text-[#1D1D1F] outline-none focus:border-[#0071E3] placeholder-[#AEAEB2] transition-colors"
          />
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              hasActiveFilters ? 'bg-[#0071E3] text-white' : 'bg-white border border-[#D1D1D6] text-[#1D1D1F]'
            }`}
          >
            Filter{hasActiveFilters ? ' ●' : ''}
          </button>
        </div>

        {showFilters && (
          <div className="px-4 pb-3 flex flex-col gap-2.5 border-t border-[#E5E5EA] pt-3">
            {[
              { label: 'Sortera', items: [['namn','A–Ö'],['position','Position'],['tid','Tid']], active: sortBy,       set: setSortBy },
              { label: 'Roll',    items: ['Alla','personal','tl','tl-ass'].map(r => [r, r === 'Alla' ? 'Alla' : ROLL_LABELS[r]]), active: activeRoll,   set: setActiveRoll },
              { label: 'Status',  items: ['Alla','Väntar','Inne','Slutat'].map(s => [s,s]),                             active: activeStatus, set: setActiveStatus },
            ].map(({ label, items, active, set }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-[#6E6E73] w-14 shrink-0">{label}</span>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                  {items.map(([val, lbl]) => (
                    <button key={val} onClick={() => set(val)}
                      className={`shrink-0 px-3 py-1 rounded-lg text-xs transition-colors ${pill(active === val)}`}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Area tabs */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-none">
          {AREA_TABS.map(({ label }) => (
            <button key={label} onClick={() => handleAreaChange(label)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs transition-colors ${pill(activeArea === label)}`}>
              {label}
            </button>
          ))}
        </div>

        {activeArea !== 'Alla' && (
          <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-none border-t border-[#E5E5EA] pt-2">
            {positionTabs.map(pos => (
              <button key={pos} onClick={() => setActivePosition(pos)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs transition-colors ${pill(activePosition === pos)}`}>
                {pos}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 px-3 py-3 flex flex-col gap-2">
        {filtered.length === 0 && (
          <p className="text-center text-[#AEAEB2] text-sm font-medium py-16">Inga resultat</p>
        )}
        {filtered.map(person => (
          <PersonCard key={person.id} person={person} onUpdate={changes => onUpdate(person.id, changes)} />
        ))}
      </div>
    </div>
  )
}
