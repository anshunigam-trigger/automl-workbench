'use client'

import { useState }        from 'react'
import Stepper             from '@/components/Stepper'
import UploadStep          from '@/components/steps/UploadStep'
import ConfigureStep       from '@/components/steps/ConfigureStep'
import AlgorithmsStep      from '@/components/steps/AlgorithmsStep'
import TrainingStep        from '@/components/steps/TrainingStep'
import ResultsStep         from '@/components/steps/ResultsStep'
import { parseCSV }        from '@/lib/parseCSV'
import { trainModels }     from '@/lib/api'
import { LOG_LINES, CLS_MODELS, REG_MODELS } from '@/lib/constants'

const delay = ms => new Promise(r => setTimeout(r, ms))

export default function HomePage() {
  const [step,     setStep]     = useState(1)
  const [error,    setError]    = useState('')
  const [file,     setFile]     = useState(null)
  const [columns,  setColumns]  = useState([])
  const [preview,  setPreview]  = useState([])
  const [target,   setTarget]   = useState('')
  const [task,     setTask]     = useState('classification')
  const [selected, setSelected] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [logs,     setLogs]     = useState([])
  const [progress, setProgress] = useState(0)
  const [results,  setResults]  = useState(null)
  const [rows,     setRows]     = useState(0)
  const [features, setFeatures] = useState([])

  const handleFile = (f, err) => {
    if (err) { setError(err); return }
    setError('')
    const reader = new FileReader()
    reader.onload = e => {
      const { headers, rows } = parseCSV(e.target.result)
      setFile(f); setColumns(headers); setPreview(rows)
      setTarget(headers[headers.length - 1])
      setStep(2)
    }
    reader.readAsText(f)
  }

  const handleToggle = id =>
    setSelected(p => p.includes(id) ? p.filter(m => m !== id) : [...p, id])

  const handleTaskChange = t => { setTask(t); setSelected([]) }

  const handleRun = async () => {
    if (!selected.length) { setError('Select at least one algorithm'); return }
    setError(''); setLoading(true); setLogs([]); setProgress(0)
    const models = task === 'classification' ? CLS_MODELS : REG_MODELS
    for (let i = 0; i < LOG_LINES.length; i++) {
      await delay(260)
      setLogs(p => [...p, LOG_LINES[i]])
      setProgress(Math.round((i + 1) / LOG_LINES.length * 50))
    }
    for (let i = 0; i < selected.length; i++) {
      const m = models.find(x => x.id === selected[i])
      await delay(200)
      setLogs(p => [...p, { text: `[RUN]  Training ${m?.name ?? selected[i]}...`, tag: 'run' }])
      setProgress(50 + Math.round((i + 1) / selected.length * 40))
    }
    try {
      const data = await trainModels({ file, target, task, models: selected })
      setProgress(100)
      setLogs(p => [...p, { text: '[OK]   All models evaluated. Leaderboard ready.', tag: 'ok' }])
      await delay(500)
      setResults(data.results); setRows(data.rows); setFeatures(data.features); setStep(4)
    } catch (err) {
      setError(err.message || 'Backend error — make sure FastAPI is running on port 8000.')
    } finally { setLoading(false) }
  }

  const handleRetry = () => { setStep(3); setResults(null); setLogs([]); setProgress(0) }

  const handleReset = () => {
    setStep(1); setFile(null); setColumns([]); setPreview([]); setTarget('')
    setTask('classification'); setSelected([]); setResults(null)
    setRows(0); setFeatures([]); setLogs([]); setProgress(0); setError('')
  }

  const RECENT_EXPERIMENTS = [
  { dataset: 'telecom_churn_v2',       type: 'Binary Classification', status: 'success', statusLabel: 'Success', algorithm: 'Logistic Regression', accuracy: '81.55%', when: '2h ago'    },
  { dataset: 'housing_prices_Q3',      type: 'Regression',            status: 'success', statusLabel: 'Success', algorithm: 'XGBoost Regressor',   accuracy: 'R² 0.94', when: '5h ago'   },
  { dataset: 'sentiment_tweets',       type: 'Multiclass Class.',      status: 'warning', statusLabel: 'Warning', algorithm: 'Random Forest',        accuracy: '81.50%',  when: 'Yesterday'},
  { dataset: 'fraud_detection',        type: 'Binary Classification', status: 'success', statusLabel: 'Success', algorithm: 'LightGBM',             accuracy: '99.10%',  when: 'Yesterday'},
  { dataset: 'customer_churn_v2',      type: 'Binary Classification', status: 'running', statusLabel: 'Running', algorithm: 'Evaluating...',         accuracy: '—',       when: '10m ago'  },
]

 return (
  <div className="page-content">

    {/* ── 1. Hero Section ── */}
    <div className="exp-hero fade-up">
      <div className="exp-hero-text">
        <div className="breadcrumb">Experiments <span>›</span> Dashboard</div>
        <h1 className="exp-hero-title">
          Find the Best Model<br />
          <span className="grad">Before Lunch.</span>
        </h1>
        <p className="exp-hero-sub">
          Upload a dataset once. Automatically benchmark dozens of algorithms. Compare results. Deploy the winner.
        </p>
      </div>
    </div>

    {/* ── 2. KPI Stat Boxes ── */}
    <div className="stats-bar fade-up-1">
      <div className="stat-box">
        <div className="stat-val">142</div>
        <div className="stat-lbl">Recent Exp</div>
      </div>
      <div className="stat-box">
        <div className="stat-val">
          <span style={{ color: 'var(--sky)' }}>8</span>
        </div>
        <div className="stat-lbl">Running Jobs</div>
      </div>
      <div className="stat-box">
        <div className="stat-val">34</div>
        <div className="stat-lbl">Datasets</div>
      </div>
      <div className="stat-box">
        <div className="stat-val" style={{ color: 'var(--teal)' }}>81.55%</div>
        <div className="stat-lbl">Best Accuracy</div>
      </div>
      <div className="stat-box">
        <div className="stat-val">12</div>
        <div className="stat-lbl">Queue</div>
      </div>
    </div>

    {/* ── 3. Recent Experiments Table ── */}
    <div className="card fade-up-2">
      <div className="card-header">
        <div>
          <div className="card-title">
            <span className="card-title-icon">⚗️</span>
            Recent Experiments
          </div>
          <div className="card-sub">Your last 5 training runs</div>
        </div>
        <button className="btn" onClick={handleReset}>
          + New Experiment
        </button>
      </div>

      <div className="table-wrap">
        <table className="preview-table">
          <thead>
            <tr>
              <th>Dataset</th>
              <th>Problem Type</th>
              <th>Status</th>
              <th>Best Algorithm</th>
              <th style={{ textAlign: 'right' }}>Accuracy</th>
              <th style={{ textAlign: 'right' }}>When</th>
            </tr>
          </thead>
          <tbody>
            {RECENT_EXPERIMENTS.map((exp, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500, color: 'var(--text)' }}>
                  📄 {exp.dataset}
                </td>
                <td>{exp.type}</td>
                <td>
                  <span className={`exp-badge exp-badge-${exp.status}`}>
                    {exp.status === 'success' && '✓ '}
                    {exp.status === 'running' && '⟳ '}
                    {exp.status === 'warning' && '⚠ '}
                    {exp.statusLabel}
                  </span>
                </td>
                <td style={{ color: 'var(--text2)' }}>{exp.algorithm}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--teal)' }}>
                  {exp.accuracy}
                </td>
                <td style={{ textAlign: 'right', color: 'var(--text3)' }}>
                  {exp.when}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* ── 4. New Experiment Wizard ── */}
    <div className="card fade-up-3">
      <div className="card-header">
        <div>
          <div className="card-title">
            <span className="card-title-icon">🚀</span>
            New Experiment
          </div>
          <div className="card-sub">
            Upload a dataset and compare ML models in seconds
          </div>
        </div>
      </div>

      <Stepper currentStep={step} />

      {error && <div className="error-bar">⚠ &nbsp;{error}</div>}

      {step === 1 && <UploadStep onFile={handleFile} />}
      {step === 2 && (
        <ConfigureStep
          file={file} columns={columns} preview={preview}
          target={target} task={task}
          onTarget={setTarget} onTask={handleTaskChange}
          onBack={() => setStep(1)} onNext={() => setStep(3)}
        />
      )}
      {step === 3 && !loading && (
        <AlgorithmsStep
          task={task} target={target} selected={selected}
          onToggle={handleToggle}
          onBack={() => setStep(2)} onRun={handleRun} loading={loading}
        />
      )}
      {loading && (
        <TrainingStep
          logs={logs} progress={progress}
          modelCount={selected.length} fileName={file?.name}
        />
      )}
      {step === 4 && results && (
        <ResultsStep
          results={results} rows={rows} features={features}
          task={task} target={target}
          onRetry={handleRetry} onReset={handleReset}
        />
      )}
    </div>

  </div>
)
}