'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useExperiments } from '@/lib/useExperiments'
import { analyzeExperiment } from '@/lib/analyze'
import { timeAgo, formatScore, rowScore, seconds, duration, TASK_STYLE } from '@/lib/format'

const MAX_PICKS = 4
const SERIES    = ['#38BDF8', '#A78BFA', '#2DD4BF', '#FBBF24']   // one color per selected experiment

const labelOf = e => `${e.dataset.replace(/\.csv$/i, '')} #${e.id}`

const pill = active => ({
  padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer',
  fontFamily: 'var(--sans)',
  border: `1px solid ${active ? 'var(--sky-glow)' : 'var(--border)'}`,
  background: active ? 'var(--sky-dim)' : 'transparent',
  color: active ? 'var(--sky)' : 'var(--text2)',
})

const Dot = ({ color }) => (
  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: color, marginRight: 6 }} />
)

export default function ComparePage() {
  const { experiments, loading, error } = useExperiments()
  const [picked, setPicked]     = useState(null)      // null = "user hasn't chosen yet" → use the default pair
  const [metric, setMetric]     = useState('score')   // 'score' | 'time'
  const [diffOnly, setDiffOnly] = useState(false)

  const analyses = experiments.map(e => ({ e, a: analyzeExperiment(e) }))

  // Default selection: the newest experiment plus the next newest of the same task
  const defaultIds = (() => {
    if (!experiments.length) return []
    const first   = experiments[0]
    const partner = experiments.find(e => e.id !== first.id && e.task === first.task)
    return partner ? [first.id, partner.id] : []
  })()

  const ids      = picked ?? defaultIds
  const selected = ids.map(id => analyses.find(x => x.e.id === id)).filter(Boolean)
  const task     = selected[0]?.e.task ?? null

  const toggle = id =>
    setPicked(prev => {
      const current = prev ?? defaultIds
      if (current.includes(id)) return current.filter(x => x !== id)
      return current.length < MAX_PICKS ? [...current, id] : current
    })

  // Why can't this experiment be picked? (null = it can)
  const blockedReason = e => {
    if (ids.includes(e.id)) return null
    if (task && e.task !== task) return `Can't mix ${e.task} with ${task}: accuracy and R² are different scales`
    if (ids.length >= MAX_PICKS) return `You can compare up to ${MAX_PICKS} experiments`
    return null
  }

  /* ── Summary table: attributes down the side, experiments across the top ── */
  const sameDataset = new Set(selected.map(({ e }) => e.dataset)).size <= 1

  const scoreOf = ({ a }) => a.best?.score ?? -Infinity
  const bestIdx = selected.length > 1
    ? selected.reduce((bi, s, i) => (scoreOf(s) > scoreOf(selected[bi]) ? i : bi), 0)
    : -1

  const summaryRows = [
    { label: 'Dataset',             values: selected.map(({ e }) => e.dataset) },
    { label: 'Target column',       values: selected.map(({ e }) => e.target) },
    { label: 'Rows',                values: selected.map(({ e }) => e.rows?.toLocaleString() ?? '—') },
    { label: 'Models trained',      values: selected.map(({ a }) => String(a.models.length)) },
    { label: 'Best model',          values: selected.map(({ a }) => a.best?.name ?? '—') },
    { label: 'Best score',          values: selected.map(({ e, a }) => formatScore(a.best, e.task)), highlight: bestIdx },
    { label: 'Fastest model',       values: selected.map(({ a }) => a.fastest?.name ?? '—') },
    { label: 'Total training time', values: selected.map(({ a }) => duration(a.totalTime)) },
    { label: 'Trained',             values: selected.map(({ e }) => timeAgo(e.created_at)) },
  ]
  const visibleRows = diffOnly ? summaryRows.filter(r => new Set(r.values).size > 1) : summaryRows

  /* ── Matrix: one row per algorithm, one column per experiment ── */
  const getVal = m => (m == null ? null : metric === 'score' ? m.score : m.time)
  const better = (x, y) => (metric === 'score' ? x > y : x < y)   // best = highest score or lowest time
  const fmtCell = v => (v == null ? '—' : metric === 'score' ? rowScore(task, v) : seconds(v))

  const names = [...new Set(selected.flatMap(({ a }) => a.models.map(m => m.name)))]
  const matrix = names.map(name => {
    const vals    = selected.map(({ a }) => getVal(a.models.find(m => m.name === name)))
    const present = vals.filter(v => v != null)
    const best    = present.length > 1 ? present.reduce((b, v) => (better(v, b) ? v : b)) : null
    return { name, vals, best }
  })
  const rowBest = r => {
    const present = r.vals.filter(v => v != null)
    if (!present.length) return Infinity
    return metric === 'score' ? Math.max(...present) : Math.min(...present)
  }
  matrix.sort((x, y) => (metric === 'score' ? rowBest(y) - rowBest(x) : rowBest(x) - rowBest(y)))

  const chartData = names.map(name => {
    const row = { name }
    selected.forEach(({ a }, i) => {
      const v = getVal(a.models.find(m => m.name === name))
      row[`e${i}`] = v == null ? null : metric === 'score' ? Math.max(0, v) : v   // never draw a negative bar
    })
    return row
  })

  const ready = selected.length >= 2

  return (
    <div className="page-content">

      {/* Header */}
      <div className="page-header fade-up">
        <div className="breadcrumb">Compare</div>
        <div className="page-title"><span className="grad">Compare Experiments</span></div>
        <div className="page-sub">Put experiments side by side to see what changed and what won.</div>
      </div>

      {error && <div className="error-bar">⚠ &nbsp;{error}</div>}

      {/* Not enough data */}
      {!loading && !error && experiments.length < 2 && (
        <div className="card fade-up-1" style={{ textAlign: 'center', padding: '56px 24px', borderStyle: 'dashed' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚖️</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>You need at least two experiments to compare</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
            Run another experiment, ideally on the same dataset with different algorithms.
          </div>
          <Link href="/experiments" className="btn primary">+ Run an experiment</Link>
        </div>
      )}

      {(loading || experiments.length >= 2) && (
        <>
          {/* Picker */}
          <div className="card fade-up-1">
            <div className="card-header">
              <div>
                <div className="card-title"><span className="card-title-icon">☑️</span>Choose experiments</div>
                <div className="card-sub">Pick 2 to {MAX_PICKS} of the same task type · {ids.length} selected</div>
              </div>
              {ids.length > 0 && (
                <button onClick={() => setPicked([])}
                  style={{ background: 'none', border: 'none', color: 'var(--sky)', fontSize: 11, cursor: 'pointer' }}>
                  Clear
                </button>
              )}
            </div>

            <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {loading
                ? [0, 1, 2].map(i => <div key={i} className="skeleton" style={{ height: 46 }} />)
                : analyses.map(({ e, a }) => {
                    const on  = ids.includes(e.id)
                    const why = blockedReason(e)
                    const t   = TASK_STYLE[e.task]
                    return (
                      <button
                        key={e.id} type="button" aria-pressed={on} disabled={!!why}
                        title={why ?? undefined} onClick={() => toggle(e.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
                          padding: '10px 12px', borderRadius: 10, fontFamily: 'var(--sans)', color: 'inherit',
                          cursor: why ? 'not-allowed' : 'pointer', opacity: why ? 0.4 : 1,
                          background: on ? 'var(--sky-dim)' : 'var(--surface2)',
                          border: `1px solid ${on ? 'var(--sky-glow)' : 'var(--border)'}`,
                        }}
                      >
                        <span style={{
                          width: 16, height: 16, borderRadius: 4, flexShrink: 0, display: 'grid', placeItems: 'center',
                          fontSize: 10, fontWeight: 700, color: '#020817',
                          background: on ? SERIES[ids.indexOf(e.id)] : 'transparent',
                          border: `1px solid ${on ? 'transparent' : 'var(--border2)'}`,
                        }}>{on && '✓'}</span>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{e.dataset}</div>
                          <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 2 }}>
                            #{e.id} · target: {e.target} · {e.rows?.toLocaleString() ?? '—'} rows · {timeAgo(e.created_at)}
                          </div>
                        </div>

                        <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: t.bg, color: t.color, border: `1px solid ${t.border}` }}>
                          {t.label}
                        </span>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: 'var(--teal)', minWidth: 64, textAlign: 'right' }}>
                          {formatScore(a.best, e.task)}
                        </span>
                      </button>
                    )
                  })}
            </div>
          </div>

          {!loading && !ready && (
            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)', padding: '32px 0' }}>
              Select at least two experiments above to compare them.
            </div>
          )}

          {ready && (
            <>
              {!sameDataset && (
                <div className="fade-up" style={{
                  padding: '12px 16px', marginBottom: 16, borderRadius: 10, fontSize: 12, lineHeight: 1.6,
                  background: '#FBBF2412', border: '1px solid #FBBF2440', color: 'var(--text2)',
                }}>
                  <b style={{ color: 'var(--amber)' }}>⚠ Different datasets.</b> Score differences here reflect the
                  data as much as the models. For a fair comparison, pick runs on the same dataset.
                </div>
              )}

              {/* Summary */}
              <div className="card fade-up-1">
                <div className="card-header">
                  <div>
                    <div className="card-title"><span className="card-title-icon">📋</span>Summary</div>
                    <div className="card-sub">Best value in the score row is highlighted</div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text2)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={diffOnly} onChange={e => setDiffOnly(e.target.checked)} />
                    Show only differences
                  </label>
                </div>

                <div className="table-wrap">
                  <table className="preview-table">
                    <thead>
                      <tr>
                        <th></th>
                        {selected.map(({ e }, i) => (
                          <th key={e.id}><Dot color={SERIES[i]} />{labelOf(e)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visibleRows.length === 0 ? (
                        <tr><td colSpan={selected.length + 1} style={{ textAlign: 'center', color: 'var(--text3)', padding: 20 }}>
                          These experiments are identical on every attribute above.
                        </td></tr>
                      ) : visibleRows.map(r => (
                        <tr key={r.label}>
                          <td style={{ color: 'var(--text3)', fontSize: 11 }}>{r.label}</td>
                          {r.values.map((v, i) => {
                            const top = r.highlight === i
                            return (
                              <td key={i} style={{ color: top ? 'var(--teal)' : 'var(--text)', fontWeight: top ? 700 : 500 }}>
                                {v} {top && '🏆'}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Per-algorithm comparison */}
              <div className="card fade-up-2">
                <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div className="card-title"><span className="card-title-icon">📊</span>Algorithm by Algorithm</div>
                    <div className="card-sub">
                      {metric === 'score' ? 'Higher is better' : 'Lower is faster'} · ✓ marks the best result per algorithm
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={pill(metric === 'score')} onClick={() => setMetric('score')}>
                      {task === 'classification' ? 'Accuracy' : 'R²'}
                    </button>
                    <button style={pill(metric === 'time')} onClick={() => setMetric('time')}>Training time</button>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" vertical={false} />
                    <XAxis dataKey="name" interval={0} tick={{ fill: '#8BA0BF', fontSize: 10 }} />
                    <YAxis
                      domain={metric === 'score' ? [0, 1] : [0, 'auto']}
                      tick={{ fill: '#3D5470', fontSize: 10 }}
                      tickFormatter={v => metric === 'score'
                        ? (task === 'classification' ? `${Math.round(v * 100)}%` : v.toFixed(1))
                        : `${v}s`}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,.03)' }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null
                        return (
                          <div style={{ background: 'rgba(13,21,38,.97)', border: '1px solid #1E2D45', borderRadius: 8, padding: '8px 12px', fontSize: 11, fontFamily: 'var(--mono)' }}>
                            <div style={{ color: '#F0F6FF', marginBottom: 4 }}>{label}</div>
                            {payload.map(p => (
                              <div key={p.dataKey} style={{ color: p.color }}>{p.name}: {fmtCell(p.value)}</div>
                            ))}
                          </div>
                        )
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} formatter={v => <span style={{ color: '#8BA0BF' }}>{v}</span>} />
                    {selected.map(({ e }, i) => (
                      <Bar key={e.id} dataKey={`e${i}`} name={labelOf(e)} fill={SERIES[i]} radius={[4, 4, 0, 0]} maxBarSize={28} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>

                <div className="table-wrap" style={{ marginTop: 16 }}>
                  <table className="preview-table">
                    <thead>
                      <tr>
                        <th>Algorithm</th>
                        {selected.map(({ e }, i) => (
                          <th key={e.id}><Dot color={SERIES[i]} />{labelOf(e)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {matrix.map(r => (
                        <tr key={r.name}>
                          <td style={{ fontWeight: 600, color: 'var(--text)' }}>{r.name}</td>
                          {r.vals.map((v, i) => {
                            const isBest = r.best != null && v === r.best
                            return (
                              <td key={i} style={{
                                fontFamily: 'var(--mono)', fontWeight: isBest ? 700 : 500,
                                color: isBest ? 'var(--teal)' : v == null ? 'var(--text3)' : 'var(--text)',
                              }}>
                                {fmtCell(v)} {isBest && '✓'}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}