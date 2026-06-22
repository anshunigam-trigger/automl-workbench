'use client'


// Mock data — will be replaced with real database data in Phase 5
const STATS = {
  totalModels:  12,
  datasetsUsed: 3,
  bestAccuracy: '81.55%',
  experiments:  5,
}

const MODELS = [
  {
    id: 1,
    name: 'Logistic Regression',
    short: 'LR',
    dataset: 'telecom_churn.csv',
    accuracy: 81.55,
    f1: 81.06,
    precision: 80.86,
    recall: 81.55,
    task: 'Classification',
    trained: '2 hours ago',
    time: '0.02s',
    rank: 1,
    color: '#2DD4BF',
  },
  {
    id: 2,
    name: 'XGBoost',
    short: 'XGB',
    dataset: 'telecom_churn.csv',
    accuracy: 79.42,
    f1: 78.71,
    precision: 78.44,
    recall: 79.42,
    task: 'Classification',
    trained: '2 hours ago',
    time: '3.68s',
    rank: 2,
    color: '#38BDF8',
  },
  {
    id: 3,
    name: 'Random Forest',
    short: 'RF',
    dataset: 'telecom_churn.csv',
    accuracy: 78.99,
    f1: 77.76,
    precision: 77.64,
    recall: 78.99,
    task: 'Classification',
    trained: '2 hours ago',
    time: '3.0s',
    rank: 3,
    color: '#A78BFA',
  },
  {
    id: 4,
    name: 'Decision Tree',
    short: 'DT',
    dataset: 'telecom_churn.csv',
    accuracy: 73.46,
    f1: 73.46,
    precision: 73.46,
    recall: 73.46,
    task: 'Classification',
    trained: '2 hours ago',
    time: '0.1s',
    rank: 4,
    color: '#F59E0B',
  },
]

export default function ModelsPage() {
  return (
    <>
    
      <div className="shell">
  
        <div className="page-content">

          {/* Page Header */}
          <div className="page-header fade-up">
            <div className="breadcrumb">Models</div>
            <div className="page-title">
              <span className="grad">Saved Models</span>
            </div>
            <div className="page-sub">
              All trained models from your experiments. Compare, download, and deploy.
            </div>
          </div>

          {/* Stat boxes */}
          <div className="stats-bar fade-up-1">
            <div className="stat-box">
              <div className="stat-val">{STATS.totalModels}</div>
              <div className="stat-lbl">Total Models</div>
            </div>
            <div className="stat-box">
              <div className="stat-val">{STATS.datasetsUsed}</div>
              <div className="stat-lbl">Datasets Used</div>
            </div>
            <div className="stat-box">
              <div className="stat-val" style={{ color: '#2DD4BF' }}>
                {STATS.bestAccuracy}
              </div>
              <div className="stat-lbl">Best Accuracy</div>
            </div>
            <div className="stat-box">
              <div className="stat-val">{STATS.experiments}</div>
              <div className="stat-lbl">Experiments</div>
            </div>
          </div>

          {/* Podium — Top 3 Models */}
          <div className="card fade-up-2">
            <div className="card-header">
              <div>
                <div className="card-title">
                  <span className="card-title-icon">🏆</span>
                  Top Performers
                </div>
                <div className="card-sub">
                  Best models from your experiments
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: '20px',
              padding: '20px 0',
              height: '240px',
            }}>

              {/* 2nd place */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '28px' }}>🥈</span>
                <div style={{
                  width: '130px', height: '120px',
                  background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)',
                  borderRadius: '10px 10px 0 0',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: '4px', boxShadow: '0 0 24px #38BDF833',
                }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                    {MODELS[1].short}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>
                    {MODELS[1].accuracy}%
                  </div>
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                    Accuracy
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text2)', textAlign: 'center' }}>
                  {MODELS[1].name}
                </div>
              </div>

              {/* 1st place — tallest */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '32px' }}>🥇</span>
                <div style={{
                  width: '130px', height: '160px',
                  background: 'linear-gradient(135deg, #2DD4BF, #0D9488)',
                  borderRadius: '10px 10px 0 0',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: '4px', boxShadow: '0 0 32px #2DD4BF44',
                }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                    {MODELS[0].short}
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>
                    {MODELS[0].accuracy}%
                  </div>
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                    Accuracy
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text2)', textAlign: 'center' }}>
                  {MODELS[0].name}
                </div>
              </div>

              {/* 3rd place */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>🥉</span>
                <div style={{
                  width: '130px', height: '90px',
                  background: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
                  borderRadius: '10px 10px 0 0',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: '4px', boxShadow: '0 0 20px #A78BFA33',
                }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                    {MODELS[2].short}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
                    {MODELS[2].accuracy}%
                  </div>
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                    Accuracy
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text2)', textAlign: 'center' }}>
                  {MODELS[2].name}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  )
}