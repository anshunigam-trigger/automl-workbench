'use client'

import { CLS_MODELS, REG_MODELS } from '@/lib/constants'

export default function ResultsStep({ results, rows, features, task, target, onRetry, onReset }) {
  const models  = task === 'classification' ? CLS_MODELS : REG_MODELS
  const sortKey = task === 'classification' ? 'accuracy' : 'r2'
  const best    = results[0]
  const second  = results[1]

  const getName = id => models.find(m => m.id === id)?.name ?? id

  const pct = (val) => `${(val * 100).toFixed(2)}%`

  const bestScore = sortKey === 'accuracy'
    ? pct(best?.accuracy)
    : pct(best?.r2)

  const diff = sortKey === 'accuracy'
    ? pct((best?.accuracy - second?.accuracy))
    : pct((best?.r2 - second?.r2))

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">
            <span className="card-title-icon">🏆</span>
            Experiment Results
          </div>
          <div className="card-sub">
            Leaderboard sorted by {sortKey === 'accuracy' ? 'Accuracy' : 'R²'} · Target:{' '}
            <b style={{ color: 'var(--primary)' }}>{target}</b>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-box">
          <div className="stat-val">{rows.toLocaleString()}</div>
          <div className="stat-lbl">Total rows</div>
        </div>
        <div className="stat-box">
          <div className="stat-val">{features.length}</div>
          <div className="stat-lbl">Features</div>
        </div>
        <div className="stat-box">
          <div className="stat-val">{results.length}</div>
          <div className="stat-lbl">Algorithms</div>
        </div>
        <div className="stat-box">
          <div className="stat-val" style={{ textTransform: 'capitalize' }}>{task}</div>
          <div className="stat-lbl">Task type</div>
        </div>
        <div className="stat-box">
          <div className="stat-val" style={{ color: 'var(--success)' }}>{bestScore}</div>
          <div className="stat-lbl">Best score</div>
        </div>
      </div>

      {/* Classification leaderboard */}
      {task === 'classification' && (
        <>
          <div className="lb-header cls-grid">
            <span>Algorithm</span>
            <span>Accuracy</span>
            <span>F1 Score</span>
            <span className="hide-sm">Precision</span>
            <span className="hide-sm">Recall</span>
            <span>Time</span>
          </div>
          {results.map((r, i) => (
            <div key={r.id} className="lb-row cls-grid">
              <div className="lb-model-col">
                <div className="lb-model-name">
                  {getName(r.id)}
                  {i === 0 && <span className="badge badge-best">BEST</span>}
                  {i === 1 && <span className="badge badge-2nd">RUNNER UP</span>}
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{
                    width: `${r.accuracy * 100}%`,
                    background: i === 0 ? 'var(--success)' : i === 1 ? 'var(--primary)' : 'var(--text3)'
                  }} />
                </div>
              </div>
              <div className={`lb-metric${i === 0 ? ' best' : ''}`}>{pct(r.accuracy)}</div>
              <div className="lb-metric">{pct(r.f1)}</div>
              <div className="lb-metric hide-sm">{pct(r.precision)}</div>
              <div className="lb-metric hide-sm">{pct(r.recall)}</div>
              <div className="lb-time">{r.time}s</div>
            </div>
          ))}
        </>
      )}

      {/* Regression leaderboard */}
      {task === 'regression' && (
        <>
          <div className="lb-header reg-grid">
            <span>Algorithm</span>
            <span>R²</span>
            <span>RMSE</span>
            <span className="hide-sm">MAE</span>
            <span>Time</span>
          </div>
          {results.map((r, i) => (
            <div key={r.id} className="lb-row reg-grid">
              <div className="lb-model-col">
                <div className="lb-model-name">
                  {getName(r.id)}
                  {i === 0 && <span className="badge badge-best">BEST</span>}
                  {i === 1 && <span className="badge badge-2nd">RUNNER UP</span>}
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{
                    width: `${Math.max(0, r.r2) * 100}%`,
                    background: i === 0 ? 'var(--success)' : i === 1 ? 'var(--primary)' : 'var(--text3)'
                  }} />
                </div>
              </div>
              <div className={`lb-metric${i === 0 ? ' best' : ''}`}>{pct(r.r2)}</div>
              <div className="lb-metric">{r.rmse}</div>
              <div className="lb-metric hide-sm">{r.mae}</div>
              <div className="lb-time">{r.time}s</div>
            </div>
          ))}
        </>
      )}

      {/* Insight */}
      <div className="insight-box">
        <strong>{getName(best?.id)}</strong> is the best performing algorithm on this dataset
        with a {sortKey === 'accuracy' ? `accuracy of ${pct(best?.accuracy)}` : `R² of ${pct(best?.r2)}`}.
        {second && (
          <> It outperformed <strong>{getName(second?.id)}</strong> by <strong>{diff}</strong>.</>
        )}
        {' '}Consider hyperparameter tuning or feature engineering to improve results further.
      </div>

      <div className="btn-row">
        <button className="btn" onClick={onRetry}>← Try different algorithms</button>
        <button className="btn primary" onClick={onReset}>↺ New Experiment</button>
      </div>
    </div>
  )
}
