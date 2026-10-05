'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import Stat from '@/components/Stat'
import { useExperiments } from '@/lib/useExperiments'
import { timeAgo, modelName, pct, rowScore, seconds } from '@/lib/format'

const PER_PAGE = 8

const TASK_STYLE = {
  classification: { label: 'Classification', color: 'var(--sky)',  bg: 'var(--sky-dim)',  border: 'var(--sky-glow)'  },
  regression:     { label: 'Regression',     color: 'var(--teal)', bg: 'var(--teal-dim)', border: 'var(--teal-glow)' },
}

const pill = active => ({
  padding: '7px 12px', borderRadius: 7, fontSize: 11, fontWeight: 500, cursor: 'pointer',
  fontFamily: 'var(--sans)', textTransform: 'capitalize',
  border: `1px solid ${active ? 'var(--sky-glow)' : 'var(--border)'}`,
  background: active ? 'var(--sky-dim)' : 'transparent',
  color: active ? 'var(--sky)' : 'var(--text2)',
})

// The four metric boxes in the summary panel depend on the task type
function metricBoxes(r) {
  if (r.task === 'classification') {
    return [
      { label: 'Accuracy',  value: pct(r.score) },
      { label: 'F1 Score',  value: pct(r.f1) },
      { label: 'Precision', value: pct(r.precision) },
      { label: 'Recall',    value: pct(r.recall) },
    ]
  }
  return [
    { label: 'R²',         value: r.score == null ? '—' : r.score.toFixed(3) },
    { label: 'RMSE',       value: r.rmse  == null ? '—' : r.rmse.toFixed(3) },
    { label: 'MAE',        value: r.mae   == null ? '—' : r.mae.toFixed(3) },
    { label: 'Train time', value: seconds(r.time) },
  ]
}

const AlgoTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{ background: 'rgba(13,21,38,.97)', border: '1px solid #1E2D45', borderRadius: 8, padding: '8px 12px', fontSize: 11, fontFamily: 'var(--mono)' }}>
      <div style={{ color: '#F0F6FF', marginBottom: 4 }}>{d.name}</div>
      <div style={{ color: '#2DD4BF' }}>Avg accuracy: {d.accuracy}%</div>
      <div style={{ color: '#8BA0BF' }}>{d.runs} run{d.runs === 1 ? '' : 's'}</div>
    </div>
  )
}

export default function ModelsPage() {
  const { experiments, loading, error } = useExperiments()
  const [search, setSearch]           = useState('')
  const [task, setTask]               = useState('all')
  const [page, setPage]               = useState(1)
  const [selectedKey, setSelectedKey] = useState(null)

  // ── 1. Flatten: experiments → one row per trained model ──
  // Results arrive sorted best-first, so index 0 is the experiment's winner.
  const rows = experiments.flatMap(e =>
    e.results.map((r, i) => ({
      key:       `${e.id}-${r.id}`,
      name:      modelName(r.id, e.task),
      dataset:   e.dataset,
      task:      e.task,
      score:     e.task === 'classification' ? r.accuracy : r.r2,
      f1: r.f1, precision: r.precision, recall: r.recall,
      rmse: r.rmse, mae: r.mae, time: r.time,
      createdAt: e.created_at,
      isWinner:  i === 0,
    }))
  )

  // ── 2. Derive everything else from `rows` ──
  const classRows = rows.filter(r => r.task === 'classification' && r.score != null)
  const pool      = classRows.length ? classRows : rows.filter(r => r.score != null)
  const bestRow   = pool.reduce((best, r) => (!best || r.score > best.score ? r : best), null)

  const timed   = rows.filter(r => r.time != null)
  const fastest = timed.reduce((f, r) => (!f || r.time < f.time ? r : f), null)
  const avgTime = timed.length ? timed.reduce((s, r) => s + r.time, 0) / timed.length : null

  // Average accuracy per algorithm (classification only)
  const byAlgo = {}
  classRows.forEach(r => {
    byAlgo[r.name] ??= { name: r.name, total: 0, runs: 0 }
    byAlgo[r.name].total += r.score
    byAlgo[r.name].runs  += 1
  })
  const chartData = Object.values(byAlgo)
    .map(a => ({ name: a.name, accuracy: +((a.total / a.runs) * 100).toFixed(2), runs: a.runs }))
    .sort((a, b) => b.accuracy - a.accuracy)

  // ── 3. Search + filter + paginate ──
  const q          = search.toLowerCase()
  const filtered   = rows.filter(r =>
    (task === 'all' || r.task === task) &&
    (r.name.toLowerCase().includes(q) || r.dataset.toLowerCase().includes(q))
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage   = Math.min(page, totalPages)
  const visible    = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)
  const featured   = rows.find(r => r.key === selectedKey) ?? bestRow

  return (
    <div className="page-content">

      {/* Header */}
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <div>
          <div className="breadcrumb">Models</div>
          <div className="page-title"><span className="grad">Model Registry</span></div>
          <div className="page-sub">Every model AutoBench has trained for you, with real metrics.</div>
        </div>
        <Link href="/experiments" className="btn primary">+ Train Model</Link>
      </div>

      {error && <div className="error-bar">⚠ &nbsp;{error}</div>}

      {/* KPIs */}
      <div className="stats-bar fade-up-1">
        <Stat label="Models Trained" value={rows.length}        loading={loading} />
        <Stat label="Experiments"    value={experiments.length} loading={loading} />
        <Stat label="Best Score"     value={bestRow ? rowScore(bestRow.task, bestRow.score) : '—'}
              sub={bestRow?.name} color="var(--teal)" loading={loading} />
        <Stat label="Fastest"        value={fastest ? seconds(fastest.time) : '—'}
              sub={fastest?.name} loading={loading} />
        <Stat label="Avg Train Time" value={avgTime == null ? '—' : `${avgTime.toFixed(2)}s`} loading={loading} />
      </div>

      {/* Empty state */}
      {!loading && !error && rows.length === 0 && (
        <div className="card fade-up-2" style={{ textAlign: 'center', padding: '56px 24px', borderStyle: 'dashed' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🧠</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No models trained yet</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
            Every model you train will be listed here with its metrics.
          </div>
          <Link href="/experiments" className="btn primary">+ Train your first model</Link>
        </div>
      )}

      {(loading || rows.length > 0) && (
        <>
          {/* Chart + best model summary */}
          <div className="dash-grid fade-up-2">

            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-header">
                <div>
                  <div className="card-title"><span className="card-title-icon">📊</span>Algorithm Comparison</div>
                  <div className="card-sub">Average accuracy of each algorithm across all classification experiments</div>
                </div>
              </div>
              {loading ? (
                <div className="skeleton" style={{ height: 180 }} />
              ) : chartData.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>Train a classification model to see this chart.</div>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(180, chartData.length * 44)}>
                  <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: '#3D5470', fontSize: 10 }} tickFormatter={v => `${v}%`} />
                    <YAxis type="category" dataKey="name" width={130} tick={{ fill: '#8BA0BF', fontSize: 10 }} />
                    <Tooltip content={<AlgoTooltip />} cursor={{ fill: 'rgba(255,255,255,.03)' }} />
                    <Bar dataKey="accuracy" fill="#38BDF8" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <span className="card-title-icon">⭐</span>
                    {selectedKey ? 'Selected Model' : 'Best Model'}
                  </div>
                  <div className="card-sub">Click any row below to inspect it</div>
                </div>
                {selectedKey && (
                  <button onClick={() => setSelectedKey(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--sky)', fontSize: 11, cursor: 'pointer' }}>
                    Reset
                  </button>
                )}
              </div>

              {loading || !featured ? (
                <div className="skeleton" style={{ height: 180 }} />
              ) : (
                <>
                  <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text)', marginBottom: 3 }}>
                    {featured.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', marginBottom: 14 }}>
                    {featured.dataset} · {timeAgo(featured.createdAt)}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {metricBoxes(featured).map(m => (
                      <div key={m.label} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal)', fontFamily: 'var(--mono)' }}>{m.value}</div>
                        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '.06em' }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 12 }}>
                    Trained in <b style={{ color: 'var(--text)' }}>{seconds(featured.time)}</b>
                    {featured.isWinner && ' · 🏆 won its experiment'}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Inventory table */}
          <div className="card fade-up-3">
            <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="card-title"><span className="card-title-icon">🗂️</span>Model Inventory</div>
                <div className="card-sub">{filtered.length} of {rows.length} models</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  placeholder="🔍 Search models or datasets..."
                  style={{ padding: '8px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 12, outline: 'none', width: 220 }}
                />
                {['all', 'classification', 'regression'].map(t => (
                  <button key={t} style={pill(task === t)} onClick={() => { setTask(t); setPage(1) }}>{t}</button>
                ))}
              </div>
            </div>

            <div className="table-wrap">
              <table className="preview-table">
                <thead>
                  <tr>
                    <th>Model</th><th>Dataset</th><th>Task</th>
                    <th>Score</th><th>F1 / RMSE</th><th>Time</th><th>Trained</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7}><div className="skeleton" style={{ height: 24 }} /></td></tr>
                  ) : visible.length === 0 ? (
                    <tr><td colSpan={7} style={{ color: 'var(--text3)', textAlign: 'center', padding: 24 }}>No models match your search.</td></tr>
                  ) : visible.map(r => {
                    const t = TASK_STYLE[r.task]
                    return (
                      <tr key={r.key} onClick={() => setSelectedKey(r.key)}
                          style={{ cursor: 'pointer', background: selectedKey === r.key ? 'var(--sky-dim)' : undefined }}>
                        <td style={{ fontWeight: 600, color: 'var(--text)' }}>
                          {r.name} {r.isWinner && <span className="badge badge-best" style={{ marginLeft: 6 }}>BEST</span>}
                        </td>
                        <td style={{ color: 'var(--text2)' }}>{r.dataset}</td>
                        <td>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: t.bg, color: t.color, border: `1px solid ${t.border}` }}>
                            {t.label}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--teal)' }}>{rowScore(r.task, r.score)}</div>
                          {r.task === 'classification' && r.score != null && (
                            <div style={{ height: 3, width: 70, background: 'var(--border)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${r.score * 100}%`, background: 'var(--teal)' }} />
                            </div>
                          )}
                        </td>
                        <td>{r.task === 'classification' ? pct(r.f1) : (r.rmse == null ? '—' : r.rmse.toFixed(3))}</td>
                        <td style={{ color: 'var(--text3)' }}>{seconds(r.time)}</td>
                        <td style={{ color: 'var(--text3)' }}>{timeAgo(r.createdAt)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, fontSize: 11, color: 'var(--text2)' }}>
                <span>Page {safePage} of {totalPages}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn" style={{ padding: '5px 12px', fontSize: 11 }} disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>Prev</button>
                  <button className="btn" style={{ padding: '5px 12px', fontSize: 11 }} disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)}>Next</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}