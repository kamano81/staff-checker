import { useState, useRef } from 'react'
import { TL_NAMES, getPositionsForTL, ALL_POSITIONS } from '../data/teams'

function fmt(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
}

function abbr(text) {
  return (text ?? '').replace(/Entré /g, 'E ').replace(/Hiss /g, 'H ').replace(/Plan /g, 'P ')
}

function PersonCard({ person, onUpdate }) {
  function checkIn() { onUpdate({ checkedIn: true, checkedInAt: new Date().toISOString() }) }
  function checkOut() { onUpdate({ checkedOut: true, checkedOutAt: new Date().toISOString() }) }
  function undoIn() { onUpdate({ checkedIn: false, checkedInAt: null, checkedOut: false, checkedOutAt: null }) }
  function undoOut() { onUpdate({ checkedOut: false, checkedOutAt: null }) }

  const isIn = person.checkedIn && !person.checkedOut
  const isOut = person.checkedOut

  const cardBg = isIn ? 'bg-gray-950' : isOut ? 'bg-white opacity-40' : 'bg-white'
  const nameColor = isIn ? 'text-white' : 'text-gray-950'
  const subColor = isIn ? 'text-gray-400' : 'text-gray-400'
  const labelColor = isIn ? 'text-gray-500' : 'text-gray-300'
  const inputCls = isIn
    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-600 focus:border-gray-500'
    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-300 focus:border-gray-400'

  return (
    <div className={`${cardBg} rounded-2xl p-4 flex gap-3 transition-colors`}>
      {/* Name + info: top/bottom layout */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
        {/* Top: name + badge */}
        <div>
          <div className="flex items-start gap-2 min-w-0 flex-wrap">
            <p className={`font-black text-[17px] leading-snug ${nameColor}`}>
              {person.name || '(inget namn)'}
            </p>
            {person.roll === 'tl' && (
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full tracking-wide whitespace-nowrap mt-0.5 ${isIn ? 'bg-white text-gray-950' : 'bg-gray-950 text-white'}`}>
                {person.teamleader}
              </span>
            )}
            {person.roll === 'tl-ass' && (
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap mt-0.5 ${isIn ? 'border border-gray-600 text-gray-400' : 'border border-gray-300 text-gray-400'}`}>
                {person.teamleader}
              </span>
            )}
          </div>
        </div>

        {/* Bottom: position · tl · tid */}
        <p className={`text-[12px] font-medium leading-tight ${subColor}`}>
          {person.roll === 'tl' || person.roll === 'tl-ass'
            ? [person.passStart, person.passEnd].filter(Boolean).join('–')
            : [abbr(person.position), person.teamleader, [person.passStart, person.passEnd].filter(Boolean).join('–')].filter(Boolean).join(' · ')
          }
        </p>
      </div>

      {/* Right side: Radio + Kort + Action */}
      <div className="shrink-0 flex flex-col items-end justify-between gap-2">
        {/* Radio + Kort */}
        <div className="flex gap-1.5">
          {['Radio', 'Kort'].map((label, i) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <span className={`text-[9px] font-bold uppercase tracking-widest ${labelColor}`}>{label}</span>
              <input
                className={`w-12 border rounded-lg px-1.5 py-1.5 text-xs font-bold text-center outline-none transition-colors ${inputCls}`}
                placeholder="–"
                value={i === 0 ? person.radio : person.kort}
                onChange={e => onUpdate(i === 0 ? { radio: e.target.value } : { kort: e.target.value })}
                inputMode="numeric"
              />
            </div>
          ))}
        </div>

        {/* Action */}
        <div className="flex flex-col items-end gap-1">
          {!person.checkedIn && (
            <button onClick={checkIn}
              className="w-12 h-10 bg-gray-950 text-white text-xs font-black rounded-xl active:scale-95 transition-transform">
              IN
            </button>
          )}

          {isIn && (
            <>
              <span className="text-[11px] font-black text-emerald-400 tabular-nums">IN {fmt(person.checkedInAt)}</span>
              <button onClick={checkOut}
                className="w-12 h-10 bg-orange-500 text-white text-xs font-black rounded-xl active:scale-95 transition-transform">
                UT
              </button>
              <button onClick={undoIn} className="text-[10px] text-gray-600 underline">Ångra</button>
            </>
          )}

          {isOut && (
            <>
              <span className="text-[10px] text-gray-400 tabular-nums">IN {fmt(person.checkedInAt)}</span>
              <span className="text-[10px] text-gray-400 tabular-nums">UT {fmt(person.checkedOutAt)}</span>
              <button onClick={undoOut} className="text-[10px] text-gray-400 underline">Ångra</button>
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
  const [search, setSearch] = useState('')
  const [activeArea, setActiveArea] = useState('Alla')
  const [activePosition, setActivePosition] = useState('Alla')
  const [activeRoll, setActiveRoll] = useState('Alla')
  const [activeStatus, setActiveStatus] = useState('Alla')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('namn')

  const activeTab = AREA_TABS.find(t => t.label === activeArea) ?? AREA_TABS[0]
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
      if (activeStatus === 'Inne' && !(p.checkedIn && !p.checkedOut)) return false
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
        const rollOrder = { tl: 0, 'tl-ass': 1, personal: 2 }
        const ro = (rollOrder[a.roll ?? 'personal'] ?? 2) - (rollOrder[b.roll ?? 'personal'] ?? 2)
        if (ro !== 0) return ro
        const pos = (a.position || 'Ö').localeCompare(b.position || 'Ö', 'sv')
        if (pos !== 0) return pos
      }
      if (sortBy === 'tid') {
        const ta = (a.passStart ?? '').localeCompare(b.passStart ?? '')
        if (ta !== 0) return ta
      }
      return a.name.localeCompare(b.name, 'sv')
    })

  const stats = {
    total: people.length,
    in: people.filter(p => p.checkedIn && !p.checkedOut).length,
    out: people.filter(p => p.checkedOut).length,
  }

  const pill = (active) =>
    active
      ? 'bg-gray-950 text-white font-bold'
      : 'bg-white border border-gray-200 text-gray-500 font-medium'

  return (
    <div className="flex flex-col min-h-svh bg-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-100 border-b border-gray-200">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <button onClick={onBack} className="text-gray-400 font-bold text-sm tracking-wide">← REDIGERA</button>
          <div className="text-xs font-black text-center tracking-wide">
            <span className="text-emerald-500">{stats.in} INNE</span>
            <span className="text-gray-300"> · </span>
            <span className="text-gray-400">{stats.out} SLUTAT</span>
            <span className="text-gray-300"> · </span>
            <span className="text-gray-400">{stats.total - stats.in - stats.out} VÄNTAR</span>
          </div>
          <div className="flex gap-3 items-center">
            <button onClick={() => { if (confirm('Rensa all data och börja om?')) onReset() }} className="text-gray-400 font-bold text-sm tracking-wide">RENSA</button>
            <button onClick={onExport} className="bg-gray-950 text-white text-xs font-black px-3 py-1.5 rounded-full tracking-wide">EXPORT</button>
          </div>
        </div>

        <div className="px-4 pb-3 flex gap-2">
          <input
            type="search"
            placeholder="Sök namn eller position..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-900 outline-none focus:border-gray-400 placeholder-gray-300 transition-colors"
          />
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-black tracking-wide transition-colors ${
              hasActiveFilters ? 'bg-gray-950 text-white' : 'bg-white border border-gray-200 text-gray-500'
            }`}
          >
            FILTER{hasActiveFilters ? ' ●' : ''}
          </button>
        </div>

        {showFilters && (
          <div className="px-4 pb-3 flex flex-col gap-2.5 border-t border-gray-200 pt-3">
            {[
              { label: 'SORT', items: [['namn','A–Ö'],['position','Position'],['tid','Tid']], active: sortBy, set: setSortBy },
              { label: 'ROLL', items: ['Alla','personal','tl','tl-ass'].map(r => [r, r === 'Alla' ? 'Alla' : ROLL_LABELS[r]]), active: activeRoll, set: setActiveRoll },
              { label: 'STATUS', items: ['Alla','Väntar','Inne','Slutat'].map(s => [s,s]), active: activeStatus, set: setActiveStatus },
            ].map(({ label, items, active, set }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest w-12 shrink-0">{label}</span>
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

        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-none">
          {AREA_TABS.map(({ label }) => (
            <button key={label} onClick={() => handleAreaChange(label)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs transition-colors ${pill(activeArea === label)}`}>
              {label}{label !== 'Alla' && activeArea === label ? ' ▾' : ''}
            </button>
          ))}
        </div>

        {activeArea !== 'Alla' && (
          <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-none border-t border-gray-200 pt-2">
            {positionTabs.map(pos => (
              <button key={pos} onClick={() => setActivePosition(pos)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs transition-colors ${pill(activePosition === pos)}`}>
                {pos}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Card list */}
      <div className="flex-1 px-3 py-3 flex flex-col gap-2">
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 text-sm font-bold py-16 tracking-wide">INGA RESULTAT</p>
        )}
        {filtered.map(person => (
          <PersonCard key={person.id} person={person} onUpdate={changes => onUpdate(person.id, changes)} />
        ))}
      </div>
    </div>
  )
}
