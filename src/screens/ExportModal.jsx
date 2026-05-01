import { exportXLS, exportPDF } from '../utils/export'

export default function ExportModal({ people, onClose }) {
  const date = new Date().toLocaleDateString('sv-SE').replace(/\//g, '-')
  const filename = `personal-${date}`

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-gray-900 text-center">Exportera</h2>

        <button
          onClick={() => { exportXLS(people, filename); onClose() }}
          className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-4 rounded-2xl text-base transition-colors flex items-center justify-center gap-2"
        >
          <span>📊</span> Exportera som Excel (.xlsx)
        </button>

        <button
          onClick={() => { exportPDF(people, filename); onClose() }}
          className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold py-4 rounded-2xl text-base transition-colors flex items-center justify-center gap-2"
        >
          <span>📄</span> Exportera som PDF
        </button>

        <button
          onClick={onClose}
          className="w-full py-3 text-gray-500 font-medium text-sm"
        >
          Avbryt
        </button>
      </div>
    </div>
  )
}
