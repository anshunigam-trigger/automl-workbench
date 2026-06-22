export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-icon" />
      <div className="skeleton skeleton-text lg skeleton-line-1" />
      <div className="skeleton skeleton-text sm skeleton-line-2" />

      <div className="skeleton-stats">
        <div className="skeleton skeleton-stat-box" />
        <div className="skeleton skeleton-stat-box" />
      </div>

      <div className="skeleton skeleton-bar" />

      <div className="skeleton-footer">
        <div className="skeleton skeleton-pill" />
        <div className="skeleton skeleton-pill" />
      </div>
    </div>
  )
}