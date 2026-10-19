'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'

export default function AppLayout({ children }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar open={open} setOpen={setOpen} />
      <main className="main-content">
        <Topbar open={open} setOpen={setOpen} />
        {children}
      </main>
    </div>
  )
}