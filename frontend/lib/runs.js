import { modelName } from '@/lib/format'

/* Shared helpers for turning experiments into comparable model runs.
   Everything here reads only fields the backend already returns. */

export const pctText = v => (v == null || Number.isNaN(v) ? '—' : `${(v * 100).toFixed(2)}%`)
export const numText = v => (v == null || Number.isNaN(v) ? '—' : Number(v).toFixed(3))
export const secText = v => (v == null || Number.isNaN(v) ? '—' : `${Number(v).toFixed(2)}s`)

// `better` says which direction wins, so "lower is better" metrics are never highlighted backwards
export const METRICS = {
  classification: [
    { key: 'accuracy',  label: 'Accuracy',   better: 'high', text: pctText, chart: true },
    { key: 'f1',        label: 'F1 score',   better: 'high', text: pctText, chart: true },
    { key: 'precision', label: 'Precision',  better: 'high', text: pctText, chart: true },
    { key: 'recall',    label: 'Recall',     better: 'high', text: pctText, chart: true },
    { key: 'time',      label: 'Train time', better: 'low',  text: secText },
  ],
  regression: [
    { key: 'r2',   label: 'R²',         better: 'high', text: numText, chart: true },
    { key: 'rmse', label: 'RMSE',       better: 'low',  text: numText },
    { key: 'mae',  label: 'MAE',        better: 'low',  text: numText },
    { key: 'time', label: 'Train time', better: 'low',  text: secText },
  ],
}

const ok = v => v != null && !Number.isNaN(v)

// Index of the winning value (missing values ignored). -1 when fewer than two values exist or on a tie.
export function winnerIndex(values, better) {
  const found = values.map((v, i) => [v, i]).filter(([v]) => ok(v))
  if (found.length < 2) return -1
  const best = found.reduce((a, b) => (better === 'high' ? (b[0] > a[0] ? b : a) : (b[0] < a[0] ? b : a)))
  return found.filter(([v]) => v === best[0]).length > 1 ? -1 : best[1]
}

// One entry per trained model. results arrive best-first, so index 0 is the experiment's winner.
export function flattenRuns(experiments) {
  return experiments.flatMap(e =>
    e.results.map((r, i) => ({
      key: `${e.id}-${r.id}`,
      expId: e.id, modelId: r.id, name: modelName(r.id, e.task),
      dataset: e.dataset, target: e.target, task: e.task, rows: e.rows,
      createdAt: e.created_at, isWinner: i === 0,
      metrics: { accuracy: r.accuracy, f1: r.f1, precision: r.precision, recall: r.recall, r2: r.r2, rmse: r.rmse, mae: r.mae, time: r.time },
    }))
  )
}

// Flat record for CSV export
export const runRecord = r => ({
  experiment_id: r.expId, model: r.name, dataset: r.dataset, target: r.target, task: r.task, rows: r.rows,
  accuracy: r.metrics.accuracy, f1: r.metrics.f1, precision: r.metrics.precision, recall: r.metrics.recall,
  r2: r.metrics.r2, rmse: r.metrics.rmse, mae: r.metrics.mae, training_time_s: r.metrics.time, created_at: r.createdAt,
})