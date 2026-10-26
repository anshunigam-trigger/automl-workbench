'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, GitCompare } from 'lucide-react'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useExperiments } from '@/lib/useExperiments'
import { analyzeExperiment } from '@/lib/analyze'
import { downloadCsv } from '@/lib/exportCsv'
import { timeAgo, formatScore, duration } from '@/lib/format'
import { METRICS, winnerIndex, flattenRuns, runRecord } from '@/lib/runs'
import { Page, Card, Tile, Empty, ErrorState, CountUp, toast, list } from '@/components/ui'

const when = iso => {
  const d = new Date(iso)
  return isNaN(d) ? '—' : d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function RunDetailPage() {
  const { id } = useParams()
  const { experiments, loading, error, refetch } = useExperiments()
  const e = experiments.find(x => String(x.id) === String(id))

  const back = <Link href="/reports" className="ab-btn fit"><ArrowLeft size={15} /> All reports</Link>

  if (loading) {
    return (
      <Page title="Loading run…" sub=" " action={back}>
        <div className="ab-kpis">{[0, 1, 2, 3].map(i => <div key={i} className="ab-tile"><div className="ab-skel" style={{ height: 56, margin: 0 }} /></div>)}</div>
        <div className="ab-card"><div className="ab-skel" style={{ height: 240, margin: 0 }} /></div>
      </Page>
    )
  }
  if (error) return <Page title="Run" sub=" " action={back}><ErrorState text={error} onRetry={refetch} /></Page>
  if (!e) {
    return (
      <Page title="Run not found" sub={`There is no experiment #${id}.`} action={back}>
        <Empty title="This run doesn’t exist" text="It may have been removed, or the link is wrong." href="/reports" cta="Back to reports" />
      </Page>
    )
  }

  const a = analyzeExperiment(e)
  const metrics = METRICS[e.task]
  const runs = flattenRuns([e])
  const primary = e.task === 'classification' ? 'Accuracy' : 'R² × 100'
  const chartData = a.models.map((m, i) => ({ name: m.name, value: Math.max(0, m.score) * 100, best: i === 0 }))
  const exportThis = () => { downloadCsv(`experiment-${e.id}.csv`, runs.map(runRecord)); toast(`Experiment #${e.id} exported`, 'success') }
  const compareHref = `/compare?runs=${runs.map(r => r.key).join(',')}`

  return (
    <Page
      title={e.dataset}
      sub={`Experiment #${e.id} · ${e.task} · target: ${e.target} · ${timeAgo(e.created_at)}`}
      action={
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {back}
          <button className="ab-btn fit" onClick={exportThis}><Download size={15} /> Export CSV</button>
          {runs.length > 1 && <Link href={compareHref} className="ab-btn dark fit"><GitCompare size={15} /> Compare models</Link>}
        </div>
      }
    >
      <motion.div className="ab-kpis" variants={list}>
        <Tile hot label="Best model" sub={a.best ? formatScore(a.best, e.task) : undefined}>{a.best?.name ?? '—'}</Tile>
        <Tile label="Models trained"><CountUp to={a.models.length} /></Tile>
        <Tile label="Rows">{e.rows != null ? <CountUp to={e.rows} /> : '—'}</Tile>
        <Tile label="Total training time">{duration(a.totalTime)}</Tile>
      </motion.div>

      <motion.div className="ab-two" variants={list}>
        <Card>
          <b className="ab-h">{primary} by model</b>
          <div className="ab-lbl" style={{ marginBottom: 12 }}>Best model in orange. Scores are from the evaluation the backend reported.</div>
          {chartData.length === 0 ? <div className="ab-lbl">No model results were saved for this run.</div> : (
            <ResponsiveContainer width="100%" height={Math.max(180, chartData.length * 44)}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ab-line)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--ab-mut)', fontSize: 11 }} tickFormatter={v => `${v}`} />
                <YAxis type="category" dataKey="name" width={130} tick={{ fill: 'var(--ab-mut)', fontSize: 11 }} />
                <Tooltip cursor={{ fill: 'var(--ab-inset)' }} formatter={v => [`${Number(v).toFixed(2)}`, primary]} contentStyle={{ background: 'var(--ab-card)', border: '1px solid var(--ab-line)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} animationDuration={900}>
                  {chartData.map(d => <Cell key={d.name} fill={d.best ? '#FF6901' : '#83837A'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <b className="ab-h">Configuration</b>
          <div className="ab-lbl" style={{ marginBottom: 8 }}>What was recorded for this run</div>
          <dl className="rd-dl">
            <div><dt>Dataset</dt><dd>{e.dataset}</dd></div>
            <div><dt>Target</dt><dd className="db-mono">{e.target}</dd></div>
            <div><dt>Task</dt><dd>{e.task}</dd></div>
            <div><dt>Rows</dt><dd className="db-mono">{e.rows?.toLocaleString() ?? '—'}</dd></div>
            <div><dt>Models</dt><dd>{a.models.map(m => m.name).join(', ') || '—'}</dd></div>
            <div><dt>Created</dt><dd className="db-mono">{when(e.created_at)}</dd></div>
            <div><dt>Hyperparameters</dt><dd className="ab-lbl">Not recorded</dd></div>
            <div><dt>Random seed</dt><dd className="ab-lbl">Not recorded</dd></div>
            <div><dt>Evaluation split</dt><dd className="ab-lbl">Not recorded</dd></div>
          </dl>
        </Card>
      </motion.div>

      <Card inView>
        <b className="ab-h">All models</b>
        <div className="ab-lbl">Best value in each column is highlighted. For error and time, lower is better.</div>
        <div className="ab-tw">
          <table className="ab-table">
            <thead><tr><th>#</th><th>Model</th>{metrics.map(m => <th key={m.key}>{m.label}</th>)}</tr></thead>
            <tbody>
              {a.models.map((m, i) => (
                <tr key={m.id}>
                  <td className="ab-lbl">{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{m.name}{i === 0 && <span className="ab-badge">BEST</span>}</td>
                  {metrics.map(c => {
                    const win = winnerIndex(a.models.map(x => x[c.key]), c.better) === i
                    return <td key={c.key} className="db-mono" style={win ? { fontWeight: 700, color: 'var(--ab-acc-ink)' } : undefined}>{c.text(m[c.key])}</td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {a.insights.length > 0 && (
          <div className={`ab-note${a.weak ? ' warn' : ''}`}>
            <b>What this means</b>
            {a.insights.map((t, i) => <p key={i}>{t}</p>)}
          </div>
        )}
      </Card>
    </Page>
  )
}