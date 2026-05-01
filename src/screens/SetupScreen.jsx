import { useState } from 'react'
import { TEST_PEOPLE } from '../data/testData'

function parseNames(text) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 1)
    .map((name, i) => ({
      id: `p-${Date.now()}-${i}`,
      name,
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
    }))
}

export default function SetupScreen({ onDone }) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  function handleContinue() {
    const people = parseNames(text)
    if (people.length === 0) {
      setError('Klistra in minst ett namn.')
      return
    }
    onDone(people)
  }

  return (
    <div className="flex flex-col min-h-svh bg-gray-50 p-4">
      <div className="max-w-lg mx-auto w-full flex flex-col gap-6 py-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Personal</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Fotografera personallistan, använd Live Text för att kopiera namnen, och klistra in nedan.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Ett namn per rad</p>
          </div>
          <textarea
            className="w-full p-4 text-gray-900 text-base resize-none outline-none min-h-[240px] font-mono"
            placeholder={"Anna Lindgren\nBjörn Karlsson\nCecilia Svensson"}
            value={text}
            onChange={e => { setText(e.target.value); setError('') }}
            autoCorrect="off"
            autoCapitalize="words"
            spellCheck={false}
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="text-sm text-gray-400">
          {parseNames(text).length > 0 && (
            <span>{parseNames(text).length} namn identifierade</span>
          )}
        </div>

        <button
          onClick={handleContinue}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-4 rounded-2xl text-lg transition-colors"
        >
          Fortsätt →
        </button>

        <button
          onClick={() => onDone(TEST_PEOPLE)}
          className="w-full border border-gray-300 text-gray-500 font-medium py-3 rounded-2xl text-sm hover:bg-gray-100 transition-colors"
        >
          Ladda testdata ({TEST_PEOPLE.length} personer)
        </button>
      </div>
    </div>
  )
}
