'use client'

import Link from 'next/link'

const STATS = {
  totalExperiments: 142,
  runningNow:        2,
  datasetsUsed:      6,
  modelsTrained:    12,
  bestAccuracy:      '81.55%',
  phasesComplete:    1,
  overallProgress:   20,
}

const RUNNING = [
  { id: 'EXP-901', name: 'customer_churn_v2 fine-tune', progress: 65 },
  { id: 'EXP-902', name: 'fraud_detection retrain',      progress: 82 },
  { id: 'EXP-903', name: 'housing_prices grid search',   progress: 20 },
]

const RECENT = [
  { name: 'Customer Churn Prediction', status: 'success', accuracy: '81.55%', when: '2h ago'    },
  { name: 'Product Recommendation',    status: 'running', accuracy: '—',      when: '10m ago'   },
  { name: 'Sales Forecasting Q4',      status: 'success', accuracy: 'R² 0.94',when: '1d ago'    },
  { name: 'Image Classification NLP',  status: 'warning', accuracy: '81.50%', when: '2d ago'    },
]

const ACTIVITY = [
  { icon: '✅', text: 'Model trained: Churn v2',       who: 'You',      when: '10m ago' },
  { icon: '📤', text: 'Dataset uploaded: fraud_v3.csv', who: 'You',      when: '1h ago'  },
  { icon: '🚀', text: 'Started EXP-903',                who: 'You',      when: '3h ago'  },
  { icon: '⬇',  text: 'Downloaded LightGBM model',      who: 'You',      when: 'Yesterday' },
]

export default function DashboardPage() {
  return (
    <div className="page-content">

      {/* Greeting */}
      <div className='page-header fade-up'>
            <div className='breadcrumb'>Workspace <span>,</span> Dashboard</div>
            <div className='page-title'>
                Good morning, <span className='grad'>ANSHU.</span>
            </div>
            <div className='page-sub'>
                Your workspace is healthy. AutoBench v1.0.0 · Phase 1 Complete · 6 features shipped.
            </div>
      </div>

      {/* Quick Actions */}
      <div className='fade-up-1' style = {{
            display: 'flex', gap: 10, marginButtom: 28, flexWrap: 'wrap'
            }}>
            <Link href="/" className='btn primary'>
            + New Experiment
            </Link>
            <Link href="/datasets" className='btn'>
            ⬆ Upload Dataset
            </Link>
            <Link href="/models" className='btn'>
            🧠 View Models
            </Link>
            <Link href="/reports" className="btn">
            📊 Reports
            </Link>
      </div>

      {/* KPI STATS */}
      <div className='stats-bar fade-up-2' style={{ marginTop: 10}}>
        <div className='stat-box'>
          <div className='stat-val'>{STATS.totalExperiments}</div>
          <div className="stat-lbl">Total Experiments</div>
        </div>
        <div className='stat-box'>
          <div className='stat-val' style={{ color: 'var(--sky)' }}>{STATS.runningNow}</div>
          <div className="stat-lbl">Running Now</div>
        </div>
        <div className='stat-box'>
          <div className='stat-val'>{STATS.datasetsUsed}</div>
          <div className="stat-lbl">Datasets Used</div>
        </div>
        <div className='stat-box'>
          <div className='stat-val'>{STATS.modelsTrained}</div>
          <div className="stat-lbl">Models Trained</div>
        </div>
        <div className="stat-box">
          <div className="stat-val" style={{ color: 'var(--teal)' }}>{STATS.bestAccuracy}</div>
          <div className="stat-lbl">Best Accuracy</div>
        </div>
      </div>

      
      {/* ── Recent + Running (2-column) ── */}
      <div className="fade-up-3" style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20
      }}>

      {/* Recent Experiments */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div>
              <div className="card-title">
                <span className="card-title-icon">📋</span>
                Recent Experiments
              </div>
              <div className="card-sub">Your last 4 completed runs</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {RECENT.map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0', borderBottom: i < RECENT.length - 1 ? '1px solid var(--border)' : 'none'
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>
                    {r.name}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                    {r.when}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700,
                    color: r.status === 'success' ? 'var(--teal)' : r.status === 'running' ? 'var(--sky)' : 'var(--amber)',
                  }}>
                    {r.accuracy}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Running Experiments */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div>
              <div className="card-title">
                <span className="card-title-icon">⚡</span>
                Running Experiments
              </div>
              <div className="card-sub">{RUNNING.length} active right now</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {RUNNING.map((r, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{r.name}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--sky)' }}>{r.progress}%</span>
                </div>
                <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${r.progress}%`,
                    background: 'linear-gradient(90deg, var(--sky), var(--violet))',
                    borderRadius: 3, transition: 'width .3s'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Activity Feed + System Health ── */}
      <div className="fade-up-4" style={{
        display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14
      }}>

      {/* Activity Feed */}
      <div className="card" style={{ marginBottom: 0 }}>
        <div className="card-header">
          <div>
            <div className="card-title">
              <span className="card-title-icon">🔔</span>
              Activity Feed
            </div>
            <div className="card-sub">Recent actions across your workspace</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ACTIVITY.map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0', borderBottom: i < ACTIVITY.length - 1 ? '1px solid var(--border)' : 'none'
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--surface2)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, flexShrink: 0
              }}>
                {a.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--text)' }}>{a.text}</div>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>
                {a.when}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Health */}
      <div className="card" style={{ marginBottom: 0 }}>
        <div className="card-header">
          <div>
            <div className="card-title">
              <span className="card-title-icon">💚</span>
              System Health
            </div>
            <div className="card-sub">All systems operational</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Backend API', status: 'Operational', color: 'var(--teal)' },
            { label: 'ML Training Engine', status: 'Operational', color: 'var(--teal)' },
            { label: 'Phase Progress', status: `${STATS.overallProgress}% complete`, color: 'var(--sky)' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: s.color, boxShadow: `0 0 6px ${s.color}88`
                }} />
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>{s.label}</span>
              </div>
              <span style={{ fontSize: 11, color: s.color, fontFamily: 'var(--mono)', fontWeight: 600 }}>
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
      

    </div>
  )
}