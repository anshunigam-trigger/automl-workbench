'use client'

import { useEffect, useRef } from 'react'

export default function TrainingStep({ logs, progress, modelCount, fileName }) {
  const logRef = useRef(null)

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">
            <span className="card-title-icon">⚙️</span>
            Training in Progress
          </div>
          <div className="card-sub">
            Running {modelCount} algorithm{modelCount !== 1 ? 's' : ''} on <b>{fileName}</b>
          </div>
        </div>
      </div>

      <div className="progress-wrap">
        <div className="progress-meta">
          <b>Progress</b>
          <span>{progress}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="train-log" ref={logRef}>
        {logs.map((line, i) => (
          <div key={i} className="log-line">
            <span className="log-ts">{String(i).padStart(2, '0')}</span>
            <span className={`log-text ${line.tag}`}>{line.text}</span>
          </div>
        ))}
        <div className="log-line">
          <span className="log-ts">--</span>
          <span className="log-cursor">█</span>
        </div>
      </div>
    </div>
  )
}
