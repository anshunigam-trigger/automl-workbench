// app/(app)/loading.jsx: shown while a page loads (route-level skeleton)
export default function Loading() {
  return (
    <div className="page-content" aria-busy="true" aria-label="Loading">
      <div className="ab-head">
        <div>
          <div className="ab-skel" style={{ width: 240, height: 32, margin: 0 }} />
          <div className="ab-skel" style={{ width: 340, height: 14, marginTop: 10 }} />
        </div>
      </div>
      <div className="ab-kpis">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="ab-tile"><div className="ab-skel" style={{ height: 14, width: '50%', margin: 0 }} /><div className="ab-skel" style={{ height: 30, width: '70%' }} /></div>
        ))}
      </div>
      <div className="ab-two">
        <div className="ab-card"><div className="ab-skel" style={{ height: 220, margin: 0 }} /></div>
        <div className="ab-card"><div className="ab-skel" style={{ height: 220, margin: 0 }} /></div>
      </div>
    </div>
  )
}