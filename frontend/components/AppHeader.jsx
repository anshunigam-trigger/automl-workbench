'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, Info } from 'lucide-react'
import { useExperiments } from '@/lib/useExperiments'
import { timeAgo, formatScore, modelName } from '@/lib/format'
import { NAV } from './nav'

const pop = {
  initial: { opacity: 0, y: -8, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
  transition: { type: 'spring', stiffness: 380, damping: 28 },
}

function IconBtn({ label, onClick, children }) {
  return (
    <motion.button
      className="abs-ib" aria-label={label} title={label} onClick={onClick}
      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
    >
      {children}
    </motion.button>
  )
}

export default function AppHeader({ onSearch }) {
  const path = usePathname() || ''
  const { experiments } = useExperiments()
  const [panel, setPanel] = useState(null) // 'bell' | 'info' | null
  const [seen, setSeen] = useState(0)
  const [mod, setMod] = useState('Ctrl')
  const box = useRef(null)
  const bar = useRef(null)

  useEffect(() => {
    setSeen(Number(localStorage.getItem('ab-seen') || 0))
    setMod(/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl')
  }, [])

  // Publish the header's real height so the sidebar and content always sit right below it
  useEffect(() => {
    const el = bar.current
    if (!el) return
    const set = () => document.documentElement.style.setProperty('--abs-hh', `${el.offsetHeight}px`)
    set()
    const ro = new ResizeObserver(set)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const onDown = e => { if (box.current && !box.current.contains(e.target)) setPanel(null) }
    const onKey = e => { if (e.key === 'Escape') setPanel(null) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const recent = experiments.slice(0, 3)
  const newest = recent[0] ? new Date(recent[0].created_at).getTime() : 0
  const unread = newest > seen

  const toggle = name => {
    setPanel(p => (p === name ? null : name))
    if (name === 'bell' && unread) {
      const now = Date.now()
      localStorage.setItem('ab-seen', String(now))
      setSeen(now)
    }
  }

  return (
    <motion.header
      ref={bar}
      className="abs-top"
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <Link href="/dashboard" className="abs-logo">
        <motion.i whileHover={{ rotate: -8, scale: 1.08 }} whileTap={{ scale: 0.92 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>A</motion.i>
        AutoBench
      </Link>

      <nav className="abs-nav" aria-label="Sections">
        {NAV.map(({ href, label }) => {
          const on = path.startsWith(href)
          return (
            <Link key={href} href={href} className={on ? 'on' : ''}>
              {on && <motion.i layoutId="nav-active" className="abs-ind" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="abs-hq" ref={box}>
        <div className="abs-tp">
          <motion.button className="abs-sbtn" onClick={onSearch} whileTap={{ scale: 0.97 }} aria-label="Search (/ or Ctrl K)">
            <Search size={16} />
            <span className="abs-sbtxt">Search…</span>
            <kbd>{mod} K</kbd>
          </motion.button>
          <IconBtn label="Notifications" onClick={() => toggle('bell')}>
            <motion.span style={{ display: 'grid', transformOrigin: '50% 10%' }} whileHover={{ rotate: [0, -14, 12, -8, 4, 0] }} transition={{ duration: 0.6 }}>
              <Bell size={20} />
            </motion.span>
            <AnimatePresence>
              {unread && <motion.span className="abs-dot" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} />}
            </AnimatePresence>
          </IconBtn>
          <IconBtn label="Shortcuts" onClick={() => toggle('info')}>
            <Info size={20} />
          </IconBtn>
        </div>

        <AnimatePresence>
          {panel === 'bell' && (
            <motion.div key="bell" className="abs-pop" {...pop}>
              <b>Notifications</b>
              {recent.length === 0 ? (
                <p className="abs-lbl">Nothing yet. Run an experiment and it will show up here.</p>
              ) : (
                <ul className="abs-feed">
                  {recent.map((e, i) => (
                    <motion.li key={e.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.06 }}>
                      <Link href="/reports" onClick={() => setPanel(null)}>
                        {e.dataset} finished
                        <small>{e.best ? modelName(e.best.id, e.task) : 'No results'} · {formatScore(e.best, e.task)} · {timeAgo(e.created_at)}</small>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
          {panel === 'info' && (
            <motion.div key="info" className="abs-pop" {...pop}>
              <b>Shortcuts</b>
              <p className="abs-lbl" style={{ lineHeight: 2, margin: '8px 0 0' }}>
                <kbd>/</kbd> or <kbd>{mod} K</kbd> Search<br />
                <kbd>T</kbd> Toggle theme &nbsp; <kbd>Esc</kbd> Close
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="abs-user">
        <div className="abs-av">AN</div>
        <div><b>Anshu Nigam</b><small>AutoBench workspace</small></div>
      </div>

    </motion.header>
  )
}