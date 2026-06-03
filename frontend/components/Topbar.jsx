'use client'

const NAV_ITEMS = ['Experiments', 'Datasets', 'Models', 'Reports']

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-icon">A</div>
        <div className="brand-name">Auto<span>Bench</span></div>
      </div>

      <nav className="topnav">
        {NAV_ITEMS.map((item, i) => (
          <button key={item} className={`nav-item${i === 0 ? ' active' : ''}`}>
            {item}
          </button>
        ))}
      </nav>

      <div className="topbar-right">
        <span className="version-pill">v1.0.0</span>
        <div className="avatar">AN</div>
      </div>
    </header>
  )
}
