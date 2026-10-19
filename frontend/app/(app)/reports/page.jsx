'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useExperiments } from '@/lib/useExperiments'
import { analyzeExperiment } from '@/lib/analyze'
import { downloadCsv } from '@/lib/exportCsv'
import { timeAgo, formatScore, pct, rowScore, seconds, duration, TASK_STYLE } from '@/lib/format'
import './style.css'

const RANK  = ['#FBBF24', '#94A3B8', '#CD7F32', '#475569', '#475569']
const COLOR = { classification: '#38BDF8', regression: '#2DD4BF' }
const WEAK  = { bg: '#FBBF2415', color: 'var(--amber)', border: '#FBBF2440' }

const note = { fontSize: 12, color: 'var(--text3)', padding: '40px 0', textAlign: 'center' }
const num  = v => (v == null ? '—' : Number(v).toLocaleString(undefined, { maximumFractionDigits: 3 }))

const badge = c => ({
  fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
  background: c.bg, color: c.color, border: `1px solid ${c.border}`,
})
const pill = active => ({
  padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer',
  fontFamily: 'var(--sans)', textTransform: 'capitalize',
  border: `1px solid ${active ? 'var(--sky-glow)' : 'var(--border)'}`,
  background: active ? 'var(--sky-dim)' : 'transparent',
  color: active ? 'var(--sky)' : 'var(--text2)',
})
const headerBtn = {
  width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px',
  background: 'none', border: 'none', color: 'inherit', textAlign: 'left',
  cursor: 'pointer', fontFamily: 'var(--sans)',
}

// One row per model, for CSV export
const rowsFor = (e, a) => a.models.map((m, i) => ({
  experiment_id: e.id, dataset: e.dataset, target: e.target, task: e.task, rows: e.rows,
  rank: i + 1, model: m.name,
  accuracy: m.accuracy, f1: m.f1, precision: m.precision, recall: m.recall,
  r2: m.r2, rmse: m.rmse, mae: m.mae,
  training_time_s: m.time, created_at: e.created_at,
}))

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

function ChartTip({ active, payload, render }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(13,21,38,.97)', border: '1px solid #1E2D45', borderRadius: 8, padding: '8px 12px', fontSize: 11, fontFamily: 'var(--mono)' }}>
      {render(payload[0].payload)}
    </div>
  )
}

function Mini({ label, value, sub }) {
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
      <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--mono)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--teal)', fontFamily: 'var(--mono)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

/* ── Page ── */

export default function ReportsPage() {
  const { experiments, loading, error } = useExperiments()
  const [openId, setOpenId] = useState(undefined)  // undefined = default (newest open), null = all closed
  const [lbTask, setLbTask] = useState(null)       // null = automatic

  // Run the analysis once per experiment; everything below reads from `analyses`
  const analyses = experiments.map(e => ({ e, a: analyzeExperiment(e) }))

  // ── Summary numbers ──
  const total         = experiments.length
  const nCls          = experiments.filter(e => e.task === 'classification').length
  const modelsTrained = analyses.reduce((s, { a }) => s + a.models.length, 0)
  const totalTime     = analyses.reduce((s, { a }) => s + a.totalTime, 0)
  const bestCls       = analyses
    .filter(({ e, a }) => e.task === 'classification' && a.best)
    .reduce((b, x) => (!b || x.a.best.score > b.a.best.score ? x : b), null)

  // ── Chart: the best score of EVERY experiment, oldest → newest ──
  const chartData = [...analyses].reverse()
    .filter(({ a }) => a.best)
    .map(({ e, a }) => ({
      key:     e.id,
      label:   `${e.dataset.replace(/\.csv$/i, '')} #${e.id}`,
      dataset: e.dataset,
      task:    e.task,
      model:   a.best.name,
      display: rowScore(e.task, a.best.score),
      bar:     Math.max(0, a.best.score) * 100,   // never draw a negative bar
    }))

  // ── Leaderboard: one ranking per task type ──
  const lbOptions  = ['classification', 'regression'].filter(t => experiments.some(e => e.task === t))
  const activeTask = lbOptions.includes(lbTask) ? lbTask : lbOptions[0]
  const leaderboard = analyses
    .filter(({ e }) => e.task === activeTask)
    .flatMap(({ e, a }) => a.models.map(m => ({ id: e.id, name: m.name, dataset: e.dataset, score: m.score })))
    .sort((x, y) => y.score - x.score)
    .slice(0, 5)

  const activeId  = openId === undefined ? experiments[0]?.id : openId
  const exportAll = () => downloadCsv('autobench-report.csv', analyses.flatMap(({ e, a }) => rowsFor(e, a)))

  return (
    <div className="page-content">

      {/* Header */}
      <div className="rp-head fade-up">
        <div style={{ flex: 1 }}>
          <div className="breadcrumb">Reports</div>
          <div className="rp-title"><span className="grad">Experiment Report</span></div>
          <div className="rp-sub">
            {loading ? 'Loading…' : `Every experiment you've run, with a full breakdown of each model`}
          </div>
        </div>
        <div className="rp-btns">
          <button className="rp-btn sky" onClick={exportAll} disabled={total === 0}
                  style={total === 0 ? { opacity: .4, cursor: 'not-allowed' } : undefined}>
            ⬇ Export all (CSV)
          </button>
        </div>
      </div>

      {error && <div className="error-bar">⚠ &nbsp;{error}</div>}

      {/* KPIs */}
      <div className="kpi-grid fade-up-1">
        <Kpi icon="📋" label="Experiments" value={total} loading={loading}
             sub={`${nCls} classification · ${total - nCls} regression`} />
        <Kpi icon="🤖" label="Models Trained" value={modelsTrained} loading={loading}
             sub={total ? `${(modelsTrained / total).toFixed(1)} per experiment` : undefined} />
        <Kpi icon="⏱️" label="Total Training Time" value={duration(totalTime)} loading={loading}
             sub="across all experiments" />
        <Kpi icon="🏆" label="Best Accuracy" best loading={loading}
             value={bestCls ? pct(bestCls.a.best.score) : '—'}
             sub={bestCls ? `${bestCls.a.best.name} · ${bestCls.e.dataset}` : 'no classification yet'} />
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
          {/* ── Overview: all experiments + leaderboard ── */}
          <div className="sec-label fade-up-2">Overview</div>
          <div className="charts-row fade-up-2">

            <div className="chart-card">
              <div className="chart-title">How Each Experiment Performed</div>
              <div className="chart-sub">Best score of every experiment, oldest to newest</div>
              {loading ? <div className="skeleton" style={{ height: 240 }} /> : (
                <>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" vertical={false} />
                      <XAxis dataKey="label" interval={0} tick={{ fill: '#8BA0BF', fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#3D5470', fontSize: 10 }} tickFormatter={v => `${v}%`} />
                      <Tooltip cursor={{ fill: 'rgba(255,255,255,.03)' }} content={<ChartTip render={d => (
                        <>
                          <div style={{ color: '#F0F6FF', marginBottom: 4 }}>{d.dataset}</div>
                          <div style={{ color: COLOR[d.task] }}>{d.model}</div>
                          <div style={{ color: '#8BA0BF' }}>{d.display}</div>
                        </>
                      )} />} />
                      <Bar dataKey="bar" radius={[4, 4, 0, 0]} maxBarSize={56}>
                        {chartData.map(d => <Cell key={d.key} fill={COLOR[d.task]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 10, color: 'var(--text2)', flexWrap: 'wrap' }}>
                    <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: COLOR.classification, marginRight: 6 }} />Accuracy (classification)</span>
                    <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: COLOR.regression, marginRight: 6 }} />R² × 100 (regression)</span>
                  </div>
                </>
              )}
            </div>

            <div className="chart-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <div className="chart-title" style={{ marginBottom: 0 }}>🏆 Model Leaderboard</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {lbOptions.map(t => (
                    <button key={t} style={pill(t === activeTask)} onClick={() => setLbTask(t)}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="chart-sub" style={{ margin: '4px 0 12px' }}>
                Accuracy and R² are different scales, so each task type has its own ranking
              </div>
              {loading ? <div className="skeleton" style={{ height: 220 }} />
                : leaderboard.length === 0 ? <div style={note}>No models yet.</div>
                : leaderboard.map((m, i) => (
                  <div key={`${m.id}-${m.name}`} className="lb-item">
                    <div className="lb-rank" style={{ background: RANK[i] + '22', color: RANK[i], border: `1px solid ${RANK[i]}44` }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div className="lb-name">{m.name}</div>
                      <div className="lb-dataset">{m.dataset} · #{m.id}</div>
                      <div className="lb-bar-track">
                        <div className="lb-bar-fill" style={{ width: `${Math.max(0, m.score) * 100}%`, background: RANK[i], opacity: .8 }} />
                      </div>
                    </div>
                    <div className="lb-acc">{rowScore(activeTask, m.score)}</div>
                  </div>
                ))}
            </div>
          </div>

          {/* ── One report card per experiment ── */}
          <div className="sec-label fade-up-3">Experiment Reports</div>
          <div className="fade-up-3">
            {loading && <div className="chart-card"><div className="skeleton" style={{ height: 60 }} /></div>}

            {analyses.map(({ e, a }) => {
              const t     = TASK_STYLE[e.task]
              const isCls = e.task === 'classification'
              const open  = activeId === e.id

              return (
                <div key={e.id} className="chart-card" style={{ padding: 0, marginBottom: 14, overflow: 'hidden' }}>

                  {/* Clickable header */}
                  <button type="button" aria-expanded={open} style={headerBtn}
                          onClick={() => setOpenId(open ? null : e.id)}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{e.dataset}</div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 3 }}>
                        #{e.id} · target: {e.target} · {e.rows?.toLocaleString() ?? '—'} rows · {timeAgo(e.created_at)}
                      </div>
                    </div>
                    {a.weak && <span style={badge(WEAK)}>⚠ Weak fit</span>}
                    <span style={badge(t)}>{t.label}</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700, color: 'var(--teal)' }}>
                        {formatScore(a.best, e.task)}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>{a.best?.name ?? '—'}</div>
                    </div>
                    <span style={{ color: 'var(--text3)', fontSize: 11 }}>{open ? '▲' : '▼'}</span>
                  </button>

                  {/* Expanded report */}
                  {open && (
                    <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, margin: '16px 0' }}>
                        <Mini label="Best model"          value={a.best?.name ?? '—'}    sub={formatScore(a.best, e.task)} />
                        <Mini label="Fastest model"       value={a.fastest?.name ?? '—'} sub={seconds(a.fastest?.time)} />
                        <Mini label="Models trained"      value={a.models.length} />
                        <Mini label="Total training time" value={duration(a.totalTime)} />
                      </div>

                      <div className="table-wrap">
                        <table className="preview-table">
                          <thead>
                            <tr>
                              <th>#</th><th>Model</th><th>{isCls ? 'Accuracy' : 'R²'}</th>
                              {isCls ? <><th>F1</th><th>Precision</th><th>Recall</th></> : <><th>RMSE</th><th>MAE</th></>}
                              <th>Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {a.models.map((m, i) => (
                              <tr key={m.id}>
                                <td style={{ color: 'var(--text3)' }}>{i + 1}</td>
                                <td style={{ fontWeight: 600, color: 'var(--text)' }}>
                                  {m.name} {i === 0 && '🏆'} {a.fastest?.id === m.id && '⚡'}
                                </td>
                                <td>
                                  <div style={{ fontWeight: 700, color: 'var(--teal)' }}>{rowScore(e.task, m.score)}</div>
                                  <div style={{ height: 3, width: 80, background: 'var(--border)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${Math.max(0, m.score) * 100}%`, background: 'var(--teal)' }} />
                                  </div>
                                </td>
                                {isCls
                                  ? <><td>{pct(m.f1)}</td><td>{pct(m.precision)}</td><td>{pct(m.recall)}</td></>
                                  : <><td>{num(m.rmse)}</td><td>{num(m.mae)}</td></>}
                                <td style={{ color: 'var(--text3)' }}>{seconds(m.time)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 8 }}>🏆 most accurate &nbsp;·&nbsp; ⚡ fastest</div>

                      {a.insights.length > 0 && (
                        <div style={{ marginTop: 14, padding: '14px 16px', background: 'var(--surface2)', border: `1px solid ${a.weak ? WEAK.border : 'var(--border)'}`, borderRadius: 10 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>What this means</div>
                          {a.insights.map((text, i) => (
                            <div key={i} style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, marginBottom: i < a.insights.length - 1 ? 6 : 0 }}>
                              → {text}
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ marginTop: 14 }}>
                        <button className="btn" style={{ fontSize: 11, padding: '7px 14px' }}
                                onClick={() => downloadCsv(`experiment-${e.id}.csv`, rowsFor(e, a))}>
                          ⬇ Export this experiment
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}