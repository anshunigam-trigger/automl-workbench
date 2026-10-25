'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Upload, Zap, Search, SlidersHorizontal, MoreHorizontal,
  FileSpreadsheet, FlaskConical, Database, Layers, Timer, BarChart3,
} from 'lucide-react'
import { useExperiments } from '@/lib/useExperiments'
import { checkHealth } from '@/lib/api'
import { formatScore, modelName, seconds } from '@/lib/format'
import { Page, CountUp, list, rise, ease, ErrorState } from '@/components/ui'
import './dashboard.css'

const PER_PAGE = 6
const MONTHS   = 8
const lift     = { whileHover: { y: -4 }, transition: { type: 'spring', stiffness: 400, damping: 26 } }

// Runs per month for the last `n` months, split by task type
function monthBuckets(experiments, n = MONTHS) {
  const now = new Date()
  const months = Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1)
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en', { month: 'short' }), clf: 0, other: 0 }
  })
  experiments.forEach(e => {
    const d = new Date(e.created_at)
    const m = months.find(x => x.key === `${d.getFullYear()}-${d.getMonth()}`)
    if (!m) return
    if (e.task === 'classification') m.clf++
    else m.other++
  })
  return months
}

const fmtDate = iso => {
  const d = new Date(iso)
  return isNaN(d) ? '—' : d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function DashboardPage() {
  const { experiments, loading, error, refetch } = useExperiments()
  const [apiUp, setApiUp]         = useState(null)
  const [greeting, setGreeting]   = useState('Welcome back')
  const [query, setQuery]         = useState('')
  const [taskFilter, setTaskFilter] = useState('all')
  const [menu, setMenu]           = useState(false)
  const [page, setPage]           = useState(1)
  const [picked, setPicked]       = useState([])
  const menuRef = useRef(null)

  useEffect(() => {
    checkHealth().then(setApiUp)
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening')
  }, [])

  useEffect(() => {
    const out = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false) }
    document.addEventListener('mousedown', out)
    return () => document.removeEventListener('mousedown', out)
  }, [])

  // ── Everything below is DERIVED from `experiments` ──
  const total         = experiments.length
  const datasetCount  = new Set(experiments.map(e => e.dataset)).size
  const modelsTrained = experiments.reduce((s, e) => s + e.results.length, 0)
  const nCls          = experiments.filter(e => e.task === 'classification').length

  const now       = new Date()
  const thisMonth = experiments.filter(e => {
    const d = new Date(e.created_at)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).length

  const times   = experiments.flatMap(e => e.results.map(r => r.time)).filter(t => t != null)
  const avgTime = times.length ? times.reduce((a, b) => a + b, 0) / times.length : null
  const fastest = times.length ? Math.min(...times) : null

  const topModels = experiments
    .filter(e => e.task === 'classification' && e.best)
    .map(e => ({ name: modelName(e.best.id, e.task), dataset: e.dataset, score: e.best.accuracy }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  const clsScores = experiments.filter(e => e.task === 'classification' && e.best).map(e => e.best.accuracy)
  const avgAcc    = clsScores.length ? (clsScores.reduce((a, b) => a + b, 0) / clsScores.length) * 100 : 0

  // Chart
  const months  = useMemo(() => monthBuckets(experiments), [experiments])
  const peak    = Math.max(0, ...months.flatMap(m => [m.clf, m.other]))
  const yMax    = Math.max(5, Math.ceil(peak / 5) * 5)
  const ticks   = [0, 1, 2, 3, 4, 5].map(i => (yMax * (5 - i)) / 5)
  const inRange = months.reduce((s, m) => s + m.clf + m.other, 0)

  // Table: search + filter + paginate
  const q        = query.trim().toLowerCase()
  const filtered = experiments.filter(e =>
    (taskFilter === 'all' || e.task === taskFilter) &&
    `${e.dataset} ${e.target} ${e.best ? modelName(e.best.id, e.task) : ''}`.toLowerCase().includes(q)
  )
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safe  = Math.min(page, pages)
  const rows  = filtered.slice((safe - 1) * PER_PAGE, safe * PER_PAGE)
  const from  = filtered.length ? (safe - 1) * PER_PAGE + 1 : 0

  const allPicked = rows.length > 0 && rows.every(e => picked.includes(e.id))
  const toggleAll = () => setPicked(p => allPicked
    ? p.filter(id => !rows.some(e => e.id === id))
    : [...new Set([...p, ...rows.map(e => e.id)])])
  const toggleOne = id => setPicked(p => (p.includes(id) ? p.filter(x => x !== id) : [...p, id]))

  const live = apiUp === null
    ? { text: 'Checking API…', c: 'var(--ab-mut)' }
    : apiUp ? { text: 'API online', c: 'var(--ab-ok)' } : { text: 'API unreachable', c: 'var(--ab-bad)' }

  const tiles = [
    { label: 'Total experiments', Icon: FlaskConical, hot: true,
      value: loading ? '—' : <CountUp to={total} />,
      chip: `↑ ${thisMonth}`, note: 'this month' },
    { label: 'Datasets', Icon: Database,
      value: loading ? '—' : <CountUp to={datasetCount} />,
      chip: `${datasetCount ? (total / datasetCount).toFixed(1) : 0}`, note: 'runs per dataset' },
    { label: 'Models trained', Icon: Layers,
      value: loading ? '—' : <CountUp to={modelsTrained} />,
      chip: `${total ? (modelsTrained / total).toFixed(1) : 0}`, note: 'per experiment' },
    { label: 'Avg train time', Icon: Timer,
      value: loading || avgTime == null ? '—' : seconds(avgTime),
      chip: fastest == null ? '—' : seconds(fastest), note: 'fastest model' },
  ]

  return (
    <Page
      title={
        <span className="db-title">
          {greeting}, Anshu
          <span className="db-pill" style={{ '--c': live.c }}><i className="db-dot" />{live.text}</span>
        </span>
      }
      sub="Stay on top of your experiments, compare models, and track training status."
      action={
        <Link href="/experiments" className="ab-btn dark fit" style={{ borderRadius: 14 }}>
          <Zap size={16} /> Run experiment
        </Link>
      }
    >
      {error && <ErrorState text={error} onRetry={refetch} />}

      {/* First-run state: no experiments yet */}
      {!loading && !error && total === 0 && (
        <motion.div className="db-card db-start" variants={rise}>
          <div>
            <b className="db-h">Welcome to AutoBench</b>
            <div className="ab-lbl">Three steps to your first leaderboard</div>
          </div>
          <ol className="db-steps">
            {[
              [Upload, 'Upload a CSV', 'Pick the dataset to model'],
              [Layers, 'Choose algorithms', 'Compare several at once'],
              [BarChart3, 'Read the results', 'See which model wins'],
            ].map(([Icon, t, d], i) => (
              <motion.li key={t} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.12, duration: 0.4, ease }}>
                <span className="db-actic"><Icon size={15} /></span>
                <div><b>{t}</b><small>{d}</small></div>
              </motion.li>
            ))}
          </ol>
          <Link href="/experiments" className="ab-btn dark fit"><Plus size={16} /> Start first experiment</Link>
        </motion.div>
      )}

      <div className="db-grid">

        {/* ── Left: best accuracy + average accuracy ── */}
        <motion.div className="db-stack" variants={list}>
          <motion.div className="db-card" variants={rise} {...lift}>
            <div className="ab-row">
              <span className="db-eyebrow">Best accuracy</span>
              <span className="db-tag">Classification</span>
            </div>
            <div className="db-hero">
              {loading || !topModels.length ? '—' : <CountUp to={topModels[0].score * 100} decimals={2} suffix="%" />}
            </div>
            <div className="db-note">
              {topModels.length
                ? <><span className="db-chip" style={{ '--c': 'var(--ab-ok)' }}>{topModels[0].name}</span> on {topModels[0].dataset}</>
                : 'No classification runs yet'}
            </div>

            <div className="db-two">
              <Link href="/experiments" className="ab-btn dark" style={{ borderRadius: 16 }}><Plus size={15} /> New experiment</Link>
              <Link href="/datasets" className="ab-btn" style={{ borderRadius: 16 }}><Upload size={15} /> Upload dataset</Link>
            </div>

            <div className="db-sep">
              <div className="ab-row" style={{ marginBottom: 12 }}>
                <b className="db-small">Top models</b>
                <span className="ab-lbl">{nCls} classification run{nCls === 1 ? '' : 's'}</span>
              </div>
              {loading ? <div className="ab-skel" /> : topModels.length === 0 ? (
                <div className="ab-lbl">Run a classification experiment to rank models here.</div>
              ) : (
                <div className="db-three">
                  {topModels.map((m, i) => (
                    <div key={`${m.name}-${m.dataset}`} className="db-mini">
                      <div className="db-minihead">
                        <b className="db-trunc">{m.name}</b>
                        <i className="db-dot" style={{ '--c': i === 0 ? 'var(--ab-ok)' : 'var(--ab-acc)' }} />
                      </div>
                      <div className="db-mscore">{(m.score * 100).toFixed(2)}%</div>
                      <div className="db-trunc db-faint">{m.dataset}</div>
                      <div className="db-rank" style={{ color: i === 0 ? 'var(--ab-ok)' : 'var(--ab-acc)' }}>{i === 0 ? 'Best' : `#${i + 1}`}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div className="db-card" variants={rise} {...lift}>
            <div className="ab-row">
              <b className="db-small">Average accuracy</b>
              <span className="db-faint">across classification runs</span>
            </div>
            <div className="db-meter">
              <motion.i initial={{ width: 0 }} animate={{ width: `${loading ? 0 : avgAcc}%` }} transition={{ duration: 0.9, ease, delay: 0.5 }} />
            </div>
            <div className="ab-row db-mono">
              <span style={{ color: 'var(--ab-acc)', fontWeight: 700 }}>{avgAcc ? avgAcc.toFixed(2) : '0.00'}% <span className="db-faint" style={{ fontWeight: 400 }}>avg</span></span>
              <span className="db-faint">100% max</span>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Middle: bento tiles ── */}
        <motion.div className="db-bento" variants={list}>
          {tiles.map(t => (
            <motion.div key={t.label} className={`db-tile${t.hot ? ' hot' : ''}`} variants={rise} {...lift}>
              <div className="ab-row" style={{ flexWrap: 'nowrap' }}>
                <span className="db-tilelbl">{t.label}</span>
                <span className="db-ic"><t.Icon size={14} /></span>
              </div>
              <div className="db-val">{t.value}</div>
              <div className="db-chiprow"><span className="db-chip" style={{ '--c': 'var(--ab-ok)' }}>{t.chip}</span><span>{t.note}</span></div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Right: runs per month ── */}
        <motion.div className="db-card db-chartcard" variants={rise} {...lift}>
          <div>
            <b className="db-h">Experiment activity</b>
            <div className="ab-lbl">Runs per month, last {MONTHS} months</div>
            <div className="ab-row" style={{ marginTop: 16 }}>
              <b className="db-small">Classification vs Regression</b>
              <div className="db-legend">
                <span><i className="db-stripe" />Classification</span>
                <span><i className="db-solid" />Regression</span>
              </div>
            </div>
          </div>

          <div className="db-plot">
            <div className="db-y">{ticks.map(t => <span key={t}>{t}</span>)}</div>
            <div className="db-cols">
              {months.map((m, i) => (
                <div key={m.key} className="db-col" title={`${m.label}: ${m.clf} classification · ${m.other} other`}>
                  <div className="db-pair">
                    {[['db-stripe', m.clf], ['db-solid', m.other]].map(([cls, n], j) => (
                      <motion.div
                        key={cls} className={`db-bar ${cls}`}
                        style={{ height: `${(n / yMax) * 100}%`, transformOrigin: 'bottom' }}
                        initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                        transition={{ duration: 0.7, ease, delay: 0.5 + i * 0.06 + j * 0.03 }}
                      />
                    ))}
                  </div>
                  <small>{m.label}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="ab-row db-foot">
            <span>Runs in range</span>
            <b className="db-mono">{loading ? '—' : inRange}</b>
          </div>
        </motion.div>
      </div>

      {/* ── Recent experiments table ── */}
      <motion.section className="db-card db-tablecard" variants={rise} initial="hidden" animate="hidden" whileInView="show" viewport={{ once: true, margin: '0px 0px -50px 0px' }}>
        <div className="db-thead">
          <div>
            <b className="db-h">Recent experiments</b>
            <div className="ab-lbl">Latest experiment runs and model validation jobs</div>
          </div>
          <div className="ab-tools">
            <label className="ab-search">
              <Search size={14} />
              <input value={query} onChange={e => { setQuery(e.target.value); setPage(1) }} placeholder="Search experiments" aria-label="Search experiments" />
            </label>
            <div className="db-menuwrap" ref={menuRef}>
              <button className="db-filter" onClick={() => setMenu(m => !m)} aria-expanded={menu}>
                <SlidersHorizontal size={14} /> {taskFilter === 'all' ? 'Filter' : taskFilter}
              </button>
              <AnimatePresence>
                {menu && (
                  <motion.div className="db-menu" initial={{ opacity: 0, y: -6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                    {['all', 'classification', 'regression'].map(t => (
                      <button key={t} className={taskFilter === t ? 'on' : ''} onClick={() => { setTaskFilter(t); setPage(1); setMenu(false) }}>{t}</button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="ab-tw" style={{ marginTop: 0 }}>
          <table className="db-table">
            <thead>
              <tr>
                <th style={{ width: 44, paddingLeft: 24 }}><input type="checkbox" checked={allPicked} onChange={toggleAll} aria-label="Select all" /></th>
                <th>Experiment</th><th>Activity</th><th>Score</th><th>Status</th><th>Date &amp; time</th><th style={{ textAlign: 'right', paddingRight: 24 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [0, 1, 2].map(i => <tr key={i}><td colSpan={7}><div className="ab-skel" style={{ margin: '4px 0' }} /></td></tr>)
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="ab-lbl" style={{ textAlign: 'center', padding: 32 }}>
                  {total === 0 ? <>No experiments yet. <Link href="/experiments" className="ab-link">Run your first one</Link>.</> : 'No experiments match your search.'}
                </td></tr>
              ) : rows.map((e, i) => (
                <motion.tr key={e.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.05 + i * 0.05 }}>
                  <td style={{ paddingLeft: 24 }}><input type="checkbox" checked={picked.includes(e.id)} onChange={() => toggleOne(e.id)} aria-label={`Select experiment ${e.id}`} /></td>
                  <td className="db-mono" style={{ fontWeight: 700 }}>#{e.id}</td>
                  <td>
                    <div className="db-act">
                      <span className="db-actic"><FileSpreadsheet size={14} /></span>
                      <div>
                        <b>{e.dataset}</b>
                        <div className="db-faint">target: {e.target} · {e.rows?.toLocaleString() ?? '—'} rows · {e.task}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="db-mono" style={{ fontWeight: 800 }}>{formatScore(e.best, e.task)}</div>
                    <div className="db-faint">{e.best ? modelName(e.best.id, e.task) : 'No results'}</div>
                  </td>
                  <td>
                    <span className="db-pill sm" style={{ '--c': e.best ? 'var(--ab-ok)' : '#d97706' }}>
                      <i className="db-dot" />{e.best ? 'Completed' : 'No results'}
                    </span>
                  </td>
                  <td className="db-mono db-faint">{fmtDate(e.created_at)}</td>
                  <td style={{ textAlign: 'right', paddingRight: 24 }}>
                    <Link href="/reports" className="db-more" title="View report" aria-label="View report"><MoreHorizontal size={16} /></Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="db-pager">
          <span>
            {filtered.length === 0 ? 'No experiments' : <>Showing <b>{from}–{from + rows.length - 1}</b> of {filtered.length} experiments</>}
            {picked.length > 0 && <> · {picked.length} selected</>}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="db-pg" disabled={safe === 1} onClick={() => setPage(safe - 1)}>Previous</button>
            <button className="db-pg" disabled={safe === pages} onClick={() => setPage(safe + 1)}>Next</button>
          </div>
        </div>
      </motion.section>
    </Page>
  )
}