'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Settings, LogOut, RotateCcw } from 'lucide-react'
import { NAV } from './nav'
import { toast } from './ui'

const spring = { type: 'spring', stiffness: 400, damping: 30 }
const soft   = { type: 'spring', stiffness: 260, damping: 18, mass: 0.6 }
const pop = {
  initial: { opacity: 0, x: -8, scale: 0.97 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -8, transition: { duration: 0.12 } },
  transition: spring,
}

export default function IconRail({ theme, setTheme }) {
  const path = usePathname() || ''
  const router = useRouter()
  const [open, setOpen] = useState(null) // 'set' | 'out' | null
  const dock = useRef(null)

  useEffect(() => {
    const onDown = e => { if (dock.current && !dock.current.contains(e.target)) setOpen(null) }
    const onKey = e => { if (e.key === 'Escape') setOpen(null) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [])

  const resetPrefs = () => {
    Object.keys(localStorage).filter(k => k.startsWith('ab-')).forEach(k => localStorage.removeItem(k))
    location.reload()
  }

  // No auth in this app yet: clear this device's saved preferences and go home.
  // Swap this body for your real sign-out call when you add auth.
  const disconnect = () => {
    Object.keys(localStorage).filter(k => k.startsWith('ab-')).forEach(k => localStorage.removeItem(k))
    setOpen(null)
    toast('Disconnected', 'info')
    router.push('/')
  }

  const enter = i => ({ initial: { opacity: 0, x: -16 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.45, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] } })

  return (
    <aside className="abs-rail">
      <motion.div className="abs-pill theme" {...enter(0)}>
        {[['light', Sun], ['dark', Moon]].map(([t, Icon]) => (
          <motion.button
            key={t}
            className={theme === t ? 'on' : ''}
            onClick={e => setTheme(t, { x: e.clientX, y: e.clientY })}
            aria-label={`${t} theme`}
            data-tip={`${t[0].toUpperCase()}${t.slice(1)} theme`}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.9 }}
            transition={soft}
          >
            <motion.span
              style={{ display: 'grid' }}
              animate={{ rotate: theme === t ? 0 : -90, scale: theme === t ? 1 : 0.85 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            >
              <Icon size={20} />
            </motion.span>
          </motion.button>
        ))}
      </motion.div>

      <motion.nav className="abs-pill" aria-label="Main" {...enter(1)}>
        {NAV.map(({ href, label, Icon }) => {
          const on = path.startsWith(href)
          return (
            <Link key={href} href={href} data-tip={label} aria-label={label} className={on ? 'on' : ''}>
              {on && <motion.i layoutId="rail-active" className="abs-ind" transition={spring} />}
              <motion.span whileHover={{ y: -2, scale: 1.12 }} whileTap={{ scale: 0.9 }} transition={soft}>
                <Icon size={20} />
              </motion.span>
            </Link>
          )
        })}
      </motion.nav>

      <motion.div className="abs-dock" ref={dock} {...enter(2)}>
        <div className="abs-pill">
          <motion.button
            className={open === 'set' ? 'on' : ''} onClick={() => setOpen(o => (o === 'set' ? null : 'set'))}
            aria-label="Settings" aria-expanded={open === 'set'} data-tip="Settings"
            whileHover={{ y: -3 }} whileTap={{ scale: 0.9 }} transition={soft}
          >
            <motion.span style={{ display: 'grid' }} animate={{ rotate: open === 'set' ? 90 : 0 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
              <Settings size={20} />
            </motion.span>
          </motion.button>
          <motion.button
            className={`danger${open === 'out' ? ' on' : ''}`} onClick={() => setOpen(o => (o === 'out' ? null : 'out'))}
            aria-label="Disconnect" aria-expanded={open === 'out'} data-tip="Disconnect"
            whileHover={{ y: -3 }} whileTap={{ scale: 0.9 }} transition={soft}
          >
            <LogOut size={20} />
          </motion.button>
        </div>

        <AnimatePresence>
          {open === 'set' && (
            <motion.div key="set" className="abs-rpop" {...pop}>
              <b>Settings</b>
              <div className="abs-sl">Appearance</div>
              <div className="abs-seg">
                {['light', 'dark'].map(t => (
                  <button key={t} className={theme === t ? 'on' : ''} onClick={e => setTheme(t, { x: e.clientX, y: e.clientY })}>
                    {t === 'light' ? <Sun size={13} /> : <Moon size={13} />} {t[0].toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              <div className="abs-sl">Shortcuts</div>
              <p className="abs-lbl" style={{ lineHeight: 2 }}>
                <kbd>/</kbd> Search &nbsp; <kbd>T</kbd> Theme &nbsp; <kbd>Esc</kbd> Close
              </p>
              <button className="abs-rbtn full" onClick={resetPrefs}><RotateCcw size={13} /> Reset preferences</button>
            </motion.div>
          )}
          {open === 'out' && (
            <motion.div key="out" className="abs-rpop" {...pop}>
              <b>Disconnect?</b>
              <p className="abs-lbl">This clears the preferences saved on this device and returns you to the home page.</p>
              <div className="abs-rrow">
                <button className="abs-rbtn" onClick={() => setOpen(null)}>Cancel</button>
                <button className="abs-rbtn danger" onClick={disconnect}><LogOut size={13} /> Disconnect</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </aside>
  )
}