'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileSpreadsheet, ArrowLeft, ArrowRight, Check, Play, RotateCw, RotateCcw, AlertTriangle } from 'lucide-react'
import { parseCSV } from '@/lib/parseCSV'
import { trainModels } from '@/lib/api'
import { CLS_MODELS, REG_MODELS } from '@/lib/constants'
import { modelName } from '@/lib/format'
import { METRICS, winnerIndex } from '@/lib/runs'
import { takePendingUpload } from '@/lib/pendingUpload'
import { Page, Card, Tile, toast } from '@/components/ui'
import './wizard.css'

const STEPS = ['Upload', 'Configure', 'Algorithms', 'Results']
const sizeText = n => (n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(2)} MB`)
const cell = (row, h, i) => (Array.isArray(row) ? row[i] : row?.[h])
const clock = d => d.toLocaleTimeString('en-GB')
const stamp = text => ({ text, at: new Date() })

function Steps({ current }) {
  return (
    <ol className="wz-steps" aria-label="Progress">
      {STEPS.map((s, i) => {
        const n = i + 1
        const state = n < current ? 'done' : n === current ? 'now' : 'todo'
        return (
          <li key={s} className={state} aria-current={state === 'now' ? 'step' : undefined}>
            <span className="wz-dot">{state === 'done' ? <Check size={13} /> : n}</span>
            <span className="wz-lbl">{s}</span>
          </li>
        )
      })}
    </ol>
  )
}

function DropZone({ onFile, bad }) {
  const [over, setOver] = useState(false)
  const input = useRef(null)
  return (
    <div
      className={`wz-drop${over ? ' over' : ''}${bad ? ' bad' : ''}`}
      onDragOver={e => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f) }}
    >
      <motion.div className="ab-emptyic" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
        <Upload size={24} />
      </motion.div>
      <b>{over ? 'Drop to upload' : 'Drag and drop a CSV file'}</b>
      <p className="ab-lbl">or choose a file from your computer. Only .csv files are supported.</p>
      <button type="button" className="ab-btn dark fit" onClick={() => input.current?.click()}>Choose file</button>
      <input ref={input} type="file" accept=".csv,text/csv" hidden onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = '' }} />
    </div>
  )
}

export default function ExperimentPage() {
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
  const [elapsed,  setElapsed]  = useState(0)
  const [results,  setResults]  = useState(null)
  const [rows,     setRows]     = useState(0)
  const [features, setFeatures] = useState([])
  const [expId,    setExpId]    = useState(null)
  const startRef = useRef(0)

  const models = task === 'classification' ? CLS_MODELS : REG_MODELS

  const handleFile = f => {
    if (!/\.csv$/i.test(f.name)) { setError(`“${f.name}” isn’t a CSV file. Only .csv files are supported.`); return }
    if (f.size === 0) { setError('That file is empty.'); return }
    setError('')
    const reader = new FileReader()
    reader.onerror = () => setError('Couldn’t read that file. Please try again.')
    reader.onload = e => {
      try {
        const { headers, rows: parsed } = parseCSV(e.target.result)
        if (!headers?.length) throw new Error('No columns were found in the first row of that file.')
        setFile(f); setColumns(headers); setPreview(parsed); setTarget(headers[headers.length - 1]); setSelected([]); setStep(2)
      } catch (err) {
        setError(err.message || 'Couldn’t parse that CSV file.')
      }
    }
    reader.readAsText(f)
  }

  // A file dropped on the Datasets page is handed over here
  useEffect(() => { const f = takePendingUpload(); if (f) handleFile(f) }, [])

  // Elapsed time is real: measured from the moment the request was sent
  useEffect(() => {
    if (!loading) return
    const t = setInterval(() => setElapsed((performance.now() - startRef.current) / 1000), 200)
    return () => clearInterval(t)
  }, [loading])

  // Warn before leaving mid-training
  useEffect(() => {
    if (!loading) return
    const warn = e => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [loading])

  const handleToggle = id => setSelected(p => (p.includes(id) ? p.filter(m => m !== id) : [...p, id]))
  const handleTaskChange = t => { setTask(t); setSelected([]) }

  const handleRun = async () => {
    if (loading) return
    if (!selected.length) { setError('Select at least one algorithm.'); return }
    const names = selected.map(id => models.find(m => m.id === id)?.name ?? id)
    setError(''); setLoading(true); setElapsed(0)
    startRef.current = performance.now()
    setLogs([
      stamp(`Dataset: ${file.name} (${sizeText(file.size)})`),
      stamp(`Target: ${target} · Task: ${task}`),
      stamp(`Models: ${names.join(', ')}`),
      stamp('Request sent. Waiting for the backend…'),
    ])
    try {
      const data = await trainModels({ file, target, task, models: selected })
      const secs = ((performance.now() - startRef.current) / 1000).toFixed(1)
      setLogs(p => [...p, stamp(`Completed in ${secs}s. ${data.results?.length ?? 0} models evaluated.`)])
      setResults(data.results); setRows(data.rows); setFeatures(data.features ?? [])
      setExpId(data.id ?? data.experiment_id ?? null)
      setStep(4)
      toast('Experiment complete. Leaderboard ready.', 'success')
    } catch (err) {
      const msg = err?.message || 'The backend didn’t respond. Make sure FastAPI is running on port 8000.'
      setLogs(p => [...p, stamp(`Failed: ${msg}`)])
      setError(msg)
      toast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => { setStep(3); setResults(null); setLogs([]); setError('') }
  const handleReset = () => {
    setStep(1); setFile(null); setColumns([]); setPreview([]); setTarget('')
    setTask('classification'); setSelected([]); setResults(null)
    setRows(0); setFeatures([]); setLogs([]); setError(''); setExpId(null)
  }

  const view = loading ? 'training' : step
  const cols = METRICS[task]

  return (
    <Page title="New experiment" sub="Upload a dataset, choose models, and compare the results.">
      <Card>
        <Steps current={step} />

        {error && (
          <div className="ab-alert" role="alert" style={{ marginBottom: 16 }}>
            <span className="ab-alert-ic"><AlertTriangle size={15} /></span>
            <div className="ab-alert-tx"><b>{step === 3 ? 'Training didn’t finish' : 'Something needs attention'}</b><span>{error}</span></div>
            {step === 3 && !loading && selected.length > 0 && file && (
              <button className="ab-btn sm" onClick={handleRun}><RotateCw size={13} /> Retry</button>
            )}
          </div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={view} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>

            {view === 1 && <DropZone onFile={handleFile} bad={!!error} />}

            {view === 2 && (
              <div className="wz-pane">
                <div className="wz-file"><FileSpreadsheet size={18} /><div><b>{file.name}</b><span className="ab-lbl">{sizeText(file.size)} · {columns.length} columns</span></div></div>

                <div className="wz-grid">
                  <label className="wz-field">
                    <span>Target column</span>
                    <select value={target} onChange={e => setTarget(e.target.value)}>
                      {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <small>The column the model learns to predict.</small>
                  </label>

                  <div className="wz-field" role="radiogroup" aria-label="Task type">
                    <span>Task type</span>
                    <div className="wz-tasks">
                      {[['classification', 'Classification', 'Predict a category, e.g. churn yes or no'], ['regression', 'Regression', 'Predict a number, e.g. a price']].map(([id, t, d]) => (
                        <button key={id} type="button" role="radio" aria-checked={task === id} className={`wz-task${task === id ? ' on' : ''}`} onClick={() => handleTaskChange(id)}>
                          <b>{t}</b><small>{d}</small>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="ab-lbl" style={{ margin: '4px 0 8px' }}>Preview · first {Math.min(5, preview.length)} of {preview.length.toLocaleString()} rows</div>
                <div className="ab-tw" style={{ marginTop: 0 }}>
                  <table className="ab-table" style={{ minWidth: 0 }}>
                    <thead><tr>{columns.map(c => <th key={c} className={c === target ? 'wz-tgt' : ''}>{c}{c === target && ' (target)'}</th>)}</tr></thead>
                    <tbody>
                      {preview.slice(0, 5).map((r, i) => (
                        <tr key={i}>{columns.map((c, j) => <td key={c} className="db-mono">{String(cell(r, c, j) ?? '')}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="wz-actions">
                  <button className="ab-btn fit" onClick={() => setStep(1)}><ArrowLeft size={15} /> Back</button>
                  <button className="ab-btn dark fit" onClick={() => setStep(3)}>Choose algorithms <ArrowRight size={15} /></button>
                </div>
              </div>
            )}

            {view === 3 && (
              <div className="wz-pane">
                <div className="ab-row">
                  <div><b className="ab-h">Algorithms</b><div className="ab-lbl">{task === 'classification' ? 'Classification' : 'Regression'} models available for “{target}”</div></div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="ab-link" onClick={() => setSelected(models.map(m => m.id))}>Select all</button>
                    <button className="ab-link" onClick={() => setSelected([])}>Clear</button>
                  </div>
                </div>
                <div className="wz-models" role="group" aria-label="Algorithms">
                  {models.map(m => {
                    const on = selected.includes(m.id)
                    return (
                      <button key={m.id} type="button" role="checkbox" aria-checked={on} className={`wz-model${on ? ' on' : ''}`} onClick={() => handleToggle(m.id)}>
                        <span className="wz-check">{on && <Check size={13} />}</span>
                        <span><b>{m.name}</b><small>{m.desc ?? m.description ?? ''}</small></span>
                      </button>
                    )
                  })}
                </div>
                <div className="wz-actions">
                  <button className="ab-btn fit" onClick={() => setStep(2)}><ArrowLeft size={15} /> Back</button>
                  <button className="ab-btn dark fit" onClick={handleRun} disabled={!selected.length}>
                    <Play size={15} /> Train {selected.length || ''} model{selected.length === 1 ? '' : 's'}
                  </button>
                </div>
              </div>
            )}

            {view === 'training' && (
              <div className="wz-train">
                <div className="wz-trainhead">
                  <span className="wz-spin"><RotateCw size={18} className="ab-spin" /></span>
                  <div>
                    <b>Training {selected.length} model{selected.length === 1 ? '' : 's'}</b>
                    <div className="ab-lbl">{file?.name} · {elapsed.toFixed(1)}s elapsed</div>
                  </div>
                </div>
                <div className="wz-bar" role="progressbar" aria-label="Training in progress" aria-busy="true"><i /></div>
                <p className="ab-lbl">The backend sends results when training finishes, so this shows elapsed time rather than a percentage.</p>
                <div className="wz-log" aria-live="polite">
                  {logs.map((l, i) => <div key={i}><span>{clock(l.at)}</span>{l.text}</div>)}
                </div>
              </div>
            )}

            {view === 4 && results && (
              <div className="wz-pane">
                <div className="ab-kpis" style={{ marginBottom: 20 }}>
                  <Tile label="Rows used">{rows ? rows.toLocaleString() : '—'}</Tile>
                  <Tile label="Features">{features.length || '—'}</Tile>
                  <Tile label="Models trained">{results.length}</Tile>
                  <Tile hot label="Best model" sub={cols[0].text(results[0]?.[cols[0].key])}>{results[0] ? modelName(results[0].id, task) : '—'}</Tile>
                </div>

                <div className="ab-tw" style={{ marginTop: 0 }}>
                  <table className="ab-table">
                    <thead><tr><th>#</th><th>Model</th>{cols.map(c => <th key={c.key}>{c.label}</th>)}</tr></thead>
                    <tbody>
                      {results.map((r, i) => (
                        <motion.tr key={r.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                          <td className="ab-lbl">{i + 1}</td>
                          <td style={{ fontWeight: 600 }}>{modelName(r.id, task)}{i === 0 && <span className="ab-badge">BEST</span>}</td>
                          {cols.map(c => {
                            const win = winnerIndex(results.map(x => x[c.key]), c.better) === i
                            return <td key={c.key} className="db-mono" style={win ? { fontWeight: 700, color: 'var(--ab-acc-ink)' } : undefined}>{c.text(r[c.key])}</td>
                          })}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="ab-lbl" style={{ marginTop: 10 }}>Orange marks the best value in each column; for error and time, lower is better.</p>

                <div className="wz-actions">
                  <button className="ab-btn fit" onClick={handleRetry}><RotateCcw size={15} /> Try other models</button>
                  <button className="ab-btn fit" onClick={handleReset}>New experiment</button>
                  <Link href={expId ? `/reports/${expId}` : '/reports'} className="ab-btn dark fit">View full report <ArrowRight size={15} /></Link>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </Card>
    </Page>
  )
}