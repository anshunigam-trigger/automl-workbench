// app/not-found.jsx: 404 for any unknown URL
import Link from 'next/link'
import './shell.css'
import './ui.css'

export default function NotFound() {
  return (
    <div className="abs" style={{ display: 'grid', placeItems: 'center', padding: 24 }}>
      <div className="ab-card ab-errstate" style={{ maxWidth: 420, width: '100%' }}>
        <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: '-.04em', color: 'var(--ab-acc)' }}>404</div>
        <b>We couldn’t find that page</b>
        <p className="ab-lbl">The link may be broken, or the page may have moved.</p>
        <Link href="/dashboard" className="ab-btn dark fit">Back to overview</Link>
      </div>
    </div>
  )
}