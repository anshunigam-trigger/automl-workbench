export default function Stat({ label, value, sub, color, loading }) {
  return (
    <div className="stat-box">
      {loading
        ? <div className="skeleton" style={{ width: 60, height: 22, marginBottom: 6 }} />
        : <div className="stat-val" style={color ? { color } : undefined}>{value}</div>}
      <div className="stat-lbl">{label}</div>
      {sub && !loading && (
        <div style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 3 }}>
          {sub}
        </div>
      )}
    </div>
  )
}