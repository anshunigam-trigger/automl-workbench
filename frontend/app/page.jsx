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

  return (
    <>
      <div className="shell">

        <div className="page-content">

          {/* Hero header */}
          <div className="page-header fade-up">
            <div className="breadcrumb">Experiments <span>›</span> New Experiment</div>
            <div className="page-title">
              <span className="grad">ML Experiments,</span> Automated.
            </div>
            <div className="page-sub">
              Upload any CSV · select algorithms · get real accuracy scores in seconds.
            </div>
          </div>

          <div className="fade-up-1">
            <Stepper currentStep={step} />
          </div>

          {error && <div className="error-bar fade-up">⚠ &nbsp;{error}</div>}

          <div className="fade-up-2">
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
      </div>
    </>
  )
}
