'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { label: 'Experiments', href: '/'         },
  { label: 'Datasets',    href: '/datasets'  },
  { label: 'Models',      href: '/models'    },
  { label: 'Reports',     href: '/reports'   },
]

export default function Topbar() {
  const pathname = usePathname()

  return (
    <header className="topbar">
      <Link href="/" className="brand">
        <div className="brand-icon">A</div>
        <div className="brand-name">Auto<span>Bench</span></div>
      </Link>

      <nav className="topnav">
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item${pathname === item.href ? ' active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="topbar-right">
        <span className="version-pill">v1.0.0</span>
        <div className="avatar">AN</div>
      </div>
    </header>
  )
}
