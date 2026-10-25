'use client'

// app/(app)/error.jsx: catches crashes inside any page and offers a retry
import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertTriangle, RotateCw } from 'lucide-react'

export default function PageError({ error, reset }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="page-content">
    <motion.div
      className="ab-card ab-errstate" role="alert"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
    >
      <motion.div className="ab-erric" animate={{ rotate: [0, -10, 10, -5, 0] }} transition={{ duration: 0.6, delay: 0.3 }}>
        <AlertTriangle size={22} />
      </motion.div>
      <b>Something went wrong on this page</b>
      <p className="ab-lbl">{error?.message || 'An unexpected error occurred.'}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="ab-btn dark fit" onClick={() => reset()}><RotateCw size={15} /> Try again</button>
        <Link href="/dashboard" className="ab-btn fit">Go to overview</Link>
      </div>
    </motion.div>
    </div>
  )
}