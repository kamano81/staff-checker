import { useState } from 'react'
import { TL_NAMES, getPositionsForTL, getTLForPosition, ALL_POSITIONS, STANDALONE_POSITIONS } from '../data/teams'

const POSITION_GROUPS = [
  { label: 'Norr',   tl: 'TL Norr' },
  { label: 'Söder',  tl: 'TL Söder' },
  { label: 'Öst',    tl: 'TL Ass Öst' },
  { label: 'Väst',   tl: 'TL Ass Väst' },
  { label: 'Plan 6', tl: 'TL Plan 6' },
  { label: 'Rond',   tl: 'TL Rond' },
]

const ROLLS = [
  { value: 'personal', label: 'Personal' },
  { value: 'tl', label: 'TL' },
  { value: 'tl-ass', label: 'TL Ass' },
]

function PersonRow({ person, onChange, onDelete }) {
  const [customPos, setCustomPos] = useState(
    Boolean(person.position && !ALL_POSITIONS.includes(person.position))
  )

  function handleTLChange(tl) {
    const positions = getPositionsForTL(tl)
    onChange({ teamleader: tl, position: positions[0] ?? '' })
    setCustomPos(false)
  }

  function handlePositionChange(val) {
    if (val === '__other__') {
      setCustomPos(true)
      onChange({ position: '', teamleader: '' })
    } else {
      setCustomPos(false)
      const tl = getTLForPosition(val)
      onChange({ position: val, teamleader: tl })
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          className="flex-1 text-gray-900 font-medium text-base outline-none border-b border-transparent focus:border-gray-300 pb-0.5"
          value={person.name}
          onChange={e => onChange({ name: e.target.value })}
          autoCorrect="off"
        />
        <button
          onClick={onDelete}
          className="text-gray-300 hover:text-red-400 active:text-red-600 text-xl leading-none p-1"
          aria-label="Ta bort"
        >
          ×
        </button>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs text-gray-400 uppercase tracking-wide">Roll</label>
          <select
            className="w-full mt-1 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 outline-none"
            value={person.roll ?? 'personal'}
            onChange={e => {
              const roll = e.target.value
              const isTL = roll === 'tl' || roll === 'tl-ass'
              onChange({ roll, passStart: isTL ? '17:00' : '17:15', passEnd: isTL ? '21:30' : '21:15' })
            }}
          >
            {ROLLS.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="text-xs text-gray-400 uppercase tracking-wide">Teamleader</label>
          <select
            className="w-full mt-1 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 outline-none"
            value={person.teamleader}
            onChange={e => handleTLChange(e.target.value)}
          >
            <option value="">— välj —</option>
            {TL_NAMES.map(tl => (
              <option key={tl} value={tl}>{tl}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 w-full">
          <div className="flex-1">
            <label className="text-xs text-gray-400 uppercase tracking-wide">Passtart</label>
            <input
              type="time"
              className="w-full mt-1 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 outline-none"
              value={person.passStart ?? '17:15'}
              onChange={e => onChange({ passStart: e.target.value })}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-400 uppercase tracking-wide">Passslut</label>
            <input
              type="time"
              className="w-full mt-1 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 outline-none"
              value={person.passEnd ?? '21:15'}
              onChange={e => onChange({ passEnd: e.target.value })}
            />
          </div>
        </div>

        {(person.roll !== 'tl' && person.roll !== 'tl-ass') && (
          <div className="flex-1">
            <label className="text-xs text-gray-400 uppercase tracking-wide">Position</label>
            {customPos ? (
              <div className="flex gap-1 mt-1">
                <input
                  className="flex-1 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 outline-none"
                  placeholder="Ange position"
                  value={person.position}
                  onChange={e => onChange({ position: e.target.value })}
                  autoCorrect="off"
                  autoFocus
                />
                <button
                  onClick={() => { setCustomPos(false); onChange({ position: '', teamleader: '' }) }}
                  className="text-gray-400 hover:text-gray-600 px-1 text-lg leading-none"
                >×</button>
              </div>
            ) : (
              <select
                className="w-full mt-1 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 outline-none"
                value={person.position}
                onChange={e => handlePositionChange(e.target.value)}
              >
                <option value="">— välj —</option>
                {POSITION_GROUPS.map(({ label, tl }) => (
                  <optgroup key={tl} label={label}>
                    {getPositionsForTL(tl).map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </optgroup>
                ))}
                <optgroup label="Fristående">
                  {STANDALONE_POSITIONS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </optgroup>
                <option value="__other__">Annan position…</option>
              </select>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function EditScreen({ people, onDone, onBack }) {
  const [list, setList] = useState(people)

  function updatePerson(id, changes) {
    setList(prev => prev.map(p => p.id === id ? { ...p, ...changes } : p))
  }

  function deletePerson(id) {
    setList(prev => prev.filter(p => p.id !== id))
  }

  function addPerson() {
    setList(prev => [...prev, {
      id: `p-${Date.now()}`,
      name: '',
      roll: 'personal',
      passStart: '17:15',
      passEnd: '21:15',
      radio: '',
      kort: '',
      position: '',
      teamleader: '',
      checkedIn: false,
      checkedInAt: null,
      checkedOut: false,
      checkedOutAt: null,
    }])
  }

  return (
    <div className="flex flex-col min-h-svh bg-gray-50">
      <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
        <button onClick={onBack} className="text-blue-600 font-medium text-sm">← Tillbaka</button>
        <h1 className="text-base font-semibold text-gray-900">Redigera lista ({list.length})</h1>
        <button
          onClick={() => onDone(list)}
          className="bg-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded-xl"
        >
          Klar
        </button>
      </div>

      <div className="flex flex-col gap-3 p-4 pb-24">
        {list.map(person => (
          <PersonRow
            key={person.id}
            person={person}
            onChange={changes => updatePerson(person.id, changes)}
            onDelete={() => deletePerson(person.id)}
          />
        ))}

        <button
          onClick={addPerson}
          className="w-full border-2 border-dashed border-gray-300 text-gray-400 font-medium py-3 rounded-xl text-sm hover:border-blue-400 hover:text-blue-500 transition-colors"
        >
          + Lägg till person
        </button>
      </div>
    </div>
  )
}
