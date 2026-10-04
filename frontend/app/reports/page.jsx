'use client'

import { Fragment, useState } from 'react'
import Link from 'next/link'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useExperiments } from '@/lib/useExperiments'
import { downloadCsv } from '@/lib/exportCsv'
import { timeAgo, formatScore, modelName, pct, rowScore, seconds, TASK_STYLE } from '@/lib/format'
import './style.css'

const RANK = ['#FBBF24', '#94A3B8', '#CD7F32', '#475569', '#475569']
const note = { fontSize: 12, color: 'var(--text3)', padding: '40px 0', textAlign: 'center' }

/* ── Small reusable pieces ── */

function Kpi({ icon, label, value, sub, best, loading }) {
  return (
    <div className={`kpi${best ? ' best' : ''}`}>
      <div className="kpi-icon">{icon}</div>
      <div>
        {loading
          ? <div className="skeleton" style={{ width: 70, height: 22, marginBottom: 6 }} />
          : <div className="kpi-val">{value}</div>}
        <div className="kpi-lbl">{label}</div>
        {sub && !loading && <div className="kpi-sub">{sub}</div>}
      </div>
    </div>
  )
}

// Recharts injects `active` and `payload`; we add `render` to decide what to show.
function ChartTip({ active, payload, render }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(13,21,38,.97)', border: '1px solid #1E2D45', borderRadius: 8, padding: '8px 12px', fontSize: 11, fontFamily: 'var(--mono)' }}>
      {render(payload[0].payload)}
    </div>
  )
}

// One horizontal bar chart, used for both "wins" and "training time".
function HBar({ data, dataKey, color, unit, tipLabel, integer }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 42)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" horizontal={false} />
        <XAxis type="number" allowDecimals={!integer} tick={{ fill: '#3D5470', fontSize: 10 }} />
        <YAxis type="category" dataKey="name" width={130} tick={{ fill: '#8BA0BF', fontSize: 10 }} />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,.03)' }}
          content={<ChartTip render={d => (
            <>
              <div style={{ color: '#F0F6FF', marginBottom: 4 }}>{d.name}</div>
              <div style={{ color }}>{tipLabel}: {d[dataKey]}{unit}</div>
            </>
          )} />}
        />
        <Bar dataKey={dataKey} fill={color} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ── Page ── */

export default function ReportsPage() {
  const { experiments, loading, error } = useExperiments()
  const [openId, setOpenId] = useState(null)

  // Derived numbers
  const total         = experiments.length
  const datasetCount  = new Set(experiments.map(e => e.dataset)).size
  const modelsTrained = experiments.reduce((sum, e) => sum + e.results.length, 0)

  // Top 5 individual models across every classification experiment
  const leaderboard = experiments
    .filter(e => e.task === 'classification')
    .flatMap(e => e.results.map(r => ({ name: modelName(r.id, e.task), dataset: e.dataset, score: r.accuracy })))
    .filter(r => r.score != null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  // Winner of each classification experiment, oldest → newest.
  // [...experiments] copies first, because reverse() mutates the array it is called on.
  const trend = [...experiments].reverse()
    .filter(e => e.task === 'classification' && e.best)
    .map(e => ({
      label:    `#${e.id}`,
      dataset:  e.dataset,
      model:    modelName(e.best.id, e.task),
      accuracy: +(e.best.accuracy * 100).toFixed(2),
    }))

  // How many experiments each algorithm has won
  const winCount = {}
  experiments.forEach(e => {
    if (!e.best) return
    const n = modelName(e.best.id, e.task)
    winCount[n] = (winCount[n] ?? 0) + 1
  })
  const winData = Object.entries(winCount)
    .map(([name, wins]) => ({ name, wins }))
    .sort((a, b) => b.wins - a.wins)

  // Average training time per algorithm
  const timeAgg = {}
  experiments.forEach(e => e.results.forEach(r => {
    if (r.time == null) return
    const n = modelName(r.id, e.task)
    timeAgg[n] ??= { total: 0, runs: 0 }
    timeAgg[n].total += r.time
    timeAgg[n].runs  += 1
  }))
  const timeData = Object.entries(timeAgg)
    .map(([name, a]) => ({ name, secs: +(a.total / a.runs).toFixed(2) }))
    .sort((a, b) => b.secs - a.secs)

  const handleExport = () => {
    const data = experiments.flatMap(e => e.results.map(r => ({
      experiment_id: e.id,
      dataset:       e.dataset,
      target:        e.target,
      task:          e.task,
      rows:          e.rows,
      model:         modelName(r.id, e.task),
      accuracy:      r.accuracy,
      f1:            r.f1,
      precision:     r.precision,
      recall:        r.recall,
      r2:            r.r2,
      rmse:          r.rmse,
      mae:           r.mae,
      training_time_s: r.time,
      created_at:    e.created_at,
    })))
    downloadCsv('autobench-report.csv', data)
  }

  return (
    <div className="page-content">

      {/* Header */}
      <div className="rp-head fade-up">
        <div style={{ flex: 1 }}>
          <div className="breadcrumb">Reports</div>
          <div className="rp-title"><span className="grad">Experiment Report</span></div>
          <div className="rp-sub">
            {loading ? 'Loading…' : `Generated from ${total} saved experiment${total === 1 ? '' : 's'}`}
          </div>
        </div>
        <div className="rp-btns">
          <button className="rp-btn sky" onClick={handleExport} disabled={total === 0}
                  style={total === 0 ? { opacity: .4, cursor: 'not-allowed' } : undefined}>
            ⬇ Export CSV
          </button>
        </div>
      </div>

      {error && <div className="error-bar">⚠ &nbsp;{error}</div>}

      {/* KPIs */}
      <div className="kpi-grid fade-up-1">
        <Kpi icon="📋" label="Experiments"   value={total} loading={loading}
             sub={experiments[0] ? `latest ${timeAgo(experiments[0].created_at)}` : undefined} />
        <Kpi icon="🗄️" label="Datasets"      value={datasetCount} loading={loading} />
        <Kpi icon="🤖" label="Models Trained" value={modelsTrained} loading={loading}
             sub={total ? `${(modelsTrained / total).toFixed(1)} per experiment` : undefined} />
        <Kpi icon="🏆" label="Best Accuracy" best loading={loading}
             value={leaderboard[0] ? pct(leaderboard[0].score) : '—'}
             sub={leaderboard[0] ? `${leaderboard[0].name} · ${leaderboard[0].dataset}` : undefined} />
      </div>

      {/* Empty state */}
      {!loading && !error && total === 0 && (
        <div className="chart-card fade-up-2" style={{ textAlign: 'center', padding: '56px 24px', borderStyle: 'dashed' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Nothing to report yet</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
            Run an experiment and your report will build itself.
          </div>
          <Link href="/experiments" className="btn primary">+ Run an experiment</Link>
        </div>
      )}

      {(loading || total > 0) && (
        <>
          {/* Performance */}
          <div className="sec-label fade-up-2">Performance Analytics</div>
          <div className="charts-row fade-up-2">

            <div className="chart-card">
              <div className="chart-title">Best Accuracy per Experiment</div>
              <div className="chart-sub">Winning model of each classification experiment, oldest to newest</div>
              {loading ? <div className="skeleton" style={{ height: 220 }} />
                : trend.length < 2 ? <div style={note}>Run at least 2 classification experiments to see a trend.</div>
                : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={trend} margin={{ top: 4, right: 12, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" />
                      <XAxis dataKey="label" tick={{ fill: '#3D5470', fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#3D5470', fontSize: 10 }} tickFormatter={v => `${v}%`} />
                      <Tooltip content={<ChartTip render={d => (
                        <>
                          <div style={{ color: '#F0F6FF', marginBottom: 4 }}>{d.dataset} · {d.label}</div>
                          <div style={{ color: '#2DD4BF' }}>{d.model}: {d.accuracy}%</div>
                        </>
                      )} />} />
                      <Line type="monotone" dataKey="accuracy" stroke="#2DD4BF" strokeWidth={2.5}
                            dot={{ r: 4, fill: '#2DD4BF' }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
            </div>

            <div className="chart-card">
              <div className="chart-title">🏆 Model Leaderboard</div>
              <div className="chart-sub">Top models across all classification experiments</div>
              {loading ? <div className="skeleton" style={{ height: 220 }} />
                : leaderboard.length === 0 ? <div style={note}>No classification models yet.</div>
                : leaderboard.map((m, i) => (
                  <div key={`${m.dataset}-${m.name}-${i}`} className="lb-item">
                    <div className="lb-rank" style={{ background: RANK[i] + '22', color: RANK[i], border: `1px solid ${RANK[i]}44` }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="lb-name">{m.name}</div>
                      <div className="lb-dataset">{m.dataset}</div>
                      <div className="lb-bar-track">
                        <div className="lb-bar-fill" style={{ width: `${m.score * 100}%`, background: RANK[i], opacity: .8 }} />
                      </div>
                    </div>
                    <div className="lb-acc">{pct(m.score)}</div>
                  </div>
                ))}
            </div>
          </div>

          {/* Algorithm insights */}
          <div className="sec-label fade-up-3">Algorithm Insights</div>
          <div className="adv-grid fade-up-3">
            <div className="chart-card">
              <div className="chart-title">Experiments Won</div>
              <div className="chart-sub">How often each algorithm was the best in its experiment</div>
              {loading ? <div className="skeleton" style={{ height: 160 }} />
                : <HBar data={winData} dataKey="wins" color="#38BDF8" tipLabel="Wins" integer />}
            </div>
            <div className="chart-card">
              <div className="chart-title">Average Training Time</div>
              <div className="chart-sub">Seconds per run — the cost of each algorithm</div>
              {loading ? <div className="skeleton" style={{ height: 160 }} />
                : <HBar data={timeData} dataKey="secs" color="#A78BFA" unit="s" tipLabel="Avg time" />}
            </div>
          </div>

          {/* History */}
          <div className="sec-label fade-up-4">Experiment History</div>
          <div className="chart-card fade-up-4">
            <div className="chart-title">All Experiments</div>
            <div className="chart-sub">Click a row to see every model trained in that experiment</div>
            <div className="table-wrap">
              <table className="preview-table">
                <thead>
                  <tr><th>Experiment</th><th>Task</th><th>Rows</th><th>Best Model</th><th>Score</th><th>When</th></tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6}><div className="skeleton" style={{ height: 24 }} /></td></tr>
                  ) : experiments.map(e => {
                    const t    = TASK_STYLE[e.task]
                    const open = openId === e.id
                    return (
                      <Fragment key={e.id}>
                        <tr onClick={() => setOpenId(open ? null : e.id)}
                            style={{ cursor: 'pointer', background: open ? 'var(--sky-dim)' : undefined }}>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--text)' }}>{e.dataset}</div>
                            <div style={{ fontSize: 10, color: 'var(--text3)' }}>#{e.id} · target: {e.target}</div>
                          </td>
                          <td>
                            <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: t.bg, color: t.color, border: `1px solid ${t.border}` }}>
                              {t.label}
                            </span>
                          </td>
                          <td>{e.rows?.toLocaleString() ?? '—'}</td>
                          <td>{e.best ? modelName(e.best.id, e.task) : '—'}</td>
                          <td style={{ fontWeight: 700, color: 'var(--teal)' }}>{formatScore(e.best, e.task)}</td>
                          <td style={{ color: 'var(--text3)' }}>{timeAgo(e.created_at)} {open ? '▲' : '▼'}</td>
                        </tr>

                        {open && (
                          <tr>
                            <td colSpan={6} style={{ background: 'var(--surface2)' }}>
                              {e.results.map((r, i) => (
                                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 4px', fontSize: 11, borderBottom: i < e.results.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                  <span style={{ color: 'var(--text)', minWidth: 150 }}>{i === 0 && '🏆 '}{modelName(r.id, e.task)}</span>
                                  <span style={{ color: 'var(--teal)' }}>{rowScore(e.task, e.task === 'classification' ? r.accuracy : r.r2)}</span>
                                  <span style={{ color: 'var(--text2)' }}>
                                    {e.task === 'classification' ? `F1 ${pct(r.f1)}` : `RMSE ${r.rmse == null ? '—' : r.rmse.toFixed(3)}`}
                                  </span>
                                  <span style={{ color: 'var(--text3)' }}>{seconds(r.time)}</span>
                                </div>
                              ))}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}