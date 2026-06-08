'use client'

import { useState }     from 'react'
import Link             from 'next/link'
import Topbar           from '@/components/Topbar'
import NeuralBackground from '@/components/NeuralBackground'

const DATASETS = [
  { name:'telecom_churn.csv',  rows:7043,  cols:21, numeric:8,  categorical:13, task:'Classification', target:'Churn',     uploaded:'2 hrs ago',  experiments:3, bestScore:'81.55%', size:'1.2 MB', color:'#38BDF8' },
  { name:'titanic.csv',        rows:891,   cols:12, numeric:6,  categorical:6,  task:'Classification', target:'Survived',  uploaded:'1 day ago',  experiments:1, bestScore:'79.12%', size:'89 KB',  color:'#A78BFA' },
  { name:'house_prices.csv',   rows:1460,  cols:81, numeric:36, categorical:45, task:'Regression',     target:'SalePrice', uploaded:'3 days ago', experiments:2, bestScore:'89.23%', size:'450 KB', color:'#2DD4BF' },
  { name:'iris.csv',           rows:150,   cols:5,  numeric:4,  categorical:1,  task:'Classification', target:'species',   uploaded:'1 week ago', experiments:1, bestScore:'96.67%', size:'4.5 KB', color:'#F472B6' },
  { name:'boston_housing.csv', rows:506,   cols:14, numeric:13, categorical:1,  task:'Regression',     target:'medv',      uploaded:'2 wks ago',  experiments:1, bestScore:'85.44%', size:'35 KB',  color:'#FBBF24' },
  { name:'customer_seg.csv',   rows:2240,  cols:29, numeric:14, categorical:15, task:'Classification', target:'Response',  uploaded:'3 wks ago',  experiments:0, bestScore:'—',      size:'280 KB', color:'#818CF8' },
]

const CSS = `
  /* ── Dataset card grid ── */
  .ds-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  @media(max-width:900px){ .ds-grid{ grid-template-columns:repeat(2,1fr); } }
  @media(max-width:580px){ .ds-grid{ grid-template-columns:1fr; } }

  .ds-card {
    background: rgba(13,21,38,.85);
    border: 1px solid var(--border);
    border-radius: 14px; padding: 20px;
    cursor: pointer; position: relative; overflow: hidden;
    transition: transform .25s cubic-bezier(.34,1.56,.64,1), border-color .25s, box-shadow .25s;
    animation: fadeUp .45s ease both;
  }
  .ds-card:hover {
    transform: translateY(-6px) scale(1.01);
    border-color: var(--c);
    box-shadow: 0 16px 48px rgba(0,0,0,.4), 0 0 0 1px var(--c)22;
  }

  /* top gradient bar */
  .ds-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: var(--c); opacity: .6; transition: opacity .25s;
  }
  .ds-card:hover::before { opacity: 1; }

  /* glow radial on hover */
  .ds-card::after {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(circle at top right, var(--c)12, transparent 60%);
    opacity: 0; transition: opacity .3s; pointer-events: none;
  }
  .ds-card:hover::after { opacity: 1; }

  /* stagger */
  .ds-card:nth-child(1){animation-delay:.04s}
  .ds-card:nth-child(2){animation-delay:.08s}
  .ds-card:nth-child(3){animation-delay:.12s}
  .ds-card:nth-child(4){animation-delay:.16s}
  .ds-card:nth-child(5){animation-delay:.20s}
  .ds-card:nth-child(6){animation-delay:.24s}

  .ds-icon {
    width: 42px; height: 42px; border-radius: 10px;
    background: var(--c)18; border: 1px solid var(--c)33;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; margin-bottom: 14px;
    transition: transform .3s;
  }
  .ds-card:hover .ds-icon { transform: scale(1.08) rotate(-3deg); }

  .ds-name {
    font-family: var(--mono); font-size: 12px; font-weight: 700; color: var(--text);
    margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .ds-target { font-size: 11px; color: var(--text3); margin-bottom: 14px; font-family: var(--mono); }
  .ds-target b { color: var(--c); font-weight: 500; }

  .ds-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }
  .ds-stat { background: rgba(255,255,255,.03); border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px; }
  .ds-stat-val { font-family: var(--mono); font-size: 15px; font-weight: 700; color: var(--text); }
  .ds-stat-lbl { font-size: 9px; color: var(--text3); text-transform: uppercase; letter-spacing: .06em; margin-top: 2px; }

  .ds-col-bar { margin-bottom: 14px; }
  .ds-col-bar-label { display: flex; justify-content: space-between; font-size: 9px; color: var(--text3); margin-bottom: 5px; font-family: var(--mono); }
  .ds-col-bar-track { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; display: flex; }
  .ds-col-bar-num { height: 100%; background: var(--c); border-radius: 2px 0 0 2px; }
  .ds-col-bar-cat { height: 100%; background: var(--c)44; }

  .ds-footer { display: flex; align-items: center; justify-content: space-between; }
  .ds-task { font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 99px; font-family: var(--mono); letter-spacing: .06em; }
  .ds-task.cls { background: #38BDF810; color: #38BDF8; border: 1px solid #38BDF830; }
  .ds-task.reg { background: #2DD4BF10; color: #2DD4BF; border: 1px solid #2DD4BF30; }

  .ds-use {
    font-size: 11px; font-weight: 600; color: var(--c);
    background: var(--c)12; border: 1px solid var(--c)30;
    padding: 5px 12px; border-radius: 6px; cursor: pointer;
    transition: all .2s; text-decoration: none;
    display: inline-flex; align-items: center; gap: 4px;
  }
  .ds-use:hover { background: var(--c)22; transform: translateX(2px); }

  .ds-meta { font-size: 10px; color: var(--text3); margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; font-family: var(--mono); }
  .ds-meta-score { color: var(--c); font-weight: 700; }

  /* ── Upload zone ── */
  .upload-zone {
    position: relative; border-radius: 14px; padding: 1px;
    margin-bottom: 20px; cursor: pointer;
  }
  .upload-zone::before {
    content: ''; position: absolute; inset: 0; border-radius: 14px;
    background: linear-gradient(var(--uz-angle,0deg), #38BDF8, #A78BFA, #F472B6, #38BDF8);
    animation: uzRotate 4s linear infinite; opacity: .35; transition: opacity .3s;
  }
  .upload-zone:hover::before { opacity: .8; }
  @property --uz-angle { syntax:'<angle>'; initial-value:0deg; inherits:false; }
  @keyframes uzRotate { to { --uz-angle: 360deg; } }
  .upload-zone-inner {
    position: relative; border-radius: 13px; padding: 22px 24px; z-index: 1;
    background: rgba(13,21,38,.95);
    display: flex; align-items: center; gap: 16px;
    transition: background .2s;
  }
  .upload-zone:hover .upload-zone-inner { background: rgba(13,21,38,.8); }
  .upload-zone-icon { font-size: 28px; animation: float 2.5s ease-in-out infinite; }
  .upload-zone-title { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 3px; }
  .upload-zone-sub { font-size: 12px; color: var(--text2); }

  /* ── Search ── */
  .search-row { display: flex; gap: 10px; margin-bottom: 20px; }
  .search-input {
    flex: 1; padding: 10px 14px; background: rgba(13,21,38,.9);
    border: 1px solid var(--border); border-radius: 8px;
    color: var(--text); font-size: 13px; font-family: var(--sans);
    transition: border-color .2s, box-shadow .2s; backdrop-filter: blur(8px);
  }
  .search-input:focus { outline: none; border-color: #38BDF8; box-shadow: 0 0 0 3px #38BDF810; }
  .search-input::placeholder { color: var(--text3); }
  .filter-btn {
    padding: 10px 16px; background: rgba(13,21,38,.9); border: 1px solid var(--border);
    border-radius: 8px; color: var(--text2); font-size: 12px; cursor: pointer;
    transition: all .2s; white-space: nowrap; font-family: var(--sans);
    backdrop-filter: blur(8px);
  }
  .filter-btn:hover { border-color: var(--border2); color: var(--text); }
  .filter-btn.on { border-color: #38BDF866; color: #38BDF8; background: #38BDF810; }

  /* ── Empty state ── */
  .empty { text-align: center; padding: 64px 0; color: var(--text3); }
  .empty-icon { font-size: 44px; margin-bottom: 14px; }
  .empty-title { font-size: 15px; font-weight: 500; color: var(--text2); margin-bottom: 6px; }
  .empty-sub { font-size: 13px; }
`

export default function DatasetsPage() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const list = DATASETS.filter(d => {
    const mf = filter === 'All' || d.task === filter
    const ms = d.name.toLowerCase().includes(search.toLowerCase())
    return mf && ms
  })

  return (
    <>
      <NeuralBackground />
      <div className="shell">
        <style>{CSS}</style>
        <Topbar />
        <div className="page-content">

          {/* Header */}
          <div className="page-header fade-up">
            <div className="breadcrumb">Datasets</div>
            <div className="page-title"><span className="grad">Datasets</span></div>
            <div className="page-sub">Manage your uploaded datasets and launch new experiments.</div>
          </div>

          {/* Stats */}
          <div className="stats-bar fade-up-1">
            <div className="stat-box"><div className="stat-val">{DATASETS.length}</div><div className="stat-lbl">Datasets</div></div>
            <div className="stat-box"><div className="stat-val">{DATASETS.reduce((a,d)=>a+d.experiments,0)}</div><div className="stat-lbl">Experiments</div></div>
            <div className="stat-box"><div className="stat-val">{DATASETS.reduce((a,d)=>a+d.rows,0).toLocaleString()}</div><div className="stat-lbl">Total rows</div></div>
            <div className="stat-box"><div className="stat-val" style={{color:'#2DD4BF'}}>96.67%</div><div className="stat-lbl">Best accuracy</div></div>
          </div>

          {/* Upload zone */}
          <div className="upload-zone fade-up-2" onClick={()=>{}}>
            <div className="upload-zone-inner">
              <div className="upload-zone-icon">⬆️</div>
              <div>
                <div className="upload-zone-title">Upload a new dataset</div>
                <div className="upload-zone-sub">Drag & drop a CSV · Any size · Auto-preprocessed</div>
              </div>
              <Link href="/" className="btn primary" style={{marginLeft:'auto',whiteSpace:'nowrap'}}>
                + New Experiment
              </Link>
            </div>
          </div>

          {/* Search + filter */}
          <div className="search-row fade-up-3">
            <input
              className="search-input"
              placeholder="🔍   Search datasets..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {['All','Classification','Regression'].map(f => (
              <button key={f} className={`filter-btn${filter===f?' on':''}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>

          {/* Cards */}
          {list.length > 0 ? (
            <div className="ds-grid fade-up-4">
              {list.map((d, i) => (
                <div key={i} className="ds-card" style={{'--c': d.color}}>
                  <div className="ds-icon">📊</div>
                  <div className="ds-name">{d.name}</div>
                  <div className="ds-target">target → <b>{d.target}</b></div>

                  <div className="ds-stats">
                    <div className="ds-stat">
                      <div className="ds-stat-val">{d.rows.toLocaleString()}</div>
                      <div className="ds-stat-lbl">Rows</div>
                    </div>
                    <div className="ds-stat">
                      <div className="ds-stat-val">{d.cols}</div>
                      <div className="ds-stat-lbl">Columns</div>
                    </div>
                  </div>

                  <div className="ds-col-bar">
                    <div className="ds-col-bar-label">
                      <span># {d.numeric} numeric</span>
                      <span>Aa {d.categorical} categorical</span>
                    </div>
                    <div className="ds-col-bar-track">
                      <div className="ds-col-bar-num" style={{width:`${d.numeric/d.cols*100}%`}}/>
                      <div className="ds-col-bar-cat" style={{width:`${d.categorical/d.cols*100}%`}}/>
                    </div>
                  </div>

                  <div className="ds-footer">
                    <span className={`ds-task ${d.task==='Classification'?'cls':'reg'}`}>{d.task}</span>
                    <Link href="/" className="ds-use">Use →</Link>
                  </div>

                  <div className="ds-meta">
                    <span>{d.uploaded} · {d.size}</span>
                    {d.experiments > 0
                      ? <span>{d.experiments} runs · best <span className="ds-meta-score">{d.bestScore}</span></span>
                      : <span style={{color:'var(--text3)'}}>No runs yet</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">
              <div className="empty-icon">🔍</div>
              <div className="empty-title">No datasets found</div>
              <div className="empty-sub">Try a different search term or filter</div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
