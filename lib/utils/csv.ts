'use client'

/**
 * Utilitas untuk mengunduh data dalam format CSV di sisi klien.
 */
export function exportToCSV(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
) {
  if (typeof window === 'undefined') return

  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(val => {
        const strVal = val === null || val === undefined ? '' : String(val)
        return `"${strVal.replace(/"/g, '""')}"`
      }).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
