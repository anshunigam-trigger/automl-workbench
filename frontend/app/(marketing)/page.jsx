import Link from 'next/link'
import HeroDemo from '@/components/landing/HeroDemo'

const GITHUB = 'https://github.com/anshunigam-trigger/automl-workbench'

const STATS = [
  { value: '12',   label: 'Algorithms'    },
  { value: '2',    label: 'Task types'    },
  { value: '0',    label: 'Lines of code' },
  { value: 'Free', label: 'Open source'   },
]

export default function LandingPage() {
  return (
    <>
      <header className="lp-nav">
        <div className="lp-wrap lp-nav-inner">
          <Link href="/" className="lp-brand">
            <span className="lp-logo">A</span>
            <span className="lp-brand-name">AutoBench</span>
          </Link>

          <nav className="lp-links" aria-label="Primary">
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#roadmap">Roadmap</a>
          </nav>

          <div className="lp-nav-cta">
            <a className="lp-btn line sm lp-gh" href={GITHUB} target="_blank" rel="noreferrer">GitHub</a>
            <Link href="/dashboard" className="lp-btn solid sm">Open app →</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="lp-wrap lp-hero">
          <div className="lp-eyebrow">No-code AutoML</div>

          <h1 className="lp-title">
            Find the best<br />
            model before<br />
            lunch.
          </h1>

          <p className="lp-sub">
            Upload a CSV, choose your algorithms, and AutoBench cleans the data, trains every
            model and ranks them with real metrics. No code, no notebook.
          </p>

          <div className="lp-cta">
            <Link href="/experiments" className="lp-btn solid">Start an experiment →</Link>
            <a className="lp-btn line" href={GITHUB} target="_blank" rel="noreferrer">View source</a>
          </div>

          <HeroDemo />
        </section>

        <section className="lp-band" aria-label="At a glance">
          <div className="lp-wrap lp-stats">
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
    </>
  )
}