'use client'

import { Suspense, useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ArrowUpRight, Info, Download, Link2, Check, GitCompare } from 'lucide-react'
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useExperiments } from '@/lib/useExperiments'
import { downloadCsv } from '@/lib/exportCsv'
import { timeAgo } from '@/lib/format'
import { METRICS, winnerIndex, flattenRuns, runRecord, pctText, secText } from '@/lib/runs'
import { Page, Card, Empty, ErrorState, toast } from '@/components/ui'
import './compare.css'

const MAX = 4
// Orange marks the baseline; the rest are neutrals so runs stay distinguishable without a rainbow
const COLORS = ['#FF6901', 'var(--ab-ink)', '#83837A', '#B8B8B2']
const TIP = { background: 'var(--ab-card)', border: '1px solid var(--ab-line)', borderRadius: 8, fontSize: 12 }
const TICK = { fill: 'var(--ab-mut)', fontSize: 11 }
const when = iso => { const d = new Date(iso); return isNaN(d) ? '—' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }

const isPct = m => m.text === pctText
const isSec = m => m.text === secText
const fmtDelta = (m, d) => {
  const sign = d > 0 ? '+' : '−'
  const a = Math.abs(d)
  return isPct(m) ? `${sign}${(a * 100).toFixed(2)} pts` : isSec(m) ? `${sign}${a.toFixed(2)}s` : `${sign}${a.toFixed(3)}`
}
// Width of the little bar under each value: percentages use their own scale, others are relative to the largest run
const barWidth = (m, v, vals) => {
  if (v == null) return 0
  if (isPct(m)) return Math.max(0, Math.min(100, v * 100))
  const mx = Math.max(...vals.filter(x => x != null))
  return mx > 0 ? Math.max(0, (v / mx) * 100) : 0
}

// ▲ better / ▼ worse than the baseline, in the direction that matters for each metric
function Delta({ m, v, base }) {
  if (v == null || base == null) return null
  const d = v - base
  if (d === 0) return <span className="cmp-d eq">same</span>
  const good = m.better === 'high' ? d > 0 : d < 0
  return <span className={`cmp-d ${good ? 'up' : 'dn'}`} title={good ? 'Better than the baseline' : 'Worse than the baseline'}>{good ? '▲' : '▼'} {fmtDelta(m, d)}</span>
}

function Compare() {
  const { experiments, loading, error, refetch } = useExperiments()
  const params = useSearchParams()
  const [picked, setPicked] = useState(() => (params.get('runs') || '').split(',').filter(Boolean).slice(0, MAX))
  const [query, setQuery] = useState('')
  const [taskFilter, setTaskFilter] = useState('all')
  const [tab, setTab] = useState('scores')
  const [onlyDiffs, setOnlyDiffs] = useState(false)

  const runs = useMemo(() => flattenRuns(experiments), [experiments])
  const byKey = useMemo(() => new Map(runs.map(r => [r.key, r])), [runs])
  const chosen = picked.map(k => byKey.get(k)).filter(Boolean)
  const task = chosen[0]?.task

  // Keep the URL shareable (preserving Next's history state)
  useEffect(() => {
    window.history.replaceState(window.history.state, '', picked.length ? `/compare?runs=${picked.join(',')}` : '/compare')
  }, [picked])

  const toggle = k => setPicked(p => (p.includes(k) ? p.filter(x => x !== k) : p.length >= MAX ? p : [...p, k]))
  const makeBaseline = k => setPicked(p => [k, ...p.filter(x => x !== k)])

  // Why a run can't be added right now (null = selectable)
  const blocked = r => {
    if (picked.includes(r.key)) return null
    if (task && r.task !== task) return `Different task (${task} selected)`
    if (picked.length >= MAX) return `Up to ${MAX} models`
    return null
  }

  const q = query.trim().toLowerCase()
  const shown = runs.filter(r => (taskFilter === 'all' || r.task === taskFilter) && `${r.name} ${r.dataset} ${r.target}`.toLowerCase().includes(q))

  const ready = chosen.length >= 2
  const metrics = task ? METRICS[task] : []
  const primary = metrics[0]
  const differs = fn => new Set(chosen.map(fn)).size > 1
  const sameData = ready && !differs(r => r.dataset) && !differs(r => r.target)

  // Summary lines, all computed from the selected runs
  const insights = []
  if (ready) {
    const pv = chosen.map(r => r.metrics[primary.key])
    const tv = chosen.map(r => r.metrics.time)
    const bi = winnerIndex(pv, primary.better)
    const fi = winnerIndex(tv, 'low')
    if (bi >= 0) insights.push(`${chosen[bi].name} has the highest ${primary.label} (${primary.text(pv[bi])})${bi > 0 && pv[0] != null ? `, ${fmtDelta(primary, pv[bi] - pv[0])} vs the baseline` : ''}.`)
    if (fi >= 0) insights.push(`${chosen[fi].name} trained fastest (${secText(tv[fi])}).`)
    if (bi >= 0 && fi >= 0 && bi !== fi && tv[fi] > 0 && tv[bi] != null) insights.push(`The best ${primary.label} took ${(tv[bi] / tv[fi]).toFixed(1)}× longer to train than the fastest model.`)
  }
  const hasMissing = ready && chosen.some(r => metrics.some(m => r.metrics[m.key] == null))

  // Charts
  const chartMetrics = metrics.filter(m => m.chart)
  const scoresData = chartMetrics.map(m => ({
    metric: m.label,
    ...Object.fromEntries(chosen.map(r => [r.key, r.metrics[m.key] == null ? null : +(r.metrics[m.key] * 100).toFixed(2)])),
  }))
  const errorsData = task === 'regression'
    ? ['rmse', 'mae'].map(k => ({ metric: k.toUpperCase(), ...Object.fromEntries(chosen.map(r => [r.key, r.metrics[k] ?? null])) }))
    : []
  const tradeData = ready
    ? chosen.map((r, i) => ({ i, key: r.key, name: r.name, x: r.metrics.time, y: r.metrics[primary.key] == null ? null : isPct(primary) ? r.metrics[primary.key] * 100 : r.metrics[primary.key] }))
        .filter(p => p.x != null && p.y != null)
    : []
  const tabs = [['scores', 'Scores']]
  if (task === 'classification') tabs.push(['profile', 'Profile'])
  if (tradeData.length >= 2) tabs.push(['tradeoff', 'Speed vs score'])
  if (task === 'regression' && sameData) tabs.push(['errors', 'Errors'])
  const active = tabs.some(([k]) => k === tab) ? tab : 'scores'

  const context = [
    ['Dataset', r => r.dataset], ['Target', r => r.target], ['Task', r => r.task],
    ['Rows', r => (r.rows != null ? r.rows.toLocaleString() : '—')],
    ['Experiment', r => `#${r.expId}`], ['Trained', r => when(r.createdAt)],
    ['Hyperparameters', () => 'Not recorded'], ['Random seed', () => 'Not recorded'], ['Evaluation split', () => 'Not recorded'],
  ]
  const contextRows = context.filter(([, fn]) => !onlyDiffs || differs(fn))

  const exportCsv = () => { downloadCsv('autobench-comparison.csv', chosen.map(runRecord)); toast(`Exported ${chosen.length} models`, 'success') }
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); toast('Link copied', 'success') }
    catch { toast('Couldn’t copy the link', 'error') }
  }

  return (
    <Page
      title="Compare models"
      sub={`Choose two to ${MAX} trained models of the same task type. The first one you pick is the baseline.`}
      action={
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="ab-btn fit" onClick={copyLink} disabled={!chosen.length}><Link2 size={15} /> Copy link</button>
          <button className="ab-btn dark fit" onClick={exportCsv} disabled={!ready}><Download size={15} /> Export CSV</button>
        </div>
      }
    >
      {error && <ErrorState text={error} onRetry={refetch} />}

      {!loading && !error && runs.length === 0 ? (
        <Empty title="No trained models yet" text="Train a model first, then come back to compare results." href="/experiments" cta="Start an experiment" />
      ) : (
        <div className="cmp-layout">

          {/* ── Picker ── */}
          <aside className="ab-card cmp-picker" aria-label="Choose models">
            <div className="ab-row"><b className="ab-h">Models</b><span className="ab-lbl">{picked.length} of {MAX} selected</span></div>
            <label className="ab-search" style={{ marginTop: 12 }}>
              <Search size={15} />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search model or dataset" aria-label="Search models" />
            </label>
            <div className="ab-pills" style={{ margin: '10px 0' }}>
              {['all', 'classification', 'regression'].map(t => <button key={t} className={taskFilter === t ? 'on' : ''} onClick={() => setTaskFilter(t)}>{t}</button>)}
            </div>

            <div className="cmp-list" role="group" aria-label="Models">
              {loading ? [0, 1, 2, 3].map(i => <div key={i} className="ab-skel" style={{ height: 52 }} />)
                : shown.length === 0 ? <p className="ab-lbl" style={{ padding: '16px 4px' }}>No models match.</p>
                : shown.map(r => {
                  const why = blocked(r)
                  const idx = picked.indexOf(r.key)
                  const on = idx >= 0
                  const m0 = METRICS[r.task][0]
                  return (
                    <button key={r.key} type="button" className={`cmp-item${on ? ' on' : ''}`} disabled={!!why} aria-pressed={on} title={why || undefined}
                            style={on ? { '--c': COLORS[idx] } : undefined} onClick={() => toggle(r.key)}>
                      <span className="cmp-box">{on && <Check size={12} />}</span>
                      <span className="cmp-it">
                        <b>{r.name}{r.isWinner && <span className="ab-badge">BEST</span>}</b>
                        <small>{r.dataset} · {timeAgo(r.createdAt)}</small>
                        {why && <small className="cmp-why">{why}</small>}
                      </span>
                      <span className="db-mono cmp-sc">{m0.text(r.metrics[m0.key])}</span>
                    </button>
                  )
                })}
            </div>
            {picked.length > 0 && <button className="ab-link" style={{ marginTop: 10 }} onClick={() => setPicked([])}>Clear selection</button>}
          </aside>

          {/* ── Workspace ── */}
          <div className="cmp-main">
            {chosen.length === 0 && (
              <Card className="cmp-hint">
                <div className="ab-emptyic"><GitCompare size={24} /></div>
                <b>Select models to compare</b>
                <p className="ab-lbl">Tick two to {MAX} models on the left. You’ll see metrics with differences from the baseline, charts, and what changed between runs.</p>
              </Card>
            )}
            {chosen.length === 1 && <p className="ab-lbl" style={{ margin: '0 0 12px' }}>Select at least one more {task} model to see the comparison.</p>}

            {chosen.length > 0 && (
              <div className="cmp-cards">
                <AnimatePresence initial={false}>
                  {chosen.map((r, i) => {
                    const pv = r.metrics[primary.key]
                    return (
                      <motion.div key={r.key} layout className="cmp-card" style={{ '--c': COLORS[i] }}
                                  initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25 }}>
                        <div className="ab-row" style={{ flexWrap: 'nowrap' }}>
                          <span className="cmp-tag">{i === 0 ? 'Baseline' : `Run ${i + 1}`}</span>
                          <button className="cmp-x" onClick={() => toggle(r.key)} aria-label={`Remove ${r.name}`}><X size={14} /></button>
                        </div>
                        <b className="cmp-name">{r.name}</b>
                        <div className="ab-lbl cmp-sub">{r.dataset} · target {r.target}</div>
                        <div className="cmp-score db-mono">{primary.text(pv)}</div>
                        <div className="ab-lbl">{primary.label} {i > 0 && <Delta m={primary} v={pv} base={chosen[0].metrics[primary.key]} />}</div>
                        <div className="cmp-links">
                          <Link href={`/reports/${r.expId}`} className="ab-link">Run page <ArrowUpRight size={12} style={{ verticalAlign: -1 }} /></Link>
                          {i > 0 && <button className="ab-link" onClick={() => makeBaseline(r.key)}>Make baseline</button>}
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}

            {ready && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                {!sameData && (
                  <div className="ab-alert warn" role="status">
                    <span className="ab-alert-ic"><Info size={15} /></span>
                    <div className="ab-alert-tx"><b>These models were trained on different data</b><span>Scores from different datasets or targets are not directly comparable. Treat differences with caution.</span></div>
                  </div>
                )}

                {insights.length > 0 && (
                  <Card className="cmp-sum">
                    <b className="ab-h">Summary</b>
                    <ul>{insights.map((t, i) => <li key={i}>{t}</li>)}</ul>
                  </Card>
                )}

                <Card>
                  <div className="ab-row"><b className="ab-h">Metrics</b><span className="ab-lbl">▲ better · ▼ worse than the baseline · ↑ higher is better · ↓ lower is better</span></div>
                  <div className="ab-tw">
                    <table className="ab-table cmp-table">
                      <thead>
                        <tr><th>Metric</th>{chosen.map((r, i) => <th key={r.key}><span className="cmp-dot" style={{ background: COLORS[i] }} />{r.name}{i === 0 && <span className="cmp-base">baseline</span>}</th>)}</tr>
                      </thead>
                      <tbody>
                        {metrics.map(m => {
                          const vals = chosen.map(r => r.metrics[m.key])
                          const win = winnerIndex(vals, m.better)
                          return (
                            <tr key={m.key}>
                              <td style={{ fontWeight: 600 }}>{m.label} <span className="ab-lbl" title={m.better === 'high' ? 'Higher is better' : 'Lower is better'}>{m.better === 'high' ? '↑' : '↓'}</span></td>
                              {vals.map((v, i) => (
                                <td key={chosen[i].key}>
                                  <div className="cmp-cell">
                                    <span className="db-mono" style={win === i ? { fontWeight: 700, color: 'var(--ab-acc-ink)' } : undefined}>{m.text(v)}</span>
                                    {win === i && <span className="ab-badge" style={{ margin: 0 }}>BEST</span>}
                                    {i > 0 && <Delta m={m} v={v} base={vals[0]} />}
                                  </div>
                                  <div className="cmp-bar"><i style={{ width: `${barWidth(m, v, vals)}%`, background: COLORS[i] }} /></div>
                                </td>
                              ))}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="ab-lbl" style={{ margin: '10px 0 0' }}>Missing values show as — and are never counted as zero.{hasMissing && ' Some metrics were not reported for every model.'}</p>
                </Card>

                <Card>
                  <div className="ab-row">
                    <b className="ab-h">Charts</b>
                    <div className="ab-pills" role="tablist" aria-label="Chart type">
                      {tabs.map(([k, label]) => <button key={k} role="tab" aria-selected={active === k} className={active === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>)}
                    </div>
                  </div>
                  <motion.div key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} style={{ marginTop: 14 }}>
                    {active === 'scores' && (
                      <>
                        <div className="ab-lbl" style={{ marginBottom: 8 }}>{task === 'classification' ? 'Scores (%)' : 'R² × 100'} from the backend’s evaluation.</div>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={scoresData} margin={{ top: 8, right: 12, bottom: 0, left: -10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--ab-line)" vertical={false} />
                            <XAxis dataKey="metric" tick={TICK} />
                            <YAxis domain={task === 'classification' ? [0, 100] : ['auto', 'auto']} tick={TICK} />
                            <Tooltip cursor={{ fill: 'var(--ab-inset)' }} contentStyle={TIP} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            {chosen.map((r, i) => <Bar key={r.key} dataKey={r.key} name={`${r.name} · ${r.dataset}`} fill={COLORS[i]} radius={[4, 4, 0, 0]} maxBarSize={36} animationDuration={800} />)}
                          </BarChart>
                        </ResponsiveContainer>
                      </>
                    )}
                    {active === 'profile' && (
                      <>
                        <div className="ab-lbl" style={{ marginBottom: 8 }}>How each model balances accuracy, precision, recall and F1.</div>
                        <ResponsiveContainer width="100%" height={340}>
                          <RadarChart data={scoresData} outerRadius="72%">
                            <PolarGrid stroke="var(--ab-line)" />
                            <PolarAngleAxis dataKey="metric" tick={TICK} />
                            <PolarRadiusAxis domain={[0, 100]} tick={{ fill: 'var(--ab-mut)', fontSize: 10 }} stroke="var(--ab-line)" />
                            {chosen.map((r, i) => <Radar key={r.key} name={`${r.name} · ${r.dataset}`} dataKey={r.key} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.12} />)}
                            <Tooltip contentStyle={TIP} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </>
                    )}
                    {active === 'tradeoff' && (
                      <>
                        <div className="ab-lbl" style={{ marginBottom: 8 }}>Up and to the left is better: higher {primary.label} in less training time.</div>
                        <ResponsiveContainer width="100%" height={320}>
                          <ScatterChart margin={{ top: 10, right: 24, bottom: 10, left: 0 }}>
                            <CartesianGrid stroke="var(--ab-line)" strokeDasharray="3 3" />
                            <XAxis type="number" dataKey="x" name="Train time" unit="s" tick={TICK} />
                            <YAxis type="number" dataKey="y" name={primary.label} unit={isPct(primary) ? '%' : ''} domain={['auto', 'auto']} tick={TICK} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={TIP} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            {tradeData.map(p => <Scatter key={p.key} name={p.name} data={[p]} fill={COLORS[p.i]} />)}
                          </ScatterChart>
                        </ResponsiveContainer>
                      </>
                    )}
                    {active === 'errors' && (
                      <>
                        <div className="ab-lbl" style={{ marginBottom: 8 }}>Error in the target’s own units. Lower is better.</div>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={errorsData} margin={{ top: 8, right: 12, bottom: 0, left: -10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--ab-line)" vertical={false} />
                            <XAxis dataKey="metric" tick={TICK} />
                            <YAxis tick={TICK} />
                            <Tooltip cursor={{ fill: 'var(--ab-inset)' }} contentStyle={TIP} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            {chosen.map((r, i) => <Bar key={r.key} dataKey={r.key} name={`${r.name} · ${r.dataset}`} fill={COLORS[i]} radius={[4, 4, 0, 0]} maxBarSize={36} animationDuration={800} />)}
                          </BarChart>
                        </ResponsiveContainer>
                      </>
                    )}
                  </motion.div>
                </Card>

                <Card>
                  <div className="ab-row">
                    <div><b className="ab-h">Configuration</b><div className="ab-lbl">What was recorded for each run. Differences are flagged.</div></div>
                    <label className="cmp-check"><input type="checkbox" checked={onlyDiffs} onChange={e => setOnlyDiffs(e.target.checked)} /> Only differences</label>
                  </div>
                  <div className="ab-tw">
                    <table className="ab-table">
                      <thead><tr><th>Field</th>{chosen.map((r, i) => <th key={r.key}><span className="cmp-dot" style={{ background: COLORS[i] }} />{r.name}</th>)}</tr></thead>
                      <tbody>
                        {contextRows.length === 0 ? <tr><td colSpan={chosen.length + 1} className="ab-lbl" style={{ textAlign: 'center', padding: 20 }}>These runs share the same recorded configuration.</td></tr>
                          : contextRows.map(([label, fn]) => (
                            <tr key={label}>
                              <td style={{ fontWeight: 600 }}>{label}{differs(fn) && <span className="ab-chip warn" style={{ marginLeft: 8 }}>differs</span>}</td>
                              {chosen.map(r => <td key={r.key} className={fn(r) === 'Not recorded' ? 'ab-lbl' : ''}>{fn(r)}</td>)}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </Page>
  )
}

// useSearchParams must sit under a Suspense boundary
export default function ComparePage() {
  return <Suspense fallback={null}><Compare /></Suspense>
}