'use client'

import Link from 'next/link'
import './style.css'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts'

/* ════════════════════════════════════════
   DATA
   ════════════════════════════════════════ */

const PROJECT = {
  totalExperiments:  1248,
  datasetsProcessed: 34,
  modelsTrained:     89,
  bestAccuracy:      '99.4%',
  bestModel:         'LightGBM',
  bestDataset:       'fraud_detection',
  completion:        20,
}

const ACCURACY_DATA = [
  { epoch: 0,   lr: 65,    xgb: 62,   rf: 60   },
  { epoch: 20,  lr: 72,    xgb: 74,   rf: 70   },
  { epoch: 40,  lr: 76,    xgb: 80,   rf: 75   },
  { epoch: 60,  lr: 79,    xgb: 85,   rf: 79   },
  { epoch: 80,  lr: 81,    xgb: 88,   rf: 82   },
  { epoch: 100, lr: 81.55, xgb: 89.5, rf: 83   },
]

const LEADERBOARD = [
  { rank: 1, model: 'LightGBM',            accuracy: 99.10, f1: 98.90, dataset: 'fraud_detection'    },
  { rank: 2, model: 'XGBoost',             accuracy: 89.50, f1: 88.70, dataset: 'housing_prices_Q3'  },
  { rank: 3, model: 'Random Forest',       accuracy: 83.00, f1: 82.10, dataset: 'housing_prices_Q3'  },
  { rank: 4, model: 'Logistic Regression', accuracy: 81.55, f1: 81.06, dataset: 'telecom_churn_v2'   },
]

const EXPERIMENTS = [
  { id: 'EXP-8901', dataset: 'customer_churn_v2',  model: 'LightGBM',            status: 'running', accuracy: '—',       when: '10m ago'    },
  { id: 'EXP-8900', dataset: 'fraud_detection',    model: 'LightGBM',            status: 'success', accuracy: '99.10%',  when: 'Yesterday'  },
  { id: 'EXP-8899', dataset: 'sentiment_tweets',   model: 'Random Forest',       status: 'warning', accuracy: '81.50%',  when: 'Yesterday'  },
  { id: 'EXP-8898', dataset: 'housing_prices_Q3',  model: 'XGBoost Regressor',   status: 'success', accuracy: 'R² 0.94', when: '2 days ago' },
  { id: 'EXP-8897', dataset: 'telecom_churn_v2',   model: 'Logistic Regression', status: 'success', accuracy: '81.55%',  when: '3 days ago' },
]

const FEATURE_IMPORTANCE = [
  { feature: 'tenure',         importance: 0.31 },
  { feature: 'MonthlyCharges', importance: 0.24 },
  { feature: 'TotalCharges',   importance: 0.18 },
  { feature: 'Contract',       importance: 0.14 },
  { feature: 'OnlineSecurity', importance: 0.08 },
  { feature: 'PaymentMethod',  importance: 0.05 },
]

const ROADMAP = [
  { n:1, title:'Core AutoML',       pct:100, status:'done',     color:'#2DD4BF', desc:'CSV upload, preprocessing, 12 algorithms'       },
  { n:2, title:'Data Intelligence', pct:0,   status:'active',   color:'#38BDF8', desc:'Profiling, correlation heatmap, outliers'        },
  { n:3, title:'Advanced ML',       pct:0,   status:'upcoming', color:'#A78BFA', desc:'Feature importance, ROC/AUC, SHAP'               },
  { n:4, title:'AI-Powered',        pct:0,   status:'upcoming', color:'#F472B6', desc:'Claude advisor, NL query, auto reports'          },
  { n:5, title:'Platform',          pct:0,   status:'upcoming', color:'#FBBF24', desc:'Live model race, What-If simulator'              },
  { n:6, title:'Production',        pct:0,   status:'upcoming', color:'#EF4444', desc:'Auth, PostgreSQL, Docker, Deploy'                },
]

/* ════════════════════════════════════════
   CHART TOOLTIPS
   ════════════════════════════════════════ */

const AccTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'rgba(13,21,38,.95)', border:'1px solid #1E2D45', borderRadius:8, padding:'10px 14px', fontSize:11, fontFamily:'var(--mono)' }}>
      <div style={{ color:'#8BA0BF', marginBottom:6 }}>Epoch: {label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color:p.color, marginBottom:2 }}>{p.name.toUpperCase()}: {p.value}%</div>
      ))}
    </div>
  )
}

const FeatTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'rgba(13,21,38,.95)', border:'1px solid #1E2D45', borderRadius:8, padding:'8px 12px', fontSize:11, fontFamily:'var(--mono)' }}>
      <div style={{ color:'#38BDF8' }}>Importance: {(payload[0].value * 100).toFixed(0)}%</div>
    </div>
  )
}

/* ════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════ */

export default function ReportsPage() {
  const RANK_COLORS = ['#FBBF24','#94A3B8','#CD7F32','#475569']

  return (
    <div className="page-content">
      

      {/* ── 1. HEADER ── */}
      <div className="rp-head fade-up">
        <div style={{ flex:1 }}>
          <div className="breadcrumb">Reports</div>
          <div className="rp-title"><span className="grad">Project Overview</span></div>
          <div className="rp-sub">AutoBench Alpha · Phase 1 Shipped · {new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</div>
          <div className="rp-prog">
            <div className="rp-prog-track">
              <div className="rp-prog-fill" style={{ width:`${PROJECT.completion}%` }} />
            </div>
            <div className="rp-prog-lbl">{PROJECT.completion}% complete</div>
          </div>
        </div>
        <div className="rp-btns">
          <button className="rp-btn sky">🔗 Share Link</button>
          <button className="rp-btn">⬇ Download PDF</button>
        </div>
      </div>

      {/* ── 2. KPI CARDS ── */}
      <div className="kpi-grid fade-up-1">
        <div className="kpi">
          <div className="kpi-icon">📋</div>
          <div>
            <div className="kpi-val">{PROJECT.totalExperiments.toLocaleString()}</div>
            <div className="kpi-lbl">Total Experiments</div>
            <div className="kpi-sub">+12.5% this week</div>
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-icon">🗄️</div>
          <div>
            <div className="kpi-val">{PROJECT.datasetsProcessed}</div>
            <div className="kpi-lbl">Datasets Processed</div>
            <div className="kpi-sub">2.4 TB total stored</div>
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-icon">🤖</div>
          <div>
            <div className="kpi-val">{PROJECT.modelsTrained}</div>
            <div className="kpi-lbl">Models Trained</div>
            <div className="kpi-sub">Avg 0.8s train time</div>
          </div>
        </div>
        <div className="kpi best">
          <div className="kpi-icon">🏆</div>
          <div>
            <div className="kpi-val">{PROJECT.bestAccuracy}</div>
            <div className="kpi-lbl">Best Accuracy Ever</div>
            <div className="kpi-sub">{PROJECT.bestModel} · {PROJECT.bestDataset}</div>
          </div>
        </div>
      </div>

      {/* ── 3. CHART + LEADERBOARD ── */}
      <div className="sec-label fade-up-2">Model Performance Analytics</div>
      <div className="charts-row fade-up-2">

        <div className="chart-card">
          <div className="chart-title">Accuracy vs. Epochs</div>
          <div className="chart-sub">Top 3 models — training progression over 100 epochs</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ACCURACY_DATA} margin={{ top:4, right:4, bottom:0, left:-20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" />
              <XAxis dataKey="epoch" tick={{ fill:'#3D5470', fontSize:10 }} />
              <YAxis tick={{ fill:'#3D5470', fontSize:10 }} domain={[55,95]} />
              <Tooltip content={<AccTooltip />} />
              <Line type="monotone" dataKey="lr"  stroke="#2DD4BF" strokeWidth={2} dot={false} name="lr"  />
              <Line type="monotone" dataKey="xgb" stroke="#F472B6" strokeWidth={2} dot={false} name="xgb" />
              <Line type="monotone" dataKey="rf"  stroke="#FBBF24" strokeWidth={2} dot={false} name="rf"  />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title">🏆 Model Leaderboard</div>
          <div className="chart-sub">Best performing models across all experiments</div>
          {LEADERBOARD.map((m,i) => (
            <div key={i} className="lb-item">
              <div className="lb-rank" style={{ background: RANK_COLORS[i]+'22', color: RANK_COLORS[i], border:`1px solid ${RANK_COLORS[i]}44` }}>
                {i+1}
              </div>
              <div style={{ flex:1 }}>
                <div className="lb-name">{m.model}</div>
                <div className="lb-dataset">{m.dataset}</div>
                <div className="lb-bar-track">
                  <div className="lb-bar-fill" style={{ width:`${m.accuracy}%`, background: RANK_COLORS[i], opacity:.8 }} />
                </div>
              </div>
              <div className="lb-acc">{m.accuracy}%</div>
            </div>
          ))}
        </div>

      </div>

      {/* ── 4. EXPERIMENTS + ROADMAP ── */}
      <div className="sec-label fade-up-3">Experiment History &amp; Progress</div>
      <div className="mid-row fade-up-3">

        <div className="chart-card">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:3 }}>
            <div className="chart-title">Recent Experiments</div>
            <Link href="/" style={{ fontSize:11, color:'var(--sky)', textDecoration:'none' }}>View All →</Link>
          </div>
          <div className="chart-sub" style={{ marginBottom:14 }}>Latest 5 training runs with results</div>
          <table className="exp-tbl">
            <thead>
              <tr>
                <th>Dataset</th>
                <th>Best Model</th>
                <th>Status</th>
                <th style={{ textAlign:'right' }}>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {EXPERIMENTS.map((e,i) => (
                <tr key={i}>
                  <td>
                    <div className="exp-id">{e.id} · {e.when}</div>
                    <div className="exp-ds">{e.dataset}</div>
                  </td>
                  <td><div className="exp-mod">{e.model}</div></td>
                  <td>
                    <span className={`sp ${e.status==='success'?'sp-s':e.status==='running'?'sp-r':'sp-w'}`}>
                      {e.status==='success'?'● Success':e.status==='running'?'● Running':'● Warning'}
                    </span>
                  </td>
                  <td><div className="exp-acc">{e.accuracy}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="chart-card">
          <div className="chart-title">Development Roadmap</div>
          <div className="chart-sub" style={{ marginBottom:14 }}>6 phases · {PROJECT.completion}% shipped</div>
          <div>
            {ROADMAP.map(r => (
              <div key={r.n} className="rm-item">
                <div className="rm-dot" style={{ background:r.color, boxShadow:r.status!=='upcoming'?`0 0 6px ${r.color}66`:'none' }} />
                <div className="rm-info">
                  <div className="rm-name">
                    {r.title}
                    <span style={{ fontSize:8, fontFamily:'var(--mono)', fontWeight:700, padding:'1px 6px', borderRadius:99, background:r.color+'18', color:r.color, border:`1px solid ${r.color}30` }}>
                      {r.status==='done'?'✓':r.status==='active'?'⟳':'○'}
                    </span>
                  </div>
                  <div className="rm-desc">{r.desc}</div>
                  <div className="rm-track">
                    <div className="rm-fill" style={{ width:`${r.pct}%`, background:r.color }} />
                  </div>
                </div>
                <div className="rm-pct" style={{ color:r.color }}>{r.pct}%</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── 5. ADVANCED ANALYTICS ── */}
      <div className="sec-label fade-up-4">Advanced Analytics</div>
      <div className="adv-grid fade-up-4">

        {/* Feature Importance */}
        <div className="chart-card">
          <div className="chart-title">Feature Importance</div>
          <div className="chart-sub">Top features — LightGBM on fraud_detection</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={FEATURE_IMPORTANCE} layout="vertical" margin={{ top:0, right:30, bottom:0, left:70 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" horizontal={false} />
              <XAxis type="number" tick={{ fill:'#3D5470', fontSize:10 }} tickFormatter={v=>`${(v*100).toFixed(0)}%`} />
              <YAxis type="category" dataKey="feature" tick={{ fill:'#8BA0BF', fontSize:10 }} width={65} />
              <Tooltip content={<FeatTooltip />} />
              <Bar dataKey="importance" fill="#38BDF8" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Confusion Matrix */}
        <div className="chart-card">
          <div className="chart-title">Confusion Matrix</div>
          <div className="chart-sub">LightGBM predictions — fraud_detection</div>
          <div className="cm-grid">
            <div className="cm-cell" style={{ background:'#2DD4BF18', border:'1px solid #2DD4BF33' }}>
              <div className="cm-val" style={{ color:'#2DD4BF' }}>9,847</div>
              <div className="cm-lbl" style={{ color:'#2DD4BF' }}>True Negative</div>
            </div>
            <div className="cm-cell" style={{ background:'#EF444418', border:'1px solid #EF444433' }}>
              <div className="cm-val" style={{ color:'#EF4444' }}>32</div>
              <div className="cm-lbl" style={{ color:'#EF4444' }}>False Positive</div>
            </div>
            <div className="cm-cell" style={{ background:'#FBBF2418', border:'1px solid #FBBF2433' }}>
              <div className="cm-val" style={{ color:'#FBBF24' }}>19</div>
              <div className="cm-lbl" style={{ color:'#FBBF24' }}>False Negative</div>
            </div>
            <div className="cm-cell" style={{ background:'#2DD4BF18', border:'1px solid #2DD4BF33' }}>
              <div className="cm-val" style={{ color:'#2DD4BF' }}>102</div>
              <div className="cm-lbl" style={{ color:'#2DD4BF' }}>True Positive</div>
            </div>
          </div>
          <div style={{ marginTop:14, fontSize:11, color:'var(--text2)', display:'flex', gap:16, justifyContent:'center' }}>
            <span>Precision: <b style={{ color:'var(--teal)' }}>76.1%</b></span>
            <span>Recall: <b style={{ color:'var(--teal)' }}>84.3%</b></span>
            <span>F1: <b style={{ color:'var(--teal)' }}>98.9%</b></span>
          </div>
        </div>

        {/* ROC Curve placeholder */}
        <div className="chart-card">
          <div className="chart-title">ROC Curve</div>
          <div className="chart-sub">AUC scores — all classification models</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:8 }}>
            {[
              { model:'LightGBM',            auc:0.994, color:'#2DD4BF' },
              { model:'XGBoost',             auc:0.961, color:'#38BDF8' },
              { model:'Random Forest',       auc:0.943, color:'#A78BFA' },
              { model:'Logistic Regression', auc:0.891, color:'#FBBF24' },
            ].map((r,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:80, fontSize:10, color:'var(--text2)', fontFamily:'var(--mono)', flexShrink:0 }}>{r.model.split(' ')[0]}</div>
                <div style={{ flex:1, height:6, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${r.auc*100}%`, background:r.color, borderRadius:3 }} />
                </div>
                <div style={{ fontFamily:'var(--mono)', fontSize:11, fontWeight:700, color:r.color, width:42, textAlign:'right' }}>
                  {r.auc.toFixed(3)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:14, padding:'10px', background:'var(--surface2)', borderRadius:8, fontSize:11, color:'var(--text2)', textAlign:'center' }}>
            Full interactive ROC curve → <span style={{ color:'var(--sky)' }}>Phase 3</span>
          </div>
        </div>

        {/* Prediction Distribution */}
        <div className="chart-card">
          <div className="chart-title">Prediction Distribution</div>
          <div className="chart-sub">Class breakdown — fraud_detection predictions</div>
          <div style={{ marginTop:12 }}>
            {[
              { label:'No Fraud', pct:97.9, color:'#2DD4BF', count:'9,879' },
              { label:'Fraud',    pct:2.1,  color:'#EF4444', count:'153'   },
            ].map((p,i) => (
              <div key={i} className="pred-item" style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <div style={{ fontSize:11, color:'var(--text2)', width:64, flexShrink:0, fontFamily:'var(--mono)' }}>{p.label}</div>
                <div style={{ flex:1, height:10, background:'var(--border)', borderRadius:5, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${p.pct}%`, background:p.color, borderRadius:5 }} />
                </div>
                <div style={{ fontFamily:'var(--mono)', fontSize:11, fontWeight:700, color:p.color, width:36, textAlign:'right' }}>{p.pct}%</div>
                <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text3)', width:40 }}>{p.count}</div>
              </div>
            ))}
            <div style={{ padding:'14px', background:'var(--surface2)', borderRadius:10, border:'1px solid var(--border)', marginTop:8 }}>
              <div style={{ fontSize:11, color:'var(--text2)', marginBottom:4 }}>Class Imbalance Detected</div>
              <div style={{ fontSize:10, color:'var(--text3)' }}>97.9% vs 2.1% — consider SMOTE oversampling in Phase 2</div>
            </div>
          </div>
        </div>

      </div>

      {/* ── 6. EXPORT SECTION ── */}
      <div className="sec-label" style={{ marginTop:4 }}>Export &amp; Share</div>
      <div className="chart-card" style={{ marginBottom:0 }}>
        <div className="export-row">
          <div>
            <div className="chart-title" style={{ marginBottom:3 }}>Export Options</div>
            <div className="chart-sub" style={{ marginBottom:14 }}>Choose what to include in your report</div>
            <div className="export-opts">
              {[
                { label:'Project Overview',     sub:'High-level metrics and progress',        on:true  },
                { label:'Experiment Analytics', sub:'Charts, leaderboard and results tables', on:true  },
                { label:'Advanced Analytics',   sub:'Feature importance, ROC, confusion matrix',on:true },
                { label:'Raw Data Appendices',  sub:'Increases file size significantly',       on:false },
              ].map((o,i) => (
                <div key={i} className="export-opt">
                  <div className={`export-chk ${o.on?'on':'off'}`}>{o.on?'✓':''}</div>
                  <div>
                    <div className="export-opt-title">{o.label}</div>
                    <div className="export-opt-sub">{o.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="chart-title" style={{ marginBottom:3 }}>Download</div>
            <div className="chart-sub" style={{ marginBottom:14 }}>Choose your format</div>
            <div className="export-btns">
              <button className="export-btn pdf">⬇ Finalize &amp; Download PDF</button>
              <button className="export-btn csv">📊 Export Results as CSV</button>
              <button className="export-btn share">🔗 Generate Share Link</button>
            </div>
            <div className="export-size">Est. size: 2.4 MB · Page 1 of 4</div>
          </div>
        </div>
      </div>

    </div>
  )
}

