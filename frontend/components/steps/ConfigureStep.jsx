'use client'

import { guessNumeric } from '@/lib/parseCSV'

export default function ConfigureStep({ file, columns, preview, target, task, onTarget, onTask, onBack, onNext }) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">
            <span className="card-title-icon">🎯</span>
            Configure Experiment
          </div>
          <div className="card-sub">Set your prediction target and task type</div>
        </div>
        {file && (
          <div className="file-chip">
            <span style={{ fontSize: 16 }}>📄</span>
            <span className="file-chip-name">{file.name}</span>
            <span className="file-chip-meta">· {columns.length} columns</span>
          </div>
        )}
      </div>

      <div className="form-2col">
        <div className="form-group">
          <label>Target Column — what to predict</label>
          <select value={target} onChange={e => onTarget(e.target.value)}>
            {columns.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Task Type</label>
          <select value={task} onChange={e => onTask(e.target.value)}>
            <option value="classification">Classification — predict a category</option>
            <option value="regression">Regression — predict a number</option>
          </select>
        </div>
      </div>

      {preview.length > 0 && (
        <>
          <div className="section-label" style={{ marginBottom: 10 }}>Data Preview — first 5 rows</div>
          <div className="table-wrap">
            <table className="preview-table">
              <thead>
                <tr>
                  {columns.slice(0, 7).map(c => <th key={c}>{c}</th>)}
                  {columns.length > 7 && <th>+{columns.length - 7} more</th>}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i}>
                    {columns.slice(0, 7).map(c => <td key={c}>{row[c] ?? '—'}</td>)}
                    {columns.length > 7 && <td style={{ color: 'var(--text3)' }}>…</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="section-label" style={{ marginTop: 18, marginBottom: 10 }}>
        All Columns — click any to set as target
      </div>
      <div className="col-grid">
        {columns.map(c => (
          <span
            key={c}
            className={`col-chip${c === target ? ' target' : guessNumeric(c, preview) ? ' numeric' : ''}`}
            onClick={() => onTarget(c)}
          >
            {c === target ? '◎ ' : guessNumeric(c, preview) ? '# ' : ''}{c}
          </span>
        ))}
      </div>

      <div className="btn-row">
        <button className="btn" onClick={onBack}>← Back</button>
        <button className="btn primary" onClick={onNext}>Select Algorithms →</button>
      </div>
    </div>
  )
}
