'use client'

import { useState, useEffect } from 'react'
import { fetchExperiments } from '@/lib/api'

export function useExperiments() {
  const [experiments, setExperiments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')

  useEffect(() => {
    let cancelled = false

    fetchExperiments()
      .then(data => { if (!cancelled) setExperiments(data) })
      .catch(() => {
        if (!cancelled) setError('Could not reach the backend. Is FastAPI running on port 8000?')
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [])

  return { experiments, loading, error }
}