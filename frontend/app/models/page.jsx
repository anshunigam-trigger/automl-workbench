'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

/* ════════════════════════════════════════
   DATA
   ════════════════════════════════════════ */

const KPI = [
  { label: 'Registered',    val: '1,248', sub: '+12 this week',   icon: '📋', color: null        },
  { label: 'In Production', val: '42',    sub: '100% SLA met',    icon: '🚀', color: '#2DD4BF'   },
  { label: 'Best Accuracy', val: '99.1%', sub: 'LightGBM · fraud',icon: '🏆', color: '#2DD4BF'   },
  { label: 'Avg Latency',   val: '24ms',  sub: '-2ms optimization',icon: '⚡', color: null        },
  { label: 'Training Avg',  val: '12m',   sub: 'Per experiment',  icon: '⏱️', color: null        },
  { label: 'Availability',  val: '99.9%', sub: 'Uptime this month',icon: '✅', color: '#2DD4BF'   },
]

const PERF_DATA = [
  { epoch: 0,   lr: 65,    xgb: 62,   rf: 60,   lgbm: 68  },
  { epoch: 20,  lr: 72,    xgb: 74,   rf: 70,   lgbm: 79  },
  { epoch: 40,  lr: 76,    xgb: 80,   rf: 75,   lgbm: 87  },
  { epoch: 60,  lr: 79,    xgb: 85,   rf: 79,   lgbm: 92  },
  { epoch: 80,  lr: 81,    xgb: 88,   rf: 82,   lgbm: 97  },
  { epoch: 100, lr: 81.55, xgb: 89.5, rf: 83,   lgbm: 99.1},
]

const BEST_MODEL = {
  name:      'LightGBM',
  version:   'v1.4.2',
  dataset:   'fraud_detection',
  task:      'Binary Classification',
  accuracy:  99.1,
  f1:        98.9,
  precision: 99.0,
  recall:    98.8,
  inference: '14ms',
  size:      '245 MB',
  framework: 'XGBoost',
  status:    'PRODUCTION',
}

const MODELS = [
  { id:1, name:'LightGBM_Fraud_Alpha',     version:'v1.4.2', dataset:'fraud_detection',    algo:'LightGBM',            accuracy:99.10, f1:98.90, status:'production', trained:'2h ago',    by:'Anshu N.' },
  { id:2, name:'XGBoost_Fraud_Beta',       version:'v2.0.1', dataset:'fraud_detection',    algo:'XGBoost',             accuracy:94.1,  f1:93.80, status:'staging',    trained:'1d ago',    by:'Anshu N.' },
  { id:3, name:'RF_Housing_Regressor',     version:'v1.1.0', dataset:'housing_prices_Q3',  algo:'Random Forest',       accuracy:89.23, f1:null,  status:'production', trained:'3d ago',    by:'Anshu N.' },
  { id:4, name:'LR_Telecom_Churn',         version:'v1.0.0', dataset:'telecom_churn_v2',   algo:'Logistic Regression', accuracy:81.55, f1:81.06, status:'production', trained:'5d ago',    by:'Anshu N.' },
  { id:5, name:'DT_Iris_Classifier',       version:'v1.0.0', dataset:'iris',               algo:'Decision Tree',       accuracy:96.67, f1:96.50, status:'archived',   trained:'1 wk ago',  by:'Anshu N.' },
  { id:6, name:'Ridge_Housing_Regressor',  version:'v1.0.0', dataset:'housing_prices_Q3',  algo:'Ridge Regression',    accuracy:84.11, f1:null,  status:'archived',   trained:'2 wk ago',  by:'Anshu N.' },
]

const STATUS_CFG = {
  production: { label: 'PRODUCTION', bg: '#2DD4BF18', color: '#2DD4BF', border: '#2DD4BF44' },
  staging:    { label: 'STAGING',    bg: '#38BDF818', color: '#38BDF8', border: '#38BDF844' },
  archived:   { label: 'ARCHIVED',   bg: '#47556922', color: '#475569', border: '#47556944' },
}

const ALGO_CFG = {
  'LightGBM':            { bg: '#2DD4BF18', color: '#2DD4BF' },
  'XGBoost':             { bg: '#38BDF818', color: '#38BDF8' },
  'Random Forest':       { bg: '#A78BFA18', color: '#A78BFA' },
  'Logistic Regression': { bg: '#F472B618', color: '#F472B6' },
  'Decision Tree':       { bg: '#FBBF2418', color: '#FBBF24' },
  'Ridge Regression':    { bg: '#818CF818', color: '#818CF8' },
}

const PerfTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'rgba(13,21,38,.97)', border:'1px solid #1E2D45', borderRadius:8, padding:'10px 14px', fontSize:11, fontFamily:'var(--mono)' }}>
      <div style={{ color:'#8BA0BF', marginBottom:6 }}>Epoch {label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color:p.color, marginBottom:2 }}>
          {p.dataKey.toUpperCase()}: {p.value}%
        </div>
      ))}
    </div>
  )
}

/* ════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════ */

export default function ModelsPage() {
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('all')
  const [selected, setSelected] = useState(null)
  const [page,     setPage]     = useState(1)
  const PER_PAGE = 5

  const filtered = MODELS.filter(m => {
    const ms = filter === 'all' || m.status === filter
    const mq = m.name.toLowerCase().includes(search.toLowerCase()) ||
               m.dataset.toLowerCase().includes(search.toLowerCase()) ||
               m.algo.toLowerCase().includes(search.toLowerCase())
    return ms && mq
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged      = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)
  const active     = selected ? MODELS.find(m => m.id === selected) : BEST_MODEL

  return (
    <div className="page-content">

      {/* ── HEADER ── */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, gap:16, flexWrap:'wrap' }} className="fade-up">
        <div>
          <div className="breadcrumb">Models</div>
          <div className="page-title"><span className="grad">Model Registry</span></div>
          <div className="page-sub">Manage, compare, version and deploy trained ML models.</div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'flex-start', flexWrap:'wrap' }}>
          <Link href="/" className="btn">+ Train Model</Link>
          <button className="btn primary">↗ Compare Models</button>
        </div>
      </div>

      {/* ── KPI ROW ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:10, marginBottom:20 }} className="fade-up-1">
        {KPI.map((k,i) => (
          <div key={i} style={{
            background:'var(--surface)', border:'1px solid var(--border)',
            borderRadius:10, padding:'14px 14px',
            transition:'border-color .2s, transform .15s',
          }}
          onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.borderColor='var(--border2)'}}
          onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.borderColor='var(--border)'}}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <div style={{ fontSize:10, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.07em' }}>{k.label}</div>
              <div style={{ fontSize:14 }}>{k.icon}</div>
            </div>
            <div style={{ fontFamily:'var(--mono)', fontSize:20, fontWeight:700, color: k.color || 'var(--text)', lineHeight:1, marginBottom:4 }}>{k.val}</div>
            <div style={{ fontSize:9, color:'var(--text3)', fontFamily:'var(--mono)' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── CHART + BEST MODEL ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1.8fr 1fr', gap:14, marginBottom:20 }} className="fade-up-2">

        {/* Performance Trends */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>Model Performance Trends</div>
              <div style={{ fontSize:11, color:'var(--text2)', marginBottom:16 }}>Comparing top 4 models — Accuracy over 100 epochs</div>
            </div>
            <div style={{ display:'flex', gap:4 }}>
              {['Metrics','ROC'].map(t => (
                <button key={t} style={{
                  padding:'4px 10px', borderRadius:6, fontSize:11, fontWeight:500,
                  border:'1px solid var(--border)', background: t==='Metrics'?'var(--surface2)':'transparent',
                  color: t==='Metrics'?'var(--text)':'var(--text3)', cursor:'pointer', fontFamily:'var(--sans)'
                }}>{t}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={PERF_DATA} margin={{ top:4, right:4, bottom:0, left:-20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" />
              <XAxis dataKey="epoch" tick={{ fill:'#3D5470', fontSize:10 }} />
              <YAxis tick={{ fill:'#3D5470', fontSize:10 }} domain={[55,100]} />
              <Tooltip content={<PerfTooltip />} />
              <Line type="monotone" dataKey="lgbm" stroke="#2DD4BF" strokeWidth={2.5} dot={false} name="lgbm" />
              <Line type="monotone" dataKey="xgb"  stroke="#F472B6" strokeWidth={2}   dot={false} name="xgb"  />
              <Line type="monotone" dataKey="rf"   stroke="#FBBF24" strokeWidth={2}   dot={false} name="rf"   />
              <Line type="monotone" dataKey="lr"   stroke="#A78BFA" strokeWidth={2}   dot={false} name="lr" strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Best Model Summary */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>
              {selected ? 'Selected Model' : 'Best Model Summary'}
            </div>
            <div style={{
              fontSize:8, fontWeight:700, padding:'2px 7px', borderRadius:99,
              background:'#2DD4BF18', color:'#2DD4BF', border:'1px solid #2DD4BF44',
              fontFamily:'var(--mono)', letterSpacing:'.06em'
            }}>● PROD</div>
          </div>
          <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:2, fontFamily:'var(--mono)' }}>
            {selected ? MODELS.find(m=>m.id===selected)?.name : BEST_MODEL.name}
          </div>
          <div style={{ fontSize:11, color:'var(--text3)', marginBottom:16, fontFamily:'var(--mono)' }}>
            {selected ? MODELS.find(m=>m.id===selected)?.version : BEST_MODEL.version} · {selected ? MODELS.find(m=>m.id===selected)?.dataset : BEST_MODEL.dataset}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
            {[
              { label:'Accuracy',  val: selected ? MODELS.find(m=>m.id===selected)?.accuracy+'%' : BEST_MODEL.accuracy+'%'  },
              { label:'F1 Score',  val: selected ? (MODELS.find(m=>m.id===selected)?.f1||'—')+'%' : BEST_MODEL.f1+'%'       },
              { label:'Precision', val: selected ? '—' : BEST_MODEL.precision+'%' },
              { label:'Recall',    val: selected ? '—' : BEST_MODEL.recall+'%'    },
            ].map((m,i) => (
              <div key={i} style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 12px' }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--teal)', fontFamily:'var(--mono)' }}>{m.val}</div>
                <div style={{ fontSize:10, color:'var(--text3)', marginTop:2, textTransform:'uppercase', letterSpacing:'.06em' }}>{m.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', gap:8 }}>
            <button className="btn" style={{ flex:1, fontSize:11, padding:'8px 10px', justifyContent:'center' }}>View Details</button>
            <button className="btn primary" style={{ flex:1, fontSize:11, padding:'8px 10px', justifyContent:'center' }}>↗ Endpoint API</button>
          </div>
        </div>

      </div>

      {/* ── MODEL INVENTORY ── */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:20 }} className="fade-up-3">

        {/* Inventory header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, gap:12, flexWrap:'wrap' }}>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:2 }}>Model Inventory</div>
            <div style={{ fontSize:11, color:'var(--text2)' }}>Showing {filtered.length} of {MODELS.length} models</div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            {/* Search */}
            <input
              value={search}
              onChange={e=>{setSearch(e.target.value);setPage(1)}}
              placeholder="🔍 Search models..."
              style={{
                padding:'8px 12px', background:'var(--surface2)', border:'1px solid var(--border)',
                borderRadius:8, color:'var(--text)', fontSize:12, fontFamily:'var(--sans)',
                outline:'none', width:180,
              }}
            />
            {/* Filter tabs */}
            {['all','production','staging','archived'].map(f => (
              <button key={f} onClick={()=>{setFilter(f);setPage(1)}} style={{
                padding:'7px 12px', borderRadius:7, fontSize:11, fontWeight:500,
                border:`1px solid ${filter===f?'var(--sky-glow)':'var(--border)'}`,
                background: filter===f?'var(--sky-dim)':'transparent',
                color: filter===f?'var(--sky)':'var(--text2)',
                cursor:'pointer', fontFamily:'var(--sans)', textTransform:'capitalize'
              }}>{f}</button>
            ))}
            <button className="btn" style={{ fontSize:11, padding:'7px 12px' }}>⬇ Export</button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)' }}>
                {['Name / Version','Dataset','Algorithm','Accuracy','F1 Score','Status','Trained','Actions'].map(h => (
                  <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:9, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.1em', fontFamily:'var(--mono)', whiteSpace:'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((m,i) => {
                const sc = STATUS_CFG[m.status]
                const ac = ALGO_CFG[m.algo] || { bg:'var(--surface2)', color:'var(--text2)' }
                const isSelected = selected === m.id
                return (
                  <tr
                    key={m.id}
                    onClick={() => setSelected(isSelected ? null : m.id)}
                    style={{
                      borderBottom:'1px solid var(--border)44',
                      background: isSelected ? 'var(--sky-dim)' : 'transparent',
                      cursor:'pointer', transition:'background .15s',
                    }}
                    onMouseEnter={e=>{ if(!isSelected) e.currentTarget.style.background='var(--surface2)' }}
                    onMouseLeave={e=>{ if(!isSelected) e.currentTarget.style.background='transparent' }}
                  >
                    <td style={{ padding:'12px 12px' }}>
                      <div style={{ fontWeight:600, color:'var(--text)', marginBottom:2, fontFamily:'var(--mono)', fontSize:12 }}>{m.name}</div>
                      <div style={{ fontSize:10, color:'var(--text3)', fontFamily:'var(--mono)' }}>{m.version} · {m.by}</div>
                    </td>
                    <td style={{ padding:'12px 12px' }}>
                      <div style={{ fontSize:11, color:'var(--text2)', fontFamily:'var(--mono)' }}>{m.dataset}</div>
                    </td>
                    <td style={{ padding:'12px 12px' }}>
                      <span style={{ display:'inline-block', fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:6, background:ac.bg, color:ac.color, fontFamily:'var(--mono)' }}>
                        {m.algo}
                      </span>
                    </td>
                    <td style={{ padding:'12px 12px' }}>
                      <div style={{ fontFamily:'var(--mono)', fontSize:13, fontWeight:700, color:'var(--teal)', marginBottom:4 }}>
                        {m.accuracy}%
                      </div>
                      <div style={{ height:3, background:'var(--border)', borderRadius:2, overflow:'hidden', width:80 }}>
                        <div style={{ height:'100%', width:`${m.accuracy}%`, background:'var(--teal)', borderRadius:2 }} />
                      </div>
                    </td>
                    <td style={{ padding:'12px 12px', fontFamily:'var(--mono)', fontSize:12, color: m.f1 ? 'var(--text)' : 'var(--text3)' }}>
                      {m.f1 ? m.f1+'%' : '—'}
                    </td>
                    <td style={{ padding:'12px 12px' }}>
                      <span style={{ display:'inline-block', fontSize:9, fontWeight:700, padding:'3px 8px', borderRadius:99, letterSpacing:'.06em', background:sc.bg, color:sc.color, border:`1px solid ${sc.border}`, fontFamily:'var(--mono)' }}>
                        {sc.label}
                      </span>
                    </td>
                    <td style={{ padding:'12px 12px', fontSize:11, color:'var(--text3)', fontFamily:'var(--mono)' }}>
                      {m.trained}
                    </td>
                    <td style={{ padding:'12px 12px' }}>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn" style={{ padding:'4px 10px', fontSize:10 }} onClick={e=>e.stopPropagation()}>
                          ⬇
                        </button>
                        <button className="btn" style={{ padding:'4px 10px', fontSize:10, color:'var(--sky)', borderColor:'var(--sky-glow)', background:'var(--sky-dim)' }} onClick={e=>e.stopPropagation()}>
                          Deploy
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:16, fontSize:11, color:'var(--text2)' }}>
            <span>Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length} models</span>
            <div style={{ display:'flex', gap:4 }}>
              <button className="btn" style={{ padding:'4px 10px', fontSize:11 }} onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>Prev</button>
              {Array.from({length:totalPages},(_, i)=>(
                <button key={i} className="btn" style={{ padding:'4px 10px', fontSize:11, background: page===i+1?'var(--sky-dim)':'transparent', color: page===i+1?'var(--sky)':'var(--text2)', borderColor: page===i+1?'var(--sky-glow)':'var(--border)' }} onClick={()=>setPage(i+1)}>
                  {i+1}
                </button>
              ))}
              <button className="btn" style={{ padding:'4px 10px', fontSize:11 }} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>Next</button>
            </div>
          </div>
        )}

      </div>

    </div>
  )
}
