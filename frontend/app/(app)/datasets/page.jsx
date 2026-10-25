'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Search, Upload, FileSpreadsheet, ArrowRight } from 'lucide-react'
import { Page, Card, Tile, Empty, CountUp, toast, list, rise } from '@/components/ui'

const DATASETS = [
  { name: 'telecom_churn.csv',  rows: 7043, cols: 21, numeric: 8,  categorical: 13, task: 'Classification', target: 'Churn',     uploaded: '2 hrs ago',  experiments: 3, bestScore: '81.55%', size: '1.2 MB' },
  { name: 'titanic.csv',        rows: 891,  cols: 12, numeric: 6,  categorical: 6,  task: 'Classification', target: 'Survived',  uploaded: '1 day ago',  experiments: 1, bestScore: '79.12%', size: '89 KB'  },
  { name: 'house_prices.csv',   rows: 1460, cols: 81, numeric: 36, categorical: 45, task: 'Regression',     target: 'SalePrice', uploaded: '3 days ago', experiments: 2, bestScore: '89.23%', size: '450 KB' },
  { name: 'iris.csv',           rows: 150,  cols: 5,  numeric: 4,  categorical: 1,  task: 'Classification', target: 'species',   uploaded: '1 week ago', experiments: 1, bestScore: '96.67%', size: '4.5 KB' },
  { name: 'boston_housing.csv', rows: 506,  cols: 14, numeric: 13, categorical: 1,  task: 'Regression',     target: 'medv',      uploaded: '2 wks ago',  experiments: 1, bestScore: '85.44%', size: '35 KB'  },
  { name: 'customer_seg.csv',   rows: 2240, cols: 29, numeric: 14, categorical: 15, task: 'Classification', target: 'Response',  uploaded: '3 wks ago',  experiments: 0, bestScore: '—',      size: '280 KB' },
]

export default function DatasetsPage() {
  const [filter, setFilter]   = useState('All')
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(true)
  const [drag, setDrag]       = useState('idle') // idle | over | bad
  const router = useRouter()

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
    toast(`${f.name} noted. Pick it again in New experiment.`, 'info')
    router.push('/experiments')
  }

  // Simulates a real database fetch — replace with actual API call in Phase 5
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const list_ = DATASETS.filter(d => {
    const mf = filter === 'All' || d.task === filter
    const ms = d.name.toLowerCase().includes(search.toLowerCase())
    return mf && ms
  })

  return (
    <Page
      title="Datasets"
      sub="Manage your uploaded datasets and launch new experiments."
      action={<Link href="/experiments" className="ab-btn dark fit"><Plus size={16} /> New experiment</Link>}
    >
      {/* Stats */}
      <motion.div className="ab-kpis" variants={list}>
        <Tile hot label="Datasets"><CountUp to={DATASETS.length} /></Tile>
        <Tile label="Experiments"><CountUp to={DATASETS.reduce((a, d) => a + d.experiments, 0)} /></Tile>
        <Tile label="Total rows"><CountUp to={DATASETS.reduce((a, d) => a + d.rows, 0)} /></Tile>
        <Tile label="Best accuracy">{DATASETS.length > 0 ? <CountUp to={96.67} decimals={2} suffix="%" /> : '—'}</Tile>
      </motion.div>

      {/* Upload zone */}
      <Card className={`ab-upload ${drag}`} onDragOver={e => { e.preventDefault(); setDrag('over') }} onDragLeave={() => setDrag('idle')} onDrop={onDrop}>
        <div className="ds-ic"><Upload size={20} /></div>
        <div>
          <b className="ab-h">{drag === 'over' ? 'Drop it here' : drag === 'bad' ? 'That isn’t a CSV file' : DATASETS.length === 0 ? 'Upload your first dataset' : 'Upload a new dataset'}</b>
          <div className="ab-lbl">{drag === 'bad' ? 'Only .csv files are supported' : 'Drag &amp; drop a CSV · Any size · Auto-preprocessed'}</div>
        </div>
        <Link href="/experiments" className="ab-btn dark fit"><Plus size={16} /> New experiment</Link>
      </Card>

      {/* Search + filter — only useful once there's data to search through */}
      {!loading && DATASETS.length > 0 && (
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

      {/* Skeletons / empty states / cards */}
      {loading ? (
        <div className="ds-grid">
          {[0, 1, 2].map(i => <div key={i} className="ab-card"><div className="ab-skel" style={{ height: 220, marginTop: 0 }} /></div>)}
        </div>
      ) : DATASETS.length === 0 ? (
        <Empty title="No datasets yet" text="Upload your first CSV to start training models and comparing results." href="/experiments" cta="Upload your first dataset" />
      ) : list_.length === 0 ? (
        <Card className="ab-empty">
          <b>No datasets found</b>
          <p className="ab-lbl">Try a different search term or filter.</p>
        </Card>
      ) : (
        <motion.div className="ds-grid" variants={list} initial="hidden" animate="show">
          {list_.map(d => (
            <motion.div key={d.name} className="ab-card ds" variants={rise} whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 400, damping: 26 }}>
              <div className="ds-ic"><FileSpreadsheet size={20} /></div>
              <div>
                <div className="ds-name">{d.name}</div>
                <div className="ab-lbl">target → <b style={{ color: 'var(--ab-acc)' }}>{d.target}</b></div>
              </div>

              <div className="ds-two">
                <div className="ab-mini"><b>{d.rows.toLocaleString()}</b><small style={{ margin: 0 }}>Rows</small></div>
                <div className="ab-mini"><b>{d.cols}</b><small style={{ margin: 0 }}>Columns</small></div>
              </div>

              <div>
                <div className="ab-row ab-lbl" style={{ fontSize: 11, marginBottom: 5 }}>
                  <span># {d.numeric} numeric</span><span>Aa {d.categorical} categorical</span>
                </div>
                <div className="ds-comp">
                  <div className="dk" style={{ width: `${d.numeric / d.cols * 100}%` }} />
                  <div className="hz" style={{ width: `${d.categorical / d.cols * 100}%` }} />
                </div>
              </div>

              <div className="ds-foot">
                <span className={`ab-chip ${d.task === 'Classification' ? 'dk' : 'hz'}`}>{d.task}</span>
                <Link href="/experiments" className="ab-link">Use <ArrowRight size={13} style={{ verticalAlign: -2 }} /></Link>
              </div>

              <div className="ds-meta">
                <span>{d.uploaded} · {d.size}</span>
                {d.experiments > 0
                  ? <span>{d.experiments} runs · best <b>{d.bestScore}</b></span>
                  : <span>No runs yet</span>}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </Page>
  )
}