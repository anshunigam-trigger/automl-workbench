'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Search } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useExperiments } from '@/lib/useExperiments'
import { timeAgo, modelName, pct, rowScore, seconds } from '@/lib/format'
import { Page, Card, Tile, Empty, CountUp, ErrorState, list } from '@/components/ui'

const PER_PAGE = 8

// The four metric boxes in the summary panel depend on the task type
function metricBoxes(r) {
  if (r.task === 'classification') {
    return [
      { label: 'Accuracy',  value: pct(r.score) },
      { label: 'F1 score',  value: pct(r.f1) },
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
    <div className="ab-tip">
      <b>{d.name}</b>
      <div>Avg accuracy: {d.accuracy}%</div>
      <div className="ab-lbl">{d.runs} run{d.runs === 1 ? '' : 's'}</div>
    </div>
  )
}

export default function ModelsPage() {
  const { experiments, loading, error, refetch } = useExperiments()
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
    <Page
      title="Model registry"
      sub="Every model AutoBench has trained for you, with real metrics."
      action={<Link href="/experiments" className="ab-btn dark fit"><Plus size={16} /> Train model</Link>}
    >
      {error && <ErrorState text={error} onRetry={refetch} />}

      {/* KPIs */}
      <motion.div className="ab-kpis" variants={list}>
        <Tile hot label="Models trained">{loading ? '—' : <CountUp to={rows.length} />}</Tile>
        <Tile label="Experiments">{loading ? '—' : <CountUp to={experiments.length} />}</Tile>
        <Tile label="Best score" sub={bestRow?.name}>{loading || !bestRow ? '—' : rowScore(bestRow.task, bestRow.score)}</Tile>
        <Tile label="Fastest" sub={fastest?.name}>{loading || !fastest ? '—' : seconds(fastest.time)}</Tile>
        <Tile label="Avg train time">{loading || avgTime == null ? '—' : `${avgTime.toFixed(2)}s`}</Tile>
      </motion.div>

      {!loading && !error && rows.length === 0 && (
        <Empty title="No models trained yet" text="Every model you train will be listed here with its metrics." href="/experiments" cta="Train your first model" />
      )}

      {(loading || rows.length > 0) && (
        <>
          {/* Chart + selected model */}
          <motion.div className="ab-two" variants={list}>
            <Card>
              <b className="ab-h">Algorithm comparison</b>
              <div className="ab-lbl" style={{ marginBottom: 12 }}>Average accuracy of each algorithm across classification experiments</div>
              {loading ? (
                <div className="ab-skel" style={{ height: 180 }} />
              ) : chartData.length === 0 ? (
                <div className="ab-lbl">Train a classification model to see this chart.</div>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(180, chartData.length * 44)}>
                  <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--ab-line)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--ab-mut)', fontSize: 11 }} tickFormatter={v => `${v}%`} />
                    <YAxis type="category" dataKey="name" width={130} tick={{ fill: 'var(--ab-mut)', fontSize: 11 }} />
                    <Tooltip content={<AlgoTooltip />} cursor={{ fill: 'var(--ab-inset)' }} />
                    <Bar dataKey="accuracy" fill="var(--ab-acc)" radius={[0, 8, 8, 0]} animationDuration={900} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card>
              <div className="ab-row">
                <div>
                  <b className="ab-h">{selectedKey ? 'Selected model' : 'Best model'}</b>
                  <div className="ab-lbl">Click any row below to inspect it</div>
                </div>
                {selectedKey && <button className="ab-link" onClick={() => setSelectedKey(null)}>Reset</button>}
              </div>

              {loading || !featured ? (
                <div className="ab-skel" style={{ height: 180 }} />
              ) : (
                <motion.div key={featured.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, marginTop: 14 }}>{featured.name}</div>
                  <div className="ab-lbl">{featured.dataset} · {timeAgo(featured.createdAt)}</div>
                  <div className="ab-mini-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    {metricBoxes(featured).map(m => (
                      <div key={m.label} className="ab-mini"><small>{m.label}</small><b>{m.value}</b></div>
                    ))}
                  </div>
                  <div className="ab-lbl">
                    Trained in <b style={{ color: 'var(--ab-ink)' }}>{seconds(featured.time)}</b>
                    {featured.isWinner && ' · won its experiment'}
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>

          {/* Inventory */}
          <Card inView>
            <div className="ab-row">
              <div>
                <b className="ab-h">Model inventory</b>
                <div className="ab-lbl">{filtered.length} of {rows.length} models</div>
              </div>
              <div className="ab-tools">
                <label className="ab-search">
                  <Search size={15} />
                  <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search models or datasets" aria-label="Search models" />
                </label>
                <div className="ab-pills">
                  {['all', 'classification', 'regression'].map(t => (
                    <button key={t} className={task === t ? 'on' : ''} onClick={() => { setTask(t); setPage(1) }}>{t}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="ab-tw">
              <table className="ab-table">
                <thead>
                  <tr><th>Model</th><th>Dataset</th><th>Task</th><th>Score</th><th>F1 / RMSE</th><th>Time</th><th>Trained</th></tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7}><div className="ab-skel" /></td></tr>
                  ) : visible.length === 0 ? (
                    <tr><td colSpan={7} className="ab-lbl" style={{ textAlign: 'center', padding: 24 }}>No models match your search.</td></tr>
                  ) : visible.map((r, i) => (
                    <motion.tr
                      key={r.key}
                      className={`click${selectedKey === r.key ? ' sel' : ''}`}
                      onClick={() => setSelectedKey(r.key)}
                      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                    >
                      <td style={{ fontWeight: 600 }}>{r.name}{r.isWinner && <span className="ab-badge">BEST</span>}</td>
                      <td>{r.dataset}</td>
                      <td><span className={`ab-chip ${r.task === 'classification' ? 'dk' : 'hz'}`}>{r.task}</span></td>
                      <td>
                        <div className="num">{rowScore(r.task, r.score)}</div>
                        {r.task === 'classification' && r.score != null && (
                          <div className="ab-track"><i style={{ width: `${r.score * 100}%` }} /></div>
                        )}
                      </td>
                      <td>{r.task === 'classification' ? pct(r.f1) : (r.rmse == null ? '—' : r.rmse.toFixed(3))}</td>
                      <td className="ab-lbl">{seconds(r.time)}</td>
                      <td className="ab-lbl">{timeAgo(r.createdAt)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="ab-pager">
                <span>Page {safePage} of {totalPages}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="ab-btn sm" disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>Prev</button>
                  <button className="ab-btn sm" disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)}>Next</button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </Page>
  )
}