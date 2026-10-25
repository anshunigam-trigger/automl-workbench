'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, CornerDownLeft, ArrowUp, ArrowDown, FlaskConical, Layers, Database } from 'lucide-react'
import { useExperiments } from '@/lib/useExperiments'
import { modelName, formatScore } from '@/lib/format'
import { NAV } from './nav'

const ORDER = ['Pages', 'Experiments', 'Models', 'Datasets']

export default function CommandPalette({ open, onClose }) {
  const router = useRouter()
  const { experiments, loading, error } = useExperiments()
  const [q, setQ] = useState('')
  const [i, setI] = useState(0)
  const listRef = useRef(null)

  useEffect(() => { if (open) { setQ(''); setI(0) } }, [open])

  // Everything searchable, built from the same data as the pages
  const all = useMemo(() => {
    const pages = NAV.map(n => ({ group: 'Pages', key: n.href, label: n.label, hint: n.href, Icon: n.Icon, href: n.href, text: n.label }))
    const exps = experiments.map(e => ({
      group: 'Experiments', key: `e${e.id}`, label: e.dataset, Icon: FlaskConical, href: '/reports',
      hint: `#${e.id} · ${e.best ? modelName(e.best.id, e.task) : 'no results'} · ${formatScore(e.best, e.task)}`,
      text: `${e.dataset} ${e.target} ${e.task} ${e.best ? modelName(e.best.id, e.task) : ''} ${e.id}`,
    }))
    const models = experiments.flatMap(e => e.results.map(r => ({
      group: 'Models', key: `m${e.id}-${r.id}`, label: modelName(r.id, e.task), Icon: Layers, href: '/models',
      hint: `${e.dataset} · ${e.task}`, text: `${modelName(r.id, e.task)} ${e.dataset} ${e.task}`,
    })))
    const sets = [...new Set(experiments.map(e => e.dataset))].map(d => ({
      group: 'Datasets', key: `d${d}`, label: d, Icon: Database, href: '/datasets', hint: 'Dataset', text: d,
    }))
    return [...pages, ...exps, ...models, ...sets]
  }, [experiments])

  const query = q.trim().toLowerCase()
  const items = useMemo(() => {
    if (!query) return [...all.filter(x => x.group === 'Pages'), ...all.filter(x => x.group === 'Experiments').slice(0, 4)]
    const out = []
    ORDER.forEach(g => out.push(...all.filter(x => x.group === g && x.text.toLowerCase().includes(query)).slice(0, 5)))
    return out
  }, [all, query])

  useEffect(() => { setI(0) }, [query])
  useEffect(() => { listRef.current?.querySelector('[data-sel="1"]')?.scrollIntoView({ block: 'nearest' }) }, [i])

  const go = item => { if (!item) return; onClose(); router.push(item.href) }
  const onKey = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setI(n => Math.min(items.length - 1, n + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setI(n => Math.max(0, n - 1)) }
    else if (e.key === 'Enter') { e.preventDefault(); go(items[i]) }
    else if (e.key === 'Escape') onClose()
  }

  let n = -1
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cmd-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
          onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            className="cmd" role="dialog" aria-label="Search"
            initial={{ opacity: 0, y: -16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          >
            <div className="cmd-in">
              <Search size={18} />
              <input autoFocus value={q} onChange={e => setQ(e.target.value)} onKeyDown={onKey} placeholder="Search pages, experiments, models, datasets…" aria-label="Search" />
              <kbd>Esc</kbd>
            </div>

            <div className="cmd-list" ref={listRef}>
              {error && <div className="cmd-note">Couldn’t load experiments, so only pages are searchable right now.</div>}
              {loading && query && [0, 1].map(k => <div key={k} className="ab-skel" style={{ margin: '8px 12px' }} />)}

              {items.length === 0 && !loading ? (
                <div className="cmd-empty">
                  <b>No results for “{q}”</b>
                  <p>Try a dataset name or a model such as XGBoost.</p>
                </div>
              ) : ORDER.map(g => {
                const rows = items.filter(x => x.group === g)
                if (!rows.length) return null
                return (
                  <div key={g}>
                    <div className="cmd-g">{!query && g === 'Experiments' ? 'Recent experiments' : !query && g === 'Pages' ? 'Quick links' : g}</div>
                    {rows.map(it => {
                      n += 1
                      const idx = n
                      const sel = idx === i
                      return (
                        <motion.button
                          key={it.key} className="cmd-i" data-sel={sel ? '1' : '0'}
                          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: Math.min(idx, 8) * 0.025 }}
                          onMouseMove={() => setI(idx)} onClick={() => go(it)}
                        >
                          {sel && <motion.span layoutId="cmd-sel" className="cmd-sel" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                          <span className="cmd-ic"><it.Icon size={16} /></span>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span className="cmd-t">{it.label}</span>
                            <small>{it.hint}</small>
                          </span>
                          {sel && <CornerDownLeft size={14} className="cmd-enter" />}
                        </motion.button>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            <div className="cmd-foot">
              <span><ArrowUp size={12} /><ArrowDown size={12} /> navigate</span>
              <span><CornerDownLeft size={12} /> open</span>
              <span style={{ marginLeft: 'auto' }}>{items.length} result{items.length === 1 ? '' : 's'}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
