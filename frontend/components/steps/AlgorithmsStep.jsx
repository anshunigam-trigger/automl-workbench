'use client'

import { CLS_MODELS, REG_MODELS } from '@/lib/constants'

export default function AlgorithmsStep({ task, target, selected, onToggle, onBack, onRun, loading }) {
  const models = task === 'classification' ? CLS_MODELS : REG_MODELS
  const allSelected = selected.length === models.length

  const handleSelectAll = () => {
    if (allSelected) {
      models.forEach(m => { if (selected.includes(m.id)) onToggle(m.id) })
    } else {
      models.forEach(m => { if (!selected.includes(m.id)) onToggle(m.id) })
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">
            <span className="card-title-icon">🧠</span>
            Select Algorithms
          </div>
          <div className="card-sub">
            {task === 'classification' ? 'Classification' : 'Regression'} · Target:{' '}
            <b style={{ color: 'var(--primary)' }}>{target}</b>
          </div>
        </div>
      </div>

      <div className="select-ctrl">
        <span className="select-label">{selected.length} of {models.length} selected</span>
        <button className="select-all-btn" onClick={handleSelectAll}>
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
      </div>

      <div className="algo-grid">
        {models.map(m => (
          <div
            key={m.id}
            className={`algo-card${selected.includes(m.id) ? ' selected' : ''}`}
            onClick={() => onToggle(m.id)}
          >
            <div className="algo-tag">{m.tag}</div>
            <div className="algo-name">{m.name}</div>
            <div className="algo-desc">{m.desc}</div>
            <div className="algo-check">{selected.includes(m.id) ? '✓' : ''}</div>
          </div>
        ))}
      </div>

      <div className="btn-row">
        <button className="btn" onClick={onBack} disabled={loading}>← Back</button>
        <button
          className="btn primary"
          onClick={onRun}
          disabled={selected.length === 0 || loading}
        >
          {loading
            ? '⟳ Training...'
            : `▶ Run ${selected.length} Algorithm${selected.length !== 1 ? 's' : ''}`
          }
        </button>
      </div>
    </div>
  )
}
