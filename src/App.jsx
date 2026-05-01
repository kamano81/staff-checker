import { useState } from 'react'
import SetupScreen from './screens/SetupScreen'
import EditScreen from './screens/EditScreen'
import ChecklistScreen from './screens/ChecklistScreen'
import ExportModal from './screens/ExportModal'
import './index.css'

export default function App() {
  const [screen, setScreen] = useState('setup')
  const [people, setPeople] = useState([])
  const [showExport, setShowExport] = useState(false)

  function updatePerson(id, changes) {
    setPeople(prev => prev.map(p => p.id === id ? { ...p, ...changes } : p))
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
