'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Download, ChevronDown, ArrowUpRight } from 'lucide-react'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useExperiments } from '@/lib/useExperiments'
import { analyzeExperiment } from '@/lib/analyze'
import { downloadCsv } from '@/lib/exportCsv'
import { timeAgo, formatScore, pct, rowScore, seconds, duration } from '@/lib/format'
import { Page, Card, Tile, Empty, CountUp, ErrorState, toast, list, ease } from '@/components/ui'

const RANK  = ['#FBBF24', '#94A3B8', '#CD7F32', '#64748B', '#64748B']
const COLOR = { classification: 'var(--ab-dark)', regression: 'var(--ab-acc)' }
const num   = v => (v == null ? '—' : Number(v).toLocaleString(undefined, { maximumFractionDigits: 3 }))

// One row per model, for CSV export
const rowsFor = (e, a) => a.models.map((m, i) => ({
  experiment_id: e.id, dataset: e.dataset, target: e.target, task: e.task, rows: e.rows,
  rank: i + 1, model: m.name,
  accuracy: m.accuracy, f1: m.f1, precision: m.precision, recall: m.recall,
  r2: m.r2, rmse: m.rmse, mae: m.mae,
  training_time_s: m.time, created_at: e.created_at,
}))

function ChartTip({ active, payload, render }) {
  if (!active || !payload?.length) return null
  return <div className="ab-tip">{render(payload[0].payload)}</div>
}

function Mini({ label, value, sub }) {
  return (
    <div className="ab-mini">
      <small>{label}</small>
      <b>{value}</b>
      {sub && <em>{sub}</em>}
    </div>
  )
}

export default function ReportsPage() {
  const { experiments, loading, error, refetch } = useExperiments()
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
  const exportAll = () => {
    downloadCsv('autobench-report.csv', analyses.flatMap(({ e, a }) => rowsFor(e, a)))
    toast('Full report exported (CSV)', 'success')
  }

  return (
    <Page
      title="Experiment report"
      sub={loading ? 'Loading…' : 'Every experiment you’ve run, with a full breakdown of each model.'}
      action={<button className="ab-btn dark fit" onClick={exportAll} disabled={total === 0}><Download size={16} /> Export all (CSV)</button>}
    >
      {error && <ErrorState text={error} onRetry={refetch} />}

      {/* KPIs */}
      <motion.div className="ab-kpis" variants={list}>
        <Tile hot label="Experiments" sub={total ? `${nCls} classification · ${total - nCls} regression` : undefined}>
          {loading ? '—' : <CountUp to={total} />}
        </Tile>
        <Tile label="Models trained" sub={total ? `${(modelsTrained / total).toFixed(1)} per experiment` : undefined}>
          {loading ? '—' : <CountUp to={modelsTrained} />}
        </Tile>
        <Tile label="Total training time" sub="across all experiments">{loading ? '—' : duration(totalTime)}</Tile>
        <Tile label="Best accuracy" sub={bestCls ? `${bestCls.a.best.name} · ${bestCls.e.dataset}` : 'no classification yet'}>
          {loading || !bestCls ? '—' : pct(bestCls.a.best.score)}
        </Tile>
      </motion.div>

      {!loading && !error && total === 0 && (
        <Empty title="Nothing to report yet" text="Run an experiment and your report will build itself." href="/experiments" cta="Run an experiment" />
      )}

      {(loading || total > 0) && (
        <>
          {/* ── Overview: all experiments + leaderboard ── */}
          <motion.div className="ab-two" variants={list}>
            <Card>
              <b className="ab-h">How each experiment performed</b>
              <div className="ab-lbl" style={{ marginBottom: 12 }}>Best score of every experiment, oldest to newest</div>
              {loading ? <div className="ab-skel" style={{ height: 240 }} /> : (
                <>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--ab-line)" vertical={false} />
                      <XAxis dataKey="label" interval={0} tick={{ fill: 'var(--ab-mut)', fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: 'var(--ab-mut)', fontSize: 11 }} tickFormatter={v => `${v}%`} />
                      <Tooltip cursor={{ fill: 'var(--ab-inset)' }} content={<ChartTip render={d => (
                        <>
                          <b>{d.dataset}</b>
                          <div>{d.model}</div>
                          <div className="ab-lbl">{d.display}</div>
                        </>
                      )} />} />
                      <Bar dataKey="bar" radius={[8, 8, 0, 0]} maxBarSize={56} animationDuration={900}>
                        {chartData.map(d => <Cell key={d.key} fill={COLOR[d.task]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="ab-legend">
                    <span><i style={{ background: COLOR.classification }} />Accuracy (classification)</span>
                    <span><i style={{ background: COLOR.regression }} />R² × 100 (regression)</span>
                  </div>
                </>
              )}
            </Card>

            <Card>
              <div className="ab-row">
                <b className="ab-h">Model leaderboard</b>
                <div className="ab-pills">
                  {lbOptions.map(t => (
                    <button key={t} className={t === activeTask ? 'on' : ''} onClick={() => setLbTask(t)}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="ab-lbl" style={{ margin: '4px 0 8px' }}>
                Accuracy and R² are different scales, so each task type has its own ranking
              </div>
              {loading ? <div className="ab-skel" style={{ height: 220 }} />
                : leaderboard.length === 0 ? <div className="ab-lbl" style={{ padding: '32px 0', textAlign: 'center' }}>No models yet.</div>
                : leaderboard.map((m, i) => (
                  <div key={`${m.id}-${m.name}`} className="lb">
                    <div className="lb-rank" style={{ background: RANK[i] + '30', color: RANK[i] }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <b>{m.name}</b>
                      <div className="ab-lbl">{m.dataset} · #{m.id}</div>
                      <div className="ab-track" style={{ width: '100%' }}>
                        <motion.i initial={{ width: 0 }} animate={{ width: `${Math.max(0, m.score) * 100}%` }} transition={{ duration: 0.8, ease, delay: 0.4 + i * 0.08 }} />
                      </div>
                    </div>
                    <b className="num">{rowScore(activeTask, m.score)}</b>
                  </div>
                ))}
            </Card>
          </motion.div>

          {/* ── One report card per experiment ── */}
          <b className="ab-h" style={{ display: 'block', margin: '8px 0 12px' }}>Experiment reports</b>
          {loading && <Card><div className="ab-skel" style={{ height: 60 }} /></Card>}

          {analyses.map(({ e, a }) => {
            const isCls = e.task === 'classification'
            const open  = activeId === e.id

            return (
              <Card key={e.id} inView style={{ padding: 0, overflow: 'hidden' }}>
                <button type="button" aria-expanded={open} className="acc-h" onClick={() => setOpenId(open ? null : e.id)}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b>{e.dataset}</b>
                    <div className="ab-lbl">#{e.id} · target: {e.target} · {e.rows?.toLocaleString() ?? '—'} rows · {timeAgo(e.created_at)}</div>
                  </div>
                  {a.weak && <span className="ab-chip warn">Weak fit</span>}
                  <span className={`ab-chip ${isCls ? 'dk' : 'hz'}`}>{e.task}</span>
                  <div style={{ textAlign: 'right' }}>
                    <b style={{ color: 'var(--ab-acc-ink)' }}>{formatScore(a.best, e.task)}</b>
                    <div className="ab-lbl">{a.best?.name ?? '—'}</div>
                  </div>
                  <motion.span animate={{ rotate: open ? 180 : 0 }} style={{ display: 'grid' }}><ChevronDown size={18} /></motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      key="body"
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease }} style={{ overflow: 'hidden' }}
                    >
                      <div className="acc-b">
                        <div className="ab-mini-grid">
                          <Mini label="Best model"          value={a.best?.name ?? '—'}    sub={formatScore(a.best, e.task)} />
                          <Mini label="Fastest model"       value={a.fastest?.name ?? '—'} sub={seconds(a.fastest?.time)} />
                          <Mini label="Models trained"      value={a.models.length} />
                          <Mini label="Total training time" value={duration(a.totalTime)} />
                        </div>

                        <div className="ab-tw">
                          <table className="ab-table">
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
                                  <td className="ab-lbl">{i + 1}</td>
                                  <td style={{ fontWeight: 600 }}>
                                    {m.name}
                                    {i === 0 && <span className="ab-badge">MOST ACCURATE</span>}
                                    {a.fastest?.id === m.id && <span className="ab-badge" style={{ background: 'var(--ab-dark)', color: 'var(--ab-on)' }}>FASTEST</span>}
                                  </td>
                                  <td>
                                    <div className="num">{rowScore(e.task, m.score)}</div>
                                    <div className="ab-track"><i style={{ width: `${Math.max(0, m.score) * 100}%` }} /></div>
                                  </td>
                                  {isCls
                                    ? <><td>{pct(m.f1)}</td><td>{pct(m.precision)}</td><td>{pct(m.recall)}</td></>
                                    : <><td>{num(m.rmse)}</td><td>{num(m.mae)}</td></>}
                                  <td className="ab-lbl">{seconds(m.time)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {a.insights.length > 0 && (
                          <div className={`ab-note${a.weak ? ' warn' : ''}`}>
                            <b>What this means</b>
                            {a.insights.map((text, i) => <p key={i}>{text}</p>)}
                          </div>
                        )}

                        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <Link href={`/reports/${e.id}`} className="ab-btn sm dark"><ArrowUpRight size={14} /> Open run page</Link>
                          <button className="ab-btn sm" onClick={() => { downloadCsv(`experiment-${e.id}.csv`, rowsFor(e, a)); toast(`Experiment #${e.id} exported`, 'success') }}>
                            <Download size={14} /> Export this experiment
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            )
          })}
        </>
      )}
    </Page>
  )
}