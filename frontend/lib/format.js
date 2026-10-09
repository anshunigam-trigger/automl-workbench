import { CLS_MODELS, REG_MODELS } from '@/lib/constants'

// "2026-07-27T10:00:00Z" → "3h ago"
export function timeAgo(isoString) {
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

// Backend stores accuracy as a fraction (0.8155) → show "81.55%"
// Regression has no accuracy, so show R² instead.
export function formatScore(best, task) {
  if (!best) return '—'
  if (task === 'classification') return `${(best.accuracy * 100).toFixed(2)}%`
  return best.r2 == null ? '—' : `R² ${best.r2.toFixed(2)}`
}

// "lr" → "Logistic Regression"
export function modelName(id, task) {
  const list = task === 'classification' ? CLS_MODELS : REG_MODELS
  return list.find(m => m.id === id)?.name ?? id
}