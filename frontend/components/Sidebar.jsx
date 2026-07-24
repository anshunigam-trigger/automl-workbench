'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const NAV_MAIN = [
  { label: 'Dashboard',   href: '/dashboard', icon: '◈',  count: null },
  { label: 'Experiments', href: '/',          icon: '⚗️', count: 5   },
  { label: 'Datasets',    href: '/datasets',  icon: '🗄️', count: 6   },
  { label: 'Models',      href: '/models',    icon: '🧠', count: 12  },
  { label: 'Reports',     href: '/reports',   icon: '📊', count: null },
]

const NAV_TOOLS = [
  { label: 'AI Advisor', icon: '✨' },
  { label: 'Predict',    icon: '🎯' },
  { label: 'Compare',    icon: '⚖️' },
]

export default function Sidebar() {
  const pathname  = usePathname()
  const [open, setOpen] = useState(false)

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close sidebar on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <>
      {/* ── Hamburger button ── */}
      <button
  className={`hamburger-btn${open ? ' hamburger-hidden' : ''}`}
  onClick={() => setOpen(o => !o)}
  aria-label={open ? 'Close menu' : 'Open menu'}
>
  <span className={`ham-line ${open ? 'open' : ''}`} />
  <span className={`ham-line ${open ? 'open' : ''}`} />
  <span className={`ham-line ${open ? 'open' : ''}`} />
</button>

      {/* ── Backdrop ── */}
      <div
        className={`mob-backdrop ${open ? 'mob-backdrop-show' : ''}`}
        onClick={() => setOpen(false)}
      />

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>

        <div className="sidebar-brand">
  <div className="sidebar-logo">A</div>
  <div className="sidebar-name">Auto<span>Bench</span></div>
  
</div>


        <nav className="sidebar-nav">
          <div className="sidebar-section">Workspace</div>

          {NAV_MAIN.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item${pathname === item.href ? ' active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
              {item.count && <span className="sidebar-count">{item.count}</span>}
            </Link>
          ))}

          <div className="sidebar-section" style={{ marginTop: '16px' }}>Coming soon</div>

          {NAV_TOOLS.map(item => (
            <div key={item.label} className="sidebar-item disabled">
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
              <span className="sidebar-soon">Soon</span>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-version">v1.0.0 · Phase 1</div>
          <div className="sidebar-user">
            <div className="sidebar-avatar">AN</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Anshu Nigam</div>
              <div className="sidebar-user-role">Free Plan</div>
            </div>
          </div>
        </div>

      </aside>
    </>
  )
}