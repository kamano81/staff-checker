import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function fmt(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
}

function buildRows(people) {
  return people.map(p => ({
    Namn: p.name,
    Teamleader: p.teamleader,
    Position: p.position,
    Radio: p.radio,
    Kort: p.kort,
    'Incheckad': p.checkedIn ? fmt(p.checkedInAt) : '',
    'Utcheckad': p.checkedOut ? fmt(p.checkedOutAt) : '',
    Status: p.checkedOut ? 'Slutat' : p.checkedIn ? 'Inne' : 'Ej incheckad',
  }))
}

export function exportXLS(people, filename = 'personal') {
  const rows = buildRows(people)
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Personal')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function exportPDF(people, filename = 'personal') {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const date = new Date().toLocaleDateString('sv-SE')

  doc.setFontSize(14)
  doc.text(`Personalrapport – ${date}`, 14, 14)

  const rows = buildRows(people)
  autoTable(doc, {
    startY: 20,
    head: [['Namn', 'TL', 'Position', 'Radio', 'Kort', 'IN', 'UT', 'Status']],
    body: rows.map(r => [
      r['Namn'], r['Teamleader'], r['Position'],
      r['Radio'], r['Kort'],
      r['Incheckad'], r['Utcheckad'], r['Status'],
    ]),
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [37, 99, 235] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 28 },
      2: { cellWidth: 28 },
      3: { cellWidth: 18 },
      4: { cellWidth: 18 },
      5: { cellWidth: 16 },
      6: { cellWidth: 16 },
      7: { cellWidth: 25 },
    },
  })

  doc.save(`${filename}.pdf`)
}
