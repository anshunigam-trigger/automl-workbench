'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useExperiments } from '@/lib/useExperiments'
import { checkHealth } from '@/lib/api'
import { timeAgo, formatScore, modelName } from '@/lib/format'
import Stat from '@/components/Stat'

function Stat({ label, value, color, loading }) {
  return (
    <div className="stat-box">
      {loading
        ? <div className="skeleton" style={{ width: 60, height: 22, marginBottom: 6 }} />
        : <div className="stat-val" style={color ? { color } : undefined}>{value}</div>}
      <div className="stat-lbl">{label}</div>
    </div>
  )
}

export default function DashboardPage() {
  const { experiments, loading, error } = useExperiments()
  const [apiUp, setApiUp]       = useState(null)
  const [greeting, setGreeting] = useState('Welcome back')

  useEffect(() => {
    checkHealth().then(setApiUp)
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening')
  }, [])

  // ── Everything below is DERIVED from `experiments` ──
  const total         = experiments.length
  const datasetCount  = new Set(experiments.map(e => e.dataset)).size
  const modelsTrained = experiments.reduce((sum, e) => sum + e.results.length, 0)

  const topModels = experiments
    .filter(e => e.task === 'classification' && e.best)
    .map(e => ({
      name:    modelName(e.best.id, e.task),
      dataset: e.dataset,
      score:   e.best.accuracy,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  const bestAccuracy = topModels.length
    ? `${(topModels[0].score * 100).toFixed(2)}%`
    : '—'

  const health = [
    {
      label: 'Backend API',
      value: apiUp === null ? 'Checking…' : apiUp ? 'Operational' : 'Unreachable',
      color: apiUp === null ? 'var(--text2)' : apiUp ? 'var(--teal)' : 'var(--danger)',
    },
    {
      label: 'Database',
      value: loading || error ? '—' : `${total} experiment${total === 1 ? '' : 's'} saved`,
      color: 'var(--sky)',
    },
    { label: 'Roadmap', value: 'Phase 1 complete', color: 'var(--violet)' },
  ]

  return (
    <div className="page-content">

      {/* Greeting */}
      <div className="page-header fade-up">
        <div className="breadcrumb">Workspace <span>›</span> Dashboard</div>
        <div className="page-title">
          {greeting}, <span className="grad">Anshu.</span>
        </div>
        <div className="page-sub">
          Everything on this page comes from your saved experiments.
        </div>
      </div>

      {/* Quick actions */}
      <div className="fade-up-1" style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        <Link href="/experiments" className="btn primary">+ New Experiment</Link>
        <Link href="/datasets" className="btn">⬆ Upload Dataset</Link>
        <Link href="/models" className="btn">🧠 View Models</Link>
        <Link href="/reports" className="btn">📊 Reports</Link>
      </div>

      {error && <div className="error-bar">⚠ &nbsp;{error}</div>}

      {/* KPI stats */}
      <div className="stats-bar fade-up-2">
        <Stat label="Experiments"    value={total}         loading={loading} />
        <Stat label="Datasets"       value={datasetCount}  loading={loading} />
        <Stat label="Models Trained" value={modelsTrained} loading={loading} />
        <Stat label="Best Accuracy"  value={bestAccuracy}  loading={loading} color="var(--teal)" />
      </div>

      {/* Empty state */}
      {!loading && !error && total === 0 && (
        <div className="card fade-up-3" style={{ textAlign: 'center', padding: '56px 24px', borderStyle: 'dashed' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🧪</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No experiments yet</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
            Run your first experiment and it will show up here.
          </div>
          <Link href="/experiments" className="btn primary">+ Run your first experiment</Link>
        </div>
      )}

      {/* Recent experiments + Top models */}
      {(loading || total > 0) && (
        <div className="dash-grid fade-up-3">

          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <div>
                <div className="card-title"><span className="card-title-icon">📋</span>Recent Experiments</div>
                <div className="card-sub">Your latest runs</div>
              </div>
            </div>

            {loading
              ? [0, 1, 2].map(i => (
                  <div key={i} className="skeleton" style={{ height: 38, marginBottom: 10 }} />
                ))
              : experiments.slice(0, 5).map((e, i, arr) => (
                  <div key={e.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>
                        {e.dataset}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                        {e.best ? modelName(e.best.id, e.task) : 'No results'} · {timeAgo(e.created_at)}
                      </div>
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: 'var(--teal)' }}>
                      {formatScore(e.best, e.task)}
                    </div>
                  </div>
                ))}
          </div>

          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <div>
                <div className="card-title"><span className="card-title-icon">🏆</span>Top Models</div>
                <div className="card-sub">Best classification scores across all experiments</div>
              </div>
            </div>

            {loading
              ? [0, 1, 2].map(i => (
                  <div key={i} className="skeleton" style={{ height: 38, marginBottom: 10 }} />
                ))
              : topModels.length === 0
              ? <div style={{ fontSize: 12, color: 'var(--text3)' }}>No classification experiments yet.</div>
              : topModels.map((m, i) => (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: 'var(--text)' }}>
                        {m.name} <span style={{ color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 10 }}>· {m.dataset}</span>
                      </span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--teal)' }}>
                        {(m.score * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${m.score * 100}%`, background: 'var(--teal)', borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
          </div>
        </div>
      )}

      {/* System health */}
      <div className="card fade-up-4">
        <div className="card-header">
          <div>
            <div className="card-title"><span className="card-title-icon">💚</span>System Health</div>
            <div className="card-sub">Live status of the platform</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {health.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, boxShadow: `0 0 6px ${s.color}88` }} />
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>{s.label}</span>
              </div>
              <span style={{ fontSize: 11, fontFamily: 'var(--mono)', fontWeight: 600, color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}