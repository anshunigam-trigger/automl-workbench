'use client'

import { useState, useRef } from 'react'
import Topbar           from '@/components/Topbar'
import Stepper          from '@/components/Stepper'
import UploadStep       from '@/components/steps/UploadStep'
import ConfigureStep    from '@/components/steps/ConfigureStep'
import AlgorithmsStep   from '@/components/steps/AlgorithmsStep'
import TrainingStep     from '@/components/steps/TrainingStep'
import ResultsStep      from '@/components/steps/ResultsStep'
import { parseCSV }     from '@/lib/parseCSV'
import { trainModels }  from '@/lib/api'
import { LOG_LINES, CLS_MODELS, REG_MODELS } from '@/lib/constants'

export default function HomePage() {
  // ── Wizard state ──
  const [step,     setStep]     = useState(1)
  const [error,    setError]    = useState('')

  // ── Dataset state ──
  const [file,     setFile]     = useState(null)
  const [columns,  setColumns]  = useState([])
  const [preview,  setPreview]  = useState([])

  // ── Config state ──
  const [target,   setTarget]   = useState('')
  const [task,     setTask]     = useState('classification')

  // ── Algorithm state ──
  const [selected, setSelected] = useState([])

  // ── Training state ──
  const [loading,  setLoading]  = useState(false)
  const [logs,     setLogs]     = useState([])
  const [progress, setProgress] = useState(0)

  // ── Results state ──
  const [results,  setResults]  = useState(null)
  const [rows,     setRows]     = useState(0)
  const [features, setFeatures] = useState([])

  // ── Handlers ──

  const handleFile = (file, fileError) => {
    if (fileError) { setError(fileError); return }
    setError('')
    const reader = new FileReader()
    reader.onload = (e) => {
      const { headers, rows } = parseCSV(e.target.result)
      setFile(file)
      setColumns(headers)
      setPreview(rows)
      setTarget(headers[headers.length - 1])
      setStep(2)
    }
    reader.readAsText(file)
  }

  const handleToggleAlgo = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  const handleTaskChange = (newTask) => {
    setTask(newTask)
    setSelected([]) // reset selected models when task changes
  }

  const handleRun = async () => {
    if (!selected.length) { setError('Select at least one algorithm'); return }
    setError('')
    setLoading(true)
    setLogs([])
    setProgress(0)

    const models = task === 'classification' ? CLS_MODELS : REG_MODELS

    // simulate pre-training log animation
    for (let i = 0; i < LOG_LINES.length; i++) {
      await delay(280)
      setLogs(prev => [...prev, LOG_LINES[i]])
      setProgress(Math.round((i + 1) / LOG_LINES.length * 50))
    }

    // simulate per-model log lines
    for (let i = 0; i < selected.length; i++) {
      const m = models.find(x => x.id === selected[i])
      await delay(220)
      setLogs(prev => [...prev, { text: `[RUN]  Training ${m?.name ?? selected[i]}...`, tag: 'run' }])
      setProgress(50 + Math.round((i + 1) / selected.length * 40))
    }

    // actual API call
    try {
      const data = await trainModels({ file, target, task, models: selected })
      setProgress(100)
      setLogs(prev => [...prev, { text: '[OK]   All models evaluated. Leaderboard ready.', tag: 'ok' }])
      await delay(500)
      setResults(data.results)
      setRows(data.rows)
      setFeatures(data.features)
      setStep(4)
    } catch (err) {
      setError(err.message || 'Backend error — make sure FastAPI is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setStep(3)
    setResults(null)
    setLogs([])
    setProgress(0)
  }

  const handleReset = () => {
    setStep(1)
    setFile(null)
    setColumns([])
    setPreview([])
    setTarget('')
    setTask('classification')
    setSelected([])
    setResults(null)
    setRows(0)
    setFeatures([])
    setLogs([])
    setProgress(0)
    setError('')
  }

  return (
    <div className="shell">
      <Topbar />

      <div className="page-content">
        {/* Page header */}
        <div className="page-header">
          <div className="breadcrumb">
            Experiments <span>›</span> New Experiment
          </div>
          <div className="page-title">New Experiment</div>
          <div className="page-sub">
            Upload a dataset, configure your target, select algorithms and compare results automatically.
          </div>
        </div>

        {/* Step indicator */}
        <Stepper currentStep={step} />

        {/* Error bar */}
        {error && <div className="error-bar">⚠ &nbsp;{error}</div>}

        {/* Step 1 — Upload */}
        {step === 1 && (
          <UploadStep onFile={handleFile} />
        )}

        {/* Step 2 — Configure */}
        {step === 2 && (
          <ConfigureStep
            file={file}
            columns={columns}
            preview={preview}
            target={target}
            task={task}
            onTarget={setTarget}
            onTask={handleTaskChange}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {/* Step 3 — Algorithms */}
        {step === 3 && !loading && (
          <AlgorithmsStep
            task={task}
            target={target}
            selected={selected}
            onToggle={handleToggleAlgo}
            onBack={() => setStep(2)}
            onRun={handleRun}
            loading={loading}
          />
        )}

        {/* Training progress */}
        {loading && (
          <TrainingStep
            logs={logs}
            progress={progress}
            modelCount={selected.length}
            fileName={file?.name}
          />
        )}

        {/* Step 4 — Results */}
        {step === 4 && results && (
          <ResultsStep
            results={results}
            rows={rows}
            features={features}
            task={task}
            target={target}
            onRetry={handleRetry}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  )
}

// ── Helpers ──
const delay = ms => new Promise(r => setTimeout(r, ms))
