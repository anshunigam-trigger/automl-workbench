/**
 * Parse CSV text into headers + preview rows
 * @param {string} text - raw CSV string
 * @returns {{ headers: string[], rows: object[] }}
 */
export function parseCSV(text) {
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  const rows = lines.slice(1, 6).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
    const obj = {}
    headers.forEach((h, i) => { obj[h] = values[i] ?? '' })
    return obj
  })
  return { headers, rows }
}

/**
 * Guess whether a column is numeric based on preview rows
 * @param {string} col - column name
 * @param {object[]} rows - preview rows
 * @returns {boolean}
 */
export function guessNumeric(col, rows) {
  const values = rows.map(r => r[col]).filter(Boolean)
  if (values.length === 0) return false
  const numericCount = values.filter(v => !isNaN(parseFloat(v)) && isFinite(v)).length
  return numericCount / values.length > 0.7
}
