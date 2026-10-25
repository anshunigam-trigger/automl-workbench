'use client'

import { useState, useEffect } from 'react'
import { flushSync } from 'react-dom'
import { MotionConfig, AnimatePresence, motion } from 'framer-motion'
import { WifiOff } from 'lucide-react'
import AppHeader from '@/components/AppHeader'
import IconRail from '@/components/IconRail'
import CommandPalette from '@/components/CommandPalette'
import { Toaster } from '@/components/ui'
import './shell.css'
import './ui.css'

export default function AppLayout({ children }) {
  const [theme, setTheme]   = useState('light')
  const [cmd, setCmd]       = useState(false)
  const [online, setOnline] = useState(true)

  // Always start at the top on load / reload (the browser would restore the old scroll position)
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    setOnline(navigator.onLine)
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  useEffect(() => {
    // Light unless the user has explicitly chosen dark (we don't follow the OS setting)
    setTheme(localStorage.getItem('ab-theme') === 'dark' ? 'dark' : 'light')
  }, [])

  // Keep the app's theme from leaking onto other routes (e.g. the landing page)
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('abs-gutter')
    return () => {
      root.classList.remove('abs-gutter', 'vt', 'theming')
      root.removeAttribute('data-theme')
      root.style.colorScheme = ''
    }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  }, [theme])

  // Update React state and the <html> attribute together, synchronously
  const apply = t => {
    flushSync(() => setTheme(t))
    document.documentElement.dataset.theme = t
    document.documentElement.style.colorScheme = t
  }

  // Theme switch with a circular reveal from the click point.
  // Falls back to a soft colour fade, or an instant switch for reduced motion.
  const choose = (t, origin) => {
    if (t === theme) return
    localStorage.setItem('ab-theme', t)
    const root = document.documentElement

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return apply(t)

    if (!document.startViewTransition) {
      root.classList.add('theming')
      apply(t)
      setTimeout(() => root.classList.remove('theming'), 450)
      return
    }

    const x = origin?.x ?? innerWidth / 2
    const y = origin?.y ?? innerHeight / 2
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))

    root.classList.add('vt')
    const vt = document.startViewTransition(() => apply(t))
    vt.ready
      .then(() =>
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          { duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' }
        )
      )
      .catch(() => {})
    vt.finished.finally(() => root.classList.remove('vt'))
  }

  // Shortcuts: / or Ctrl/⌘ K = search, T = theme, Esc = close
  useEffect(() => {
    const onKey = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmd(c => !c); return }
      if (e.key === 'Escape') { setCmd(false); return }
      if (/input|textarea|select/i.test(e.target.tagName) || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === '/') { e.preventDefault(); setCmd(true) }
      else if (e.key === 't' || e.key === 'T') choose(theme === 'dark' ? 'light' : 'dark')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <MotionConfig reducedMotion="user">
      <div className="abs">
        <AppHeader onSearch={() => setCmd(true)} />
        <div className="abs-body">
          <IconRail theme={theme} setTheme={choose} />
          <main className="abs-main">{children}</main>
        </div>

        <CommandPalette open={cmd} onClose={() => setCmd(false)} />
        <Toaster />

        <div className="abs-offwrap">
          <AnimatePresence>
            {!online && (
              <motion.div
                className="abs-offline" role="status"
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <WifiOff size={15} /> You’re offline. Data on screen may be out of date.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  )
}