import Link from 'next/link'
import HeroDemo from '@/components/landing/HeroDemo'
import './landing.css'

const GITHUB = 'https://github.com/anshunigam-trigger/automl-workbench'

const STATS = [
  { value: '12',   label: 'Algorithms'    },
  { value: '2',    label: 'Task types'    },
  { value: '0',    label: 'Lines of code' },
  { value: 'Free', label: 'Open source'   },
]

export default function LandingPage() {
  return (
    <div className="lp">

      {/* ── Navbar ── */}
      <header className="lp-nav">
        <div className="lp-wrap lp-nav-inner">
          <Link href="/" className="lp-brand">
            <div className="lp-logo">A</div>
            <div className="lp-brand-name">Auto<span>Bench</span></div>
          </Link>

          <nav className="lp-links" aria-label="Primary">
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#roadmap">Roadmap</a>
          </nav>

          <div className="lp-nav-cta">
            <a className="btn lp-gh" href={GITHUB} target="_blank" rel="noreferrer">GitHub</a>
            <Link href="/dashboard" className="btn primary">Open app →</Link>
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="lp-wrap lp-hero">
          <div className="lp-eyebrow">No-code AutoML</div>

          <h1 className="lp-title fade-up">
            Find the best model<br />
            <span className="grad">before lunch.</span>
          </h1>

          <p className="lp-sub fade-up-1">
            Upload a CSV, choose your algorithms, and AutoBench cleans the data, trains every
            model and ranks them with real metrics. No code, no notebook.
          </p>

          <div className="lp-cta fade-up-2">
            <Link href="/experiments" className="btn primary">Start an experiment →</Link>
            <a className="btn" href={GITHUB} target="_blank" rel="noreferrer">View source</a>
          </div>

          <div className="fade-up-3">
            <HeroDemo />
          </div>
        </section>

        {/* ── Stat strip ── */}
        <section className="lp-wrap" aria-label="At a glance">
          <div className="lp-stats">
            {STATS.map(s => (
              <div key={s.label} className="lp-stat">
                <div className="lp-stat-val">{s.value}</div>
                <div className="lp-stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Part 2: How it works, Features, Roadmap, closing CTA, footer */}
      </main>
    </div>
  )
}