'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Search, Upload, FileSpreadsheet, ArrowRight } from 'lucide-react'
import { useExperiments } from '@/lib/useExperiments'
import { timeAgo, formatScore, modelName } from '@/lib/format'
import { setPendingUpload } from '@/lib/pendingUpload'
import { Page, Card, Tile, Empty, ErrorState, CountUp, toast, list, rise } from '@/components/ui'

// A "dataset" here is every distinct file name that has been used in an experiment.
// Everything shown is derived from saved experiments, so nothing is made up.
function deriveDatasets(experiments) {
  const map = new Map()
  experiments.forEach(e => {
    const d = map.get(e.dataset) ?? { name: e.dataset, rows: null, targets: new Set(), tasks: new Set(), runs: 0, lastAt: null, best: {} }
    d.runs += 1
    if (e.rows != null) d.rows = Math.max(d.rows ?? 0, e.rows)
    d.targets.add(e.target)
    d.tasks.add(e.task)
    if (!d.lastAt || new Date(e.created_at) > new Date(d.lastAt)) d.lastAt = e.created_at
    if (e.best) {
      const sc = e.task === 'classification' ? e.best.accuracy : e.best.r2
      if (sc != null && (!d.best[e.task] || sc > d.best[e.task].sc)) d.best[e.task] = { sc, e }
    }
    map.set(e.dataset, d)
  })
  return [...map.values()].sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt))
}

export default function DatasetsPage() {
  const { experiments, loading, error, refetch } = useExperiments()
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [drag, setDrag]     = useState('idle') // idle | over | bad
  const router = useRouter()

  const datasets = useMemo(() => deriveDatasets(experiments), [experiments])

  const shown = datasets.filter(d =>
    (filter === 'All' || d.tasks.has(filter.toLowerCase())) &&
    d.name.toLowerCase().includes(search.trim().toLowerCase())
  )

  const totalRows = datasets.reduce((s, d) => s + (d.rows ?? 0), 0)
  const bestAcc = experiments
    .filter(e => e.task === 'classification' && e.best?.accuracy != null)
    .reduce((m, e) => Math.max(m, e.best.accuracy), 0)

  const onDrop = e => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (!f) return setDrag('idle')
    if (!/\.csv$/i.test(f.name)) {
      setDrag('bad')
      toast(`“${f.name}” isn’t a CSV file`, 'error')
      setTimeout(() => setDrag('idle'), 900)
      return
    }
    setDrag('idle')
    setPendingUpload(f)
    router.push('/experiments')
  }

  return (
    <Page
      title="Datasets"
      sub="Files you’ve used in experiments, and how each one performed."
      action={<Link href="/experiments" className="ab-btn dark fit"><Plus size={16} /> New experiment</Link>}
    >
      {error && <ErrorState text={error} onRetry={refetch} />}

      <motion.div className="ab-kpis" variants={list}>
        <Tile hot label="Datasets">{loading ? '—' : <CountUp to={datasets.length} />}</Tile>
        <Tile label="Experiments">{loading ? '—' : <CountUp to={experiments.length} />}</Tile>
        <Tile label="Total rows">{loading ? '—' : <CountUp to={totalRows} />}</Tile>
        <Tile label="Best accuracy">{loading || !bestAcc ? '—' : <CountUp to={bestAcc * 100} decimals={2} suffix="%" />}</Tile>
      </motion.div>

      <Card className={`ab-upload ${drag}`} onDragOver={e => { e.preventDefault(); setDrag('over') }} onDragLeave={() => setDrag('idle')} onDrop={onDrop}>
        <div className="ds-ic"><Upload size={20} /></div>
        <div>
          <b className="ab-h">{drag === 'over' ? 'Drop it here' : drag === 'bad' ? 'That isn’t a CSV file' : 'Add a dataset'}</b>
          <div className="ab-lbl">{drag === 'bad' ? 'Only .csv files are supported' : 'Drop a CSV here to start an experiment with it'}</div>
        </div>
        <Link href="/experiments" className="ab-btn dark fit"><Plus size={16} /> New experiment</Link>
      </Card>

      {!loading && datasets.length > 0 && (
        <Card>
          <div className="ab-row">
            <label className="ab-search">
              <Search size={15} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search datasets" aria-label="Search datasets" />
            </label>
            <div className="ab-pills">
              {['All', 'Classification', 'Regression'].map(f => (
                <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="ds-grid">
          {[0, 1, 2].map(i => <div key={i} className="ab-card"><div className="ab-skel" style={{ height: 200, marginTop: 0 }} /></div>)}
        </div>
      ) : !error && datasets.length === 0 ? (
        <Empty title="No datasets yet" text="Datasets appear here after you run your first experiment." href="/experiments" cta="Start an experiment" />
      ) : shown.length === 0 && datasets.length > 0 ? (
        <Card className="ab-empty">
          <b>No datasets match</b>
          <p className="ab-lbl">Try a different search term or filter.</p>
        </Card>
      ) : (
        <motion.div className="ds-grid" variants={list} initial="hidden" animate="show">
          {shown.map(d => {
            const top = d.best.classification ?? d.best.regression
            return (
              <motion.div key={d.name} className="ab-card ds" variants={rise} whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 400, damping: 26 }}>
                <div className="ds-ic"><FileSpreadsheet size={20} /></div>
                <div>
                  <div className="ds-name" title={d.name}>{d.name}</div>
                  <div className="ab-lbl">target → <b style={{ color: 'var(--ab-acc-ink)' }}>{[...d.targets].join(', ')}</b></div>
                </div>

                <div className="ds-two">
                  <div className="ab-mini"><b>{d.rows != null ? d.rows.toLocaleString() : '—'}</b><small style={{ margin: 0 }}>Rows</small></div>
                  <div className="ab-mini"><b>{d.runs}</b><small style={{ margin: 0 }}>Experiment{d.runs === 1 ? '' : 's'}</small></div>
                </div>

                <div className="ds-foot">
                  <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[...d.tasks].map(t => <span key={t} className={`ab-chip ${t === 'classification' ? 'dk' : 'hz'}`}>{t}</span>)}
                  </span>
                  <Link href="/experiments" className="ab-link">Use again <ArrowRight size={13} style={{ verticalAlign: -2 }} /></Link>
                </div>

                <div className="ds-meta">
                  <span>Last run {timeAgo(d.lastAt)}</span>
                  {top ? <span>{modelName(top.e.best.id, top.e.task)} · <b>{formatScore(top.e.best, top.e.task)}</b></span> : <span>No results</span>}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </Page>
  )
}