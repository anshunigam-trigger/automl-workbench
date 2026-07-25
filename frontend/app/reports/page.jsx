'use client'

import Link from 'next/link'

const PROJECT_SUMMARY = {
  totalExperiments: 142,
  datasetsUsed:     34,
  modelsTrained:    89,
  bestAccuracy:     '99.10%',
  bestModel:        'LightGBM',
  bestDataset:      'fraud_detection',
}

const PHASES = [
  {
    n: 1, title: 'Core AutoML', status: 'done', color: '#2DD4BF',
    items: [
      { label: 'CSV upload with drag & drop',       done: true  },
      { label: 'Auto preprocessing pipeline',       done: true  },
      { label: '12 algorithm comparison',           done: true  },
      { label: 'Real leaderboard with metrics',     done: true  },
      { label: 'Professional Next.js frontend',     done: true  },
      { label: 'Sidebar + responsive layout',       done: true  },
    ]
  },
  {
    n: 2, title: 'Data Intelligence', status: 'active', color: '#38BDF8',
    items: [
      { label: 'Data profiling report per column',  done: false },
      { label: 'Feature correlation heatmap',       done: false },
      { label: 'Class imbalance detection',         done: false },
      { label: 'Outlier detection visualization',   done: false },
      { label: 'Distribution plots per feature',    done: false },
    ]
  },
  {
    n: 3, title: 'Advanced ML', status: 'upcoming', color: '#A78BFA',
    items: [
      { label: 'Feature importance chart',          done: false },
      { label: 'Confusion matrix visualization',    done: false },
      { label: 'ROC / AUC curve comparison',        done: false },
      { label: 'Hyperparameter tuning (Optuna)',     done: false },
      { label: 'Download trained model (.pkl)',      done: false },
      { label: 'SHAP model explainability',         done: false },
    ]
  },
  {
    n: 4, title: 'AI-Powered', status: 'upcoming', color: '#F472B6',
    items: [
      { label: 'AI Experiment Advisor (Claude)',     done: false },
      { label: 'Natural language query',            done: false },
      { label: 'Auto report generator',             done: false },
      { label: 'Dataset health score',              done: false },
    ]
  },
  {
    n: 5, title: 'Platform Features', status: 'upcoming', color: '#FBBF24',
    items: [
      { label: 'Live model race (WebSocket)',        done: false },
      { label: 'What-If simulator',                 done: false },
      { label: 'Share experiment link',             done: false },
      { label: 'Experiment history (SQLite)',        done: false },
    ]
  },
  {
    n: 6, title: 'Production', status: 'upcoming', color: '#EF4444',
    items: [
      { label: 'User authentication (NextAuth.js)', done: false },
      { label: 'PostgreSQL + SQLAlchemy',            done: false },
      { label: 'Docker containerization',           done: false },
      { label: 'Deploy on Render + Vercel',          done: false },
      { label: 'Stripe payments (SaaS)',             done: false },
    ]
  },
]

const TOTAL   = PHASES.reduce((a, p) => a + p.items.length, 0)
const DONE    = PHASES.reduce((a, p) => a + p.items.filter(i => i.done).length, 0)
const OVERALL = Math.round(DONE / TOTAL * 100)

export default function ReportsPage() {
  return (
    <>
       
       < div className="page-content">

      {/* Page Header */}
      <div className="page-header fade-up">
        <div className="breadcrumb">Reports</div>
        <div className="page-title">
          <span className="grad">Project Roadmap</span>
        </div>
        <div className="page-sub">
          Track AutoBench development progress across all 6 phases.
        </div>
      </div>

      {/* Stat boxes */}
      <div className="stats-bar fade-up-1">
        <div className="stat-box">
            <div className="stat-val" style={{ color: 'var(--teal)' }}>{DONE}</div>
            <div className="stat-lbl">Completed</div>
        </div>
        <div className="stat-box">
            <div className="stat-val">{TOTAL - DONE}</div>
            <div className="stat-lbl">Remaining</div>
        </div>
        <div className="stat-box">
            <div className="stat-val">{PHASES.length}</div>
            <div className="stat-lbl">Phases</div>
        </div>
        <div className="stat-box">
            <div className="stat-val" style={{ color: 'var(--sky)' }}>{OVERALL}%</div>
            <div className="stat-lbl">Overall Progress</div>
        </div>
      </div>

      {/* Section 1 — Project Summary */}
        <div className="card fade-up-2">
        <div className="card-header">
            <div>
            <div className="card-title">
                <span className="card-title-icon">📈</span>
                Project Summary
            </div>
            <div className="card-sub">AutoBench lifetime stats</div>
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>

            <div style={{ padding: '14px 16px', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text)', lineHeight: 1 }}>
                {PROJECT_SUMMARY.totalExperiments}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '.07em' }}>
                Experiments Run
            </div>
            </div>

            <div style={{ padding: '14px 16px', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text)', lineHeight: 1 }}>
                {PROJECT_SUMMARY.datasetsUsed}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '.07em' }}>
                Datasets Used
            </div>
            </div>

            <div style={{ padding: '14px 16px', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text)', lineHeight: 1 }}>
                {PROJECT_SUMMARY.modelsTrained}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '.07em' }}>
                Models Trained
            </div>
        </div>

        </div>
    </div>


  {/* Best achievement highlight */}
    <div style={{
            marginTop: 14, padding: '14px 16px',
            background: 'var(--teal-dim)', border: '1px solid var(--teal-glow)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
    <div>

    <div style={{ fontSize: 10, color: 'var(--teal)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>
        🏆 Best Accuracy Ever
    </div>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>
            {PROJECT_SUMMARY.bestModel} on{' '}
            <span style={{ fontFamily: 'var(--mono)', color: 'var(--text)' }}>
            {PROJECT_SUMMARY.bestDataset}
            </span>
        </div>
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--teal)' }}>
        {PROJECT_SUMMARY.bestAccuracy}
        </div>
    </div>
    </div>
  

   {/* Section 2 — Roadmap Tracker */}
    <div className="card fade-up-3" style={{ margin: 50 }}>
        <div style={{ marginBottom: 16 }}>
            <div className="card-title" style={{ fontSize: 14, marginBottom: 4 }}>
            <span className="card-title-icon">🗺️</span>
            Roadmap Tracker
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>
            {OVERALL}% complete — Phase 1 shipped
            </div>
        </div>

        {/* Overall progress bar */}
        <div style={{ marginBottom: 20 }}>
            <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 11, color: 'var(--text3)',
            fontFamily: 'var(--mono)', marginBottom: 6
            }}>
            <span>{DONE} features done</span>
            <span style={{ color: 'var(--sky)' }}>{OVERALL}%</span>
            </div>
            <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
                height: '100%', borderRadius: 3,
                width: `${OVERALL}%`,
                background: 'linear-gradient(90deg, var(--sky), var(--violet), var(--teal))',
            }} />
            </div>
        </div>

        {/* Phase cards — 3 columns */}
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12
        }}>
            {PHASES.map(phase => {
            const phaseDone = phase.items.filter(x => x.done).length
            const phasePct  = Math.round(phaseDone / phase.items.length * 100)
            return (
                <div key={phase.n} style={{
                background: 'rgba(13,21,38,.9)',
                border: '1px solid var(--border)',
                borderRadius: 12, padding: 16,
                position: 'relative', overflow: 'hidden',
                transition: 'border-color .2s, transform .2s',
                }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: phase.color }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
                    background: phase.color + '22', color: phase.color,
                    border: `1px solid ${phase.color}44`, flexShrink: 0
                    }}>
                    {phase.n}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', flex: 1 }}>
                    {phase.title}
                    </div>
                    <div style={{
                    fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 700,
                    padding: '2px 6px', borderRadius: 99,
                    background: phase.color + '15', color: phase.color,
                    border: `1px solid ${phase.color}30`
                    }}>
                    {phase.status === 'done' ? '✓' : phase.status === 'active' ? '⟳' : '○'}
                    </div>
                </div>

                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 9, color: 'var(--text3)',
                    fontFamily: 'var(--mono)', marginBottom: 4
                }}>
                    <span>{phaseDone}/{phase.items.length}</span>
                    <span style={{ color: phase.color }}>{phasePct}%</span>
                </div>
                <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginBottom: 12 }}>
                    <div style={{ height: '100%', borderRadius: 2, width: `${phasePct}%`, background: phase.color }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {phase.items.map((item, j) => (
                        <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11 }}>
                            <div style={{
                            width: 13, height: 13, borderRadius: 3, flexShrink: 0,
                            border: `1px solid ${item.done ? phase.color : 'var(--border2)'}`,
                            background: item.done ? phase.color : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 8, color: 'var(--bg)', fontWeight: 700
                            }}>
                            {item.done ? '✓' : ''}
                            </div>
                            <span style={{ color: item.done ? 'var(--text)' : 'var(--text3)', lineHeight: 1.4 }}>
                            {item.label}
                            </span>
                        </div>
                        ))}
                </div>
                </div>
            )
            })}
        </div>
        </div>
    
    </>
    
    )
}