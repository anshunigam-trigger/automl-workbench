'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_MAIN = [
  { label: 'Experiments', href: '/',         icon: '⚗️', count: 5  },
  { label: 'Datasets',    href: '/datasets', icon: '🗄️', count: 6  },
  { label: 'Models',      href: '/models',   icon: '🧠', count: 12 },
  { label: 'Reports',     href: '/reports',  icon: '📊', count: null },
]

const NAV_TOOLS = [
  { label: 'AI Advisor', icon: '✨' },
  { label: 'Predict',    icon: '🎯' },
  { label: 'Compare',    icon: '⚖️' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sidebar">

      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">A</div>
        <div className="sidebar-name">Auto<span>Bench</span></div>
      </div>

      {/* Navigation */}
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
            {item.count && (
              <span className="sidebar-count">{item.count}</span>
            )}
          </Link>
        ))}

        <div className="sidebar-section" style={{ marginTop: '16px' }}>
          Coming soon
        </div>

        {NAV_TOOLS.map(item => (
          <div key={item.label} className="sidebar-item disabled">
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
            <span className="sidebar-soon">Soon</span>
          </div>
        ))}

      </nav>

      {/* Footer */}
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
  )
}