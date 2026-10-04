// Turns an array of objects into a CSV file and makes the browser download it.
export function downloadCsv(filename, rows) {
  if (!rows.length) return

  const headers = Object.keys(rows[0])

  // A value containing a comma, quote or newline must be wrapped in quotes,
  // and any quote inside it doubled — otherwise the columns break.
  const escape = value => {
    const text = value == null ? '' : String(value)
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }

  const csv = [
    headers.join(','),
    ...rows.map(row => headers.map(h => escape(row[h])).join(',')),
  ].join('\n')

  // Blob = a file that exists only in memory. We give it a temporary URL,
  // click an invisible link pointing at it, then clean the URL up.
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}