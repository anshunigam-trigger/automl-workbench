'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Topbar({ open, setOpen }) {
  const [search, setSearch] = useState('')

  return (
    <div className="topbar">

      {/* Hamburger — mobile only, now lives inside topbar */}
      <button
        className="hamburger-btn"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        <span className={`ham-line ${open ? 'open' : ''}`} />
        <span className={`ham-line ${open ? 'open' : ''}`} />
        <span className={`ham-line ${open ? 'open' : ''}`} />
      </button>

      <div className="topbar-search">
        <span className="topbar-search-icon">🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search experiments, models, datasets..."
        />
      </div>

      <div className="topbar-right">
        <span className="topbar-version">v1.0.0</span>
        <button className="topbar-icon-btn" aria-label="Notifications">🔔</button>
        <button className="topbar-icon-btn" aria-label="Settings">⚙️</button>
        <Link href="/experiments" className="btn primary" style={{ padding: '7px 14px', fontSize: 12 }}>
          + New Experiment
        </Link>
      </div>
    </div>
  )
}