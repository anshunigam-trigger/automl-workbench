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
  padding: '6px 14px', borderRadius: 10, fontSize: 11, fontWeight: 600, cursor: 'pointer',
  fontFamily: 'var(--sans)',
  border: `1px solid ${active ? 'var(--ab-acc)' : 'var(--ab-line)'}`,
  background: active ? 'color-mix(in srgb, var(--ab-acc) 10%, var(--ab-card))' : 'var(--ab-inset)',
  color: active ? 'var(--ab-acc)' : 'var(--ab-mut)',
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
      <div style={{ marginBottom: 24 }}>
        <h1 className="ab-title">Compare Experiments</h1>
        <p className="ab-sub">Put experiments side by side to see what changed and what won.</p>
      </div>

      {error && <div className="error-bar">⚠ &nbsp;{error}</div>}

      {/* Not enough data */}
      {!loading && !error && experiments.length < 2 && (
        <div className="card fade-up-1" style={{ textAlign: 'center', padding: '56px 24px', borderStyle: 'dashed' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚖️</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>You need at least two experiments to compare</div>
          <div style={{ fontSize: 13, color: 'var(--ab-mut)', marginBottom: 16 }}>
            Run another experiment, ideally on the same dataset with different algorithms.
          </div>
          <Link href="/experiments" className="ab-btn dark">+ Run an experiment</Link>
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
                  style={{ background: 'none', border: 'none', color: 'var(--ab-acc)', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
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
                          padding: '12px 14px', borderRadius: 14, fontFamily: 'var(--sans)', color: 'inherit',
                          cursor: why ? 'not-allowed' : 'pointer', opacity: why ? 0.4 : 1,
                          background: on ? 'color-mix(in srgb, var(--ab-acc) 10%, var(--ab-card))' : 'var(--ab-inset)',
                          border: `1px solid ${on ? 'var(--ab-acc)' : 'var(--ab-line)'}`,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span style={{
                          width: 18, height: 18, borderRadius: 5, flexShrink: 0, display: 'grid', placeItems: 'center',
                          fontSize: 10, fontWeight: 700, color: '#fff',
                          background: on ? SERIES[ids.indexOf(e.id)] : 'transparent',
                          border: `1px solid ${on ? 'transparent' : 'var(--ab-line)'}`,
                        }}>{on && '✓'}</span>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ab-ink)' }}>{e.dataset}</div>
                          <div style={{ fontSize: 11, color: 'var(--ab-mut)', fontFamily: 'var(--mono)', marginTop: 2 }}>
                            #{e.id} · target: {e.target} · {e.rows?.toLocaleString() ?? '—'} rows · {timeAgo(e.created_at)}
                          </div>
                        </div>

                        <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: t.bg, color: t.color, border: `1px solid ${t.border}` }}>
                          {t.label}
                        </span>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: 'var(--ab-ok)', minWidth: 64, textAlign: 'right' }}>
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
                <div style={{
                  padding: '12px 18px', marginBottom: 16, borderRadius: 14, fontSize: 13, lineHeight: 1.6,
                  background: 'color-mix(in srgb, #f59e0b 10%, var(--ab-card))', border: '1px solid color-mix(in srgb, #f59e0b 30%, transparent)', color: 'var(--ab-mut)',
                }}>
                  <b style={{ color: '#f59e0b' }}>⚠ Different datasets.</b> Score differences here reflect the
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
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ab-mut)', cursor: 'pointer' }}>
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
                        <tr><td colSpan={selected.length + 1} style={{ textAlign: 'center', color: 'var(--ab-mut)', padding: 20 }}>
                          These experiments are identical on every attribute above.
                        </td></tr>
                      ) : visibleRows.map(r => (
                        <tr key={r.label}>
                          <td style={{ color: 'var(--ab-mut)', fontSize: 11 }}>{r.label}</td>
                          {r.values.map((v, i) => {
                            const top = r.highlight === i
                            return (
                              <td key={i} style={{ color: top ? 'var(--ab-ok)' : 'var(--ab-ink)', fontWeight: top ? 700 : 500 }}>
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
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--ab-line)" vertical={false} />
                    <XAxis dataKey="name" interval={0} tick={{ fill: 'var(--ab-mut)', fontSize: 10 }} />
                    <YAxis
                      domain={metric === 'score' ? [0, 1] : [0, 'auto']}
                      tick={{ fill: 'var(--ab-mut)', fontSize: 10 }}
                      tickFormatter={v => metric === 'score'
                        ? (task === 'classification' ? `${Math.round(v * 100)}%` : v.toFixed(1))
                        : `${v}s`}
                    />
                    <Tooltip
                      cursor={{ fill: 'color-mix(in srgb, var(--ab-ink) 4%, transparent)' }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null
                        return (
                          <div style={{ background: 'var(--ab-card)', border: '1px solid var(--ab-line)', borderRadius: 12, padding: '10px 14px', fontSize: 11, fontFamily: 'var(--mono)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                            <div style={{ color: 'var(--ab-ink)', fontWeight: 600, marginBottom: 4 }}>{label}</div>
                            {payload.map(p => (
                              <div key={p.dataKey} style={{ color: p.color, fontWeight: 500 }}>{p.name}: {fmtCell(p.value)}</div>
                            ))}
                          </div>
                        )
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} formatter={v => <span style={{ color: 'var(--ab-mut)' }}>{v}</span>} />
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