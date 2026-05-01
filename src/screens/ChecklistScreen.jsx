import { useState, useRef } from 'react'
import { TL_NAMES, getPositionsForTL, ALL_POSITIONS } from '../data/teams'

function fmt(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
}

function abbr(text) {
  return (text ?? '').replace(/Entré /g, 'E ').replace(/Hiss /g, 'H ').replace(/Plan /g, 'P ')
}

function statusBg(person) {
  if (person.checkedOut) return 'bg-zinc-950 opacity-50'
  if (person.checkedIn) return 'bg-zinc-900 border-l-2 border-l-emerald-500'
  return 'bg-zinc-900'
}

function PersonRow({ person, onUpdate }) {
  const radioRef = useRef(null)
  const kortRef = useRef(null)

  function checkIn() {
    onUpdate({ checkedIn: true, checkedInAt: new Date().toISOString() })
  }
  function checkOut() {
    onUpdate({ checkedOut: true, checkedOutAt: new Date().toISOString() })
  }
  function undoIn() {
    onUpdate({ checkedIn: false, checkedInAt: null, checkedOut: false, checkedOutAt: null })
  }
  function undoOut() {
    onUpdate({ checkedOut: false, checkedOutAt: null })
  }

  return (
    <div className={`border-b border-zinc-800 px-4 py-3 flex items-center gap-3 ${statusBg(person)}`}>
      {/* Name + position */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <p className={`font-bold text-sm truncate ${person.checkedOut ? 'text-zinc-600' : 'text-white'}`}>
            {person.name || '(inget namn)'}
          </p>
          {person.roll === 'tl' && (
            <span className="shrink-0 text-[9px] font-bold bg-white text-zinc-950 px-1.5 py-0.5 rounded whitespace-nowrap">{person.teamleader}</span>
          )}
          {person.roll === 'tl-ass' && (
            <span className="shrink-0 text-[9px] font-bold bg-zinc-600 text-white px-1.5 py-0.5 rounded whitespace-nowrap">{person.teamleader}</span>
          )}
        </div>
        <p className="text-xs text-zinc-500 truncate">
          {person.roll === 'tl' || person.roll === 'tl-ass'
            ? [person.passStart, person.passEnd].filter(Boolean).join('–')
            : [abbr(person.position), person.teamleader, [person.passStart, person.passEnd].filter(Boolean).join('–')].filter(Boolean).join(' · ')
          }
        </p>
      </div>

      {/* Radio + Kort */}
      <div className="flex gap-1.5 shrink-0 ml-auto">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] text-zinc-600 uppercase tracking-wide">Radio</span>
          <input
            ref={radioRef}
            className="w-12 border border-zinc-700 rounded-lg px-1.5 py-1 text-xs text-center text-white outline-none focus:border-zinc-400 bg-zinc-800"
            placeholder="nr"
            value={person.radio}
            onChange={e => onUpdate({ radio: e.target.value })}
            inputMode="numeric"
          />
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] text-zinc-600 uppercase tracking-wide">Kort</span>
          <input
            ref={kortRef}
            className="w-12 border border-zinc-700 rounded-lg px-1.5 py-1 text-xs text-center text-white outline-none focus:border-zinc-400 bg-zinc-800"
            placeholder="nr"
            value={person.kort}
            onChange={e => onUpdate({ kort: e.target.value })}
            inputMode="numeric"
          />
        </div>
      </div>

      {/* Status + actions */}
      <div className="shrink-0 flex flex-col items-end gap-1 min-w-[48px]">
        {!person.checkedIn && (
          <button
            onClick={checkIn}
            className="w-10 h-10 bg-emerald-500 active:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors"
          >
            IN
          </button>
        )}

        {person.checkedIn && !person.checkedOut && (
          <>
            <span className="text-xs font-bold text-emerald-400">IN {fmt(person.checkedInAt)}</span>
            <button
              onClick={checkOut}
              className="w-10 h-10 bg-orange-500 active:bg-orange-600 text-white text-xs font-bold rounded-xl transition-colors"
            >
              UT
            </button>
          </>
        )}

        {person.checkedOut && (
          <>
            <span className="text-[10px] text-zinc-600">IN {fmt(person.checkedInAt)}</span>
            <span className="text-[10px] text-zinc-600">UT {fmt(person.checkedOutAt)}</span>
            <button onClick={undoOut} className="text-[10px] text-zinc-500 underline">Ångra UT</button>
          </>
        )}

        {person.checkedIn && !person.checkedOut && (
          <button onClick={undoIn} className="text-[10px] text-zinc-600 underline">Ångra IN</button>
        )}
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

  const pillActive = 'bg-white text-zinc-950 font-semibold'
  const pillInactive = 'bg-zinc-800 text-zinc-400'

  return (
    <div className="flex flex-col min-h-svh bg-zinc-950">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-zinc-950 border-b border-zinc-800">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={onBack} className="text-zinc-400 font-medium text-sm">← Redigera</button>
          <div className="text-xs font-semibold text-center">
            <span className="text-emerald-400">{stats.in} inne</span>
            <span className="text-zinc-600"> · </span>
            <span className="text-zinc-400">{stats.out} slutat</span>
            <span className="text-zinc-600"> · </span>
            <span className="text-zinc-500">{stats.total - stats.in - stats.out} väntar</span>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { if (confirm('Rensa all data och börja om?')) onReset() }} className="text-red-500 font-medium text-sm">Rensa</button>
            <button onClick={onExport} className="text-white font-semibold text-sm">Export</button>
          </div>
        </div>

        <div className="px-4 pb-2 flex gap-2">
          <input
            type="search"
            placeholder="Sök namn eller position..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-zinc-800 rounded-xl px-4 py-2 text-sm text-white outline-none placeholder-zinc-500"
          />
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              hasActiveFilters ? 'bg-white text-zinc-950' : showFilters ? 'bg-zinc-700 text-white' : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            Filter{hasActiveFilters ? ' ●' : ''}
          </button>
        </div>

        {showFilters && (
          <div className="px-4 pb-3 flex flex-col gap-2 border-t border-zinc-800 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest w-12 shrink-0">Sort</span>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                {[['namn', 'A–Ö'], ['position', 'Position'], ['tid', 'Tid']].map(([val, label]) => (
                  <button key={val} onClick={() => setSortBy(val)}
                    className={`shrink-0 px-3 py-1 rounded-full text-xs transition-colors ${sortBy === val ? pillActive : pillInactive}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest w-12 shrink-0">Roll</span>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                {['Alla', 'personal', 'tl', 'tl-ass'].map(r => (
                  <button key={r} onClick={() => setActiveRoll(r)}
                    className={`shrink-0 px-3 py-1 rounded-full text-xs transition-colors ${activeRoll === r ? pillActive : pillInactive}`}>
                    {r === 'Alla' ? 'Alla' : ROLL_LABELS[r]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest w-12 shrink-0">Status</span>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                {['Alla', 'Väntar', 'Inne', 'Slutat'].map(s => (
                  <button key={s} onClick={() => setActiveStatus(s)}
                    className={`shrink-0 px-3 py-1 rounded-full text-xs transition-colors ${activeStatus === s ? pillActive : pillInactive}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-none">
          {AREA_TABS.map(({ label }) => (
            <button key={label} onClick={() => handleAreaChange(label)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeArea === label ? pillActive : pillInactive
              }`}>
              {label}{label !== 'Alla' && activeArea === label ? ' ▾' : ''}
            </button>
          ))}
        </div>

        {activeArea !== 'Alla' && (
          <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-none border-t border-zinc-800 pt-2">
            {positionTabs.map(pos => (
              <button key={pos} onClick={() => setActivePosition(pos)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activePosition === pos ? 'bg-zinc-200 text-zinc-950' : pillInactive
                }`}>
                {pos}
              </button>
            ))}
          </div>
        )}

        {/* Column headers */}
        <div className="flex items-center gap-3 px-4 py-1.5 bg-zinc-900 border-t border-zinc-800">
          <div className="flex-1 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Namn</div>
          <div className="shrink-0 w-[104px] text-[10px] font-bold text-zinc-600 uppercase tracking-widest text-center">Radio / Kort</div>
          <div className="shrink-0 w-[48px] text-[10px] font-bold text-zinc-600 uppercase tracking-widest text-right">Status</div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1">
        {filtered.length === 0 && (
          <p className="text-center text-zinc-600 text-sm py-12">Inga resultat</p>
        )}
        {filtered.map(person => (
          <PersonRow
            key={person.id}
            person={person}
            onUpdate={changes => onUpdate(person.id, changes)}
          />
        ))}
      </div>
    </div>
  )
}
