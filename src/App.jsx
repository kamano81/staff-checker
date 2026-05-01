import { useState, useEffect } from 'react'
import SetupScreen from './screens/SetupScreen'
import EditScreen from './screens/EditScreen'
import ChecklistScreen from './screens/ChecklistScreen'
import ExportModal from './screens/ExportModal'
import './index.css'

const STORAGE_KEY = 'staff-checker-v1'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

function save(screen, people) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ screen, people }))
}

export default function App() {
  const saved = load()
  const [screen, setScreen] = useState(saved?.screen ?? 'setup')
  const [people, setPeople] = useState(saved?.people ?? [])
  const [showExport, setShowExport] = useState(false)

  useEffect(() => {
    save(screen, people)
  }, [screen, people])

  function updatePerson(id, changes) {
    setPeople(prev => prev.map(p => p.id === id ? { ...p, ...changes } : p))
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY)
    setPeople([])
    setScreen('setup')
  }

  if (screen === 'setup') {
    return (
      <SetupScreen
        onDone={parsed => { setPeople(parsed); setScreen('edit') }}
      />
    )
  }

  if (screen === 'edit') {
    return (
      <EditScreen
        people={people}
        onBack={() => setScreen('setup')}
        onDone={updated => { setPeople(updated); setScreen('checklist') }}
      />
    )
  }

  return (
    <>
      <ChecklistScreen
        people={people}
        onUpdate={updatePerson}
        onExport={() => setShowExport(true)}
        onBack={() => setScreen('edit')}
        onReset={reset}
      />
      {showExport && (
        <ExportModal
          people={people}
          onClose={() => setShowExport(false)}
        />
      )}
    </>
  )
}
