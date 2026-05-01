import { useState, useRef } from 'react'
import { TL_NAMES, getPositionsForTL, ALL_POSITIONS } from '../data/teams'

function fmt(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
}

function initials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase()
}

function avatarColor(name) {
  const colors = [
    'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
    'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500',
  ]
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff
  return colors[hash % colors.length]
}

function statusBg(person) {
  if (person.checkedOut) return 'bg-gray-50'
  if (person.checkedIn) return 'bg-green-50'
  return 'bg-white'
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
    <div className={`border-b border-gray-100 px-4 py-3 flex items-center gap-3 ${statusBg(person)}`}>
      {/* Name + position */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <p className={`font-semibold text-sm truncate ${person.checkedOut ? 'text-gray-400' : 'text-gray-900'}`}>
            {person.name || '(inget namn)'}
          </p>
          {person.roll === 'tl' && (
            <span className="shrink-0 text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded whitespace-nowrap">{person.teamleader}</span>
          )}
          {person.roll === 'tl-ass' && (
            <span className="shrink-0 text-[9px] font-bold bg-indigo-400 text-white px-1.5 py-0.5 rounded whitespace-nowrap">{person.teamleader}</span>
          )}
        </div>
        <p className="text-xs text-gray-400 truncate">
          {person.roll === 'tl' || person.roll === 'tl-ass'
            ? [person.passStart, person.passEnd].filter(Boolean).join('–')
            : [person.position, person.teamleader, [person.passStart, person.passEnd].filter(Boolean).join('–')].filter(Boolean).join(' · ')
          }
        </p>
      </div>

      {/* Radio + Kort */}
      <div className="flex gap-1.5 shrink-0">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] text-gray-400 uppercase tracking-wide">Radio</span>
          <input
            ref={radioRef}
            className="w-12 border border-gray-200 rounded-lg px-1.5 py-1 text-xs text-center text-gray-800 outline-none focus:border-blue-400 bg-white"
            placeholder="nr"
            value={person.radio}
            onChange={e => onUpdate({ radio: e.target.value })}
            inputMode="numeric"
          />
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] text-gray-400 uppercase tracking-wide">Kort</span>
          <input
            ref={kortRef}
            className="w-12 border border-gray-200 rounded-lg px-1.5 py-1 text-xs text-center text-gray-800 outline-none focus:border-blue-400 bg-white"
            placeholder="nr"
            value={person.kort}
            onChange={e => onUpdate({ kort: e.target.value })}
            inputMode="numeric"
          />
        </div>
      </div>

      {/* Status + actions */}
      <div className="shrink-0 flex flex-col items-end gap-1 min-w-[72px]">
        {!person.checkedIn && (
          <button
            onClick={checkIn}
            className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
          >
            ✓ IN
          </button>
        )}

        {person.checkedIn && !person.checkedOut && (
          <>
            <span className="text-xs font-semibold text-green-600">IN {fmt(person.checkedInAt)}</span>
            <button
              onClick={checkOut}
              className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
            >
              → UT
            </button>
          </>
        )}

        {person.checkedOut && (
          <>
            <span className="text-[10px] text-gray-400">IN {fmt(person.checkedInAt)}</span>
            <span className="text-[10px] text-gray-400">UT {fmt(person.checkedOutAt)}</span>
            <button
              onClick={undoOut}
              className="text-[10px] text-blue-500 underline"
            >
              Ångra UT
            </button>
          </>
        )}

        {person.checkedIn && !person.checkedOut && (
          <button onClick={undoIn} className="text-[10px] text-gray-400 underline">Ångra IN</button>
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

  return (
    <div className="flex flex-col min-h-svh bg-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={onBack} className="text-blue-600 font-medium text-sm">← Redigera</button>
          <div className="text-xs text-gray-400 font-medium text-center">
            <span className="text-green-600 font-semibold">{stats.in} inne</span>
            {' · '}
            <span>{stats.out} slutat</span>
            {' · '}
            <span>{stats.total - stats.in - stats.out} väntar</span>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { if (confirm('Rensa all data och börja om?')) onReset() }} className="text-red-400 font-medium text-sm">Rensa</button>
            <button onClick={onExport} className="text-blue-600 font-medium text-sm">Export</button>
          </div>
        </div>

        <div className="px-4 pb-2 flex gap-2">
          <input
            type="search"
            placeholder="Sök namn eller position..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-gray-100 rounded-xl px-4 py-2 text-sm text-gray-900 outline-none placeholder-gray-400"
          />
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              hasActiveFilters
                ? 'bg-blue-600 text-white border-blue-600'
                : showFilters
                  ? 'bg-gray-200 text-gray-700 border-gray-200'
                  : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            Filter{hasActiveFilters ? ' ●' : ''}
          </button>
        </div>

        {showFilters && (
          <div className="px-4 pb-3 flex flex-col gap-2 border-t border-gray-100 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide w-12 shrink-0">Sortera</span>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                {[['namn', 'A–Ö'], ['position', 'Position'], ['tid', 'Tid']].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setSortBy(val)}
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      sortBy === val ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide w-12 shrink-0">Roll</span>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                {['Alla', 'personal', 'tl', 'tl-ass'].map(r => (
                  <button
                    key={r}
                    onClick={() => setActiveRoll(r)}
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      activeRoll === r ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {r === 'Alla' ? 'Alla' : ROLL_LABELS[r]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide w-12 shrink-0">Status</span>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                {['Alla', 'Väntar', 'Inne', 'Slutat'].map(s => (
                  <button
                    key={s}
                    onClick={() => setActiveStatus(s)}
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      activeStatus === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-none">
          {AREA_TABS.map(({ label }) => (
            <button
              key={label}
              onClick={() => handleAreaChange(label)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeArea === label ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {label}{label !== 'Alla' && activeArea === label ? ' ▾' : ''}
            </button>
          ))}
        </div>

        {activeArea !== 'Alla' && (
          <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-none border-t border-gray-100 pt-2">
            {positionTabs.map(pos => (
              <button
                key={pos}
                onClick={() => setActivePosition(pos)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activePosition === pos ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        )}

        {/* Column headers */}
        <div className="flex items-center gap-3 px-4 py-1.5 bg-gray-50 border-t border-gray-100">
          <div className="w-9 shrink-0" />
          <div className="flex-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Namn</div>
          <div className="shrink-0 w-[104px] text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-center">Radio / Kort</div>
          <div className="shrink-0 w-[72px] text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-right">Status</div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1">
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-12">Inga resultat</p>
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
