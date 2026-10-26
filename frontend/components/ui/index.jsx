'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, animate, AnimatePresence } from 'framer-motion'
import { Plus, Inbox, AlertTriangle, RotateCw, CheckCircle2, Info } from 'lucide-react'

export const ease = [0.22, 1, 0.36, 1]
export const list = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
export const rise = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } } }

export function CountUp({ to, decimals = 0, suffix = '' }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    const c = animate(0, to, { duration: 1.1, ease: 'easeOut', onUpdate: setV })
    return () => c.stop()
  }, [to])
  return <>{v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</>
}

// Page wrapper: staggered entrance + heading row
export function Page({ title, sub, action, crumbs, children }) {
  return (
    <motion.div className="page-content" variants={list} initial="hidden" animate="show">
      <motion.header className="ab-head" variants={rise}>
        <div>
          {crumbs && (
            <nav className="ab-crumbs" aria-label="Breadcrumb">
              {crumbs.map((c, i) => (
                <span key={c.label}>
                  {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
                  {i < crumbs.length - 1 && <i aria-hidden="true">/</i>}
                </span>
              ))}
            </nav>
          )}
          <h1 className="ab-title">{title}</h1>
          <p className="ab-sub">{sub}</p>
        </div>
        {action}
      </motion.header>
      {children}
    </motion.div>
  )
}

// `inView` = reveal when scrolled into view (for sections below the fold)
export function Card({ className = '', inView, children, ...rest }) {
  const view = inView
    ? { initial: 'hidden', animate: 'hidden', whileInView: 'show', viewport: { once: true, margin: '0px 0px -50px 0px' } }
    : {}
  return (
    <motion.div className={`ab-card ab-mb ${className}`} variants={rise} {...view} {...rest}>
      {children}
    </motion.div>
  )
}

export function Tile({ label, sub, hot, children }) {
  return (
    <motion.div
      className={`ab-tile${hot ? ' hot' : ''}`} variants={rise}
      whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 400, damping: 26 }}
    >
      <div className="ab-lbl">{label}</div>
      <div className="ab-big">{children}</div>
      {sub && <div className="ab-lbl">{sub}</div>}
    </motion.div>
  )
}

/* ── States ── */

export function Empty({ title, text, href, cta }) {
  return (
    <Card className="ab-empty">
      <motion.div className="ab-emptyic" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
        <Inbox size={26} />
      </motion.div>
      <b>{title}</b>
      <p className="ab-lbl">{text}</p>
      {href && <Link href={href} className="ab-btn dark fit"><Plus size={16} /> {cta}</Link>}
    </Card>
  )
}

export function ErrorState({ title = 'Couldn’t load your data', text, onRetry }) {
  const [busy, setBusy] = useState(false)
  const retry = async () => {
    setBusy(true)
    try { await (onRetry ? onRetry() : window.location.reload()) }
    finally { setTimeout(() => setBusy(false), 700) }
  }
  return (
    <motion.div
      className="ab-alert" role="alert"
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease }}
    >
      <span className="ab-alert-ic"><AlertTriangle size={15} /></span>
      <div className="ab-alert-tx">
        <b>{title}</b>
        <span>{text || 'Check that the backend is running, then try again.'}</span>
      </div>
      <button className="ab-btn sm" onClick={retry} disabled={busy}>
        <RotateCw size={13} className={busy ? 'ab-spin' : ''} /> {busy ? 'Retrying…' : 'Retry'}
      </button>
    </motion.div>
  )
}

/* ── Toasts: toast('Saved', 'success' | 'error' | 'info') from anywhere ── */

export const toast = (text, type = 'info') => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('ab-toast', { detail: { text, type, id: Date.now() + Math.random() } }))
}

const TOAST_ICON = { success: CheckCircle2, error: AlertTriangle, info: Info }

export function Toaster() {
  const [items, setItems] = useState([])
  useEffect(() => {
    const on = e => {
      const t = e.detail
      setItems(p => [...p.slice(-2), t])
      setTimeout(() => setItems(p => p.filter(x => x.id !== t.id)), 3500)
    }
    window.addEventListener('ab-toast', on)
    return () => window.removeEventListener('ab-toast', on)
  }, [])

  return (
    <div className="ab-toasts" aria-live="polite">
      <AnimatePresence>
        {items.map(t => {
          const I = TOAST_ICON[t.type] || Info
          return (
            <motion.div
              key={t.id} layout className={`ab-toast ${t.type}`}
              initial={{ opacity: 0, y: 24, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 40 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <I size={16} /> {t.text}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}