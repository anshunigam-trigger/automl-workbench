'use client'

import { useState } from 'react'
import { LOG_LINES } from '@/lib/constants'

const TABS = [
  { id: 'upload',  label: '01 · UPLOAD'  },
  { id: 'train',   label: '02 · TRAIN'   },
  { id: 'compare', label: '03 · COMPARE' },
]

const CSV_COLUMNS = ['customerID', 'tenure', 'Contract', 'MonthlyCharges', 'Churn']
const CSV_ROWS = [
  ['7590-VHVEG', '1',  'Month-to-month', '29.85', 'No'],
  ['5575-GNVDE', '34', 'One year',       '56.95', 'No'],
  ['3668-QPYBK', '2',  'Month-to-month', '53.85', 'Yes'],
]

// Reuses the exact log lines the real wizard shows during training
const TRAIN_LOG = [
  ...LOG_LINES,
  { text: '[RUN]  Training Logistic Regression...',          tag: 'run' },
  { text: '[RUN]  Training Random Forest...',                tag: 'run' },
  { text: '[RUN]  Training XGBoost...',                      tag: 'run' },
  { text: '[OK]   All models evaluated. Leaderboard ready.', tag: 'ok'  },
]

// A real AutoBench run on the Telecom churn dataset
const LEADERBOARD = [
  { name: 'Logistic Regression', score: 81.55, time: '0.03s' },
  { name: 'XGBoost',             score: 79.42, time: '4.04s' },
  { name: 'Random Forest',       score: 79.21, time: '0.81s' },
  { name: 'Decision Tree',       score: 73.31, time: '0.04s' },
]

const STATUS = {
  upload:  ['telecom_churn.csv · 7,043 rows · 21 columns', 'target: Churn'],
  train:   ['7,043 rows · 19 features after cleaning',      'classification'],
  compare: ['sorted by accuracy',                           '4 models compared'],
}

export default function HeroDemo() {
  const [tab, setTab] = useState('upload')

  return (
    <div className="lp-demo">

      <div className="lp-demo-tabs" role="tablist" aria-label="How AutoBench works">
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`lp-demo-tab${tab === t.id ? ' on' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* key={tab} makes React remount the panel, so its fade-in replays on every switch */}
      <div className="lp-demo-body lp-panel" role="tabpanel" key={tab}>

        {tab === 'upload' && (
          <>
            <div className="table-wrap">
              <table className="preview-table">
                <thead>
                  <tr>{CSV_COLUMNS.map(c => <th key={c}>{c}</th>)}</tr>
                </thead>
                <tbody>
                  {CSV_ROWS.map((row, i) => (
                    <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="lp-demo-note">
              Drop in any CSV. Pick the column you want to predict (<b>Churn</b>) and whether it's
              a category or a number. AutoBench handles everything else.
            </div>
          </>
        )}

        {tab === 'train' && (
          <div className="lp-log">
            {TRAIN_LOG.map((line, i) => (
              <div key={i} className="log-line">
                <span className="log-ts">{String(i).padStart(2, '0')}</span>
                <span className={`log-text ${line.tag}`}>{line.text}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'compare' && (
          <>
            {LEADERBOARD.map((m, i) => (
              <div key={m.name} className="lp-lb-row">
                <span className="lp-lb-rank">{i + 1}</span>
                <div>
                  <div className="lp-lb-name">
                    {m.name} {i === 0 && <span className="badge badge-best">BEST</span>}
                  </div>
                  <div className="lp-lb-track">
                    <div className={`lp-lb-fill${i === 0 ? ' top' : ''}`} style={{ width: `${m.score}%` }} />
                  </div>
                </div>
                <span className={`lp-lb-score${i === 0 ? ' top' : ''}`}>{m.score.toFixed(2)}%</span>
                <span className="lp-lb-time">{m.time}</span>
              </div>
            ))}
            <div className="lp-demo-note">
              Logistic Regression was both the most accurate <b>and</b> the fastest. The biggest
              model isn't always the best one, and AutoBench shows you that in seconds.
            </div>
          </>
        )}
      </div>

      <div className="lp-demo-status">
        <span>{STATUS[tab][0]}</span>
        <span>{STATUS[tab][1]}</span>
      </div>
    </div>
  )
}