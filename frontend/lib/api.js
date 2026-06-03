const BASE_URL = 'http://localhost:8000'

/**
 * Send CSV + config to FastAPI and get real model scores back
 * @param {{ file: File, target: string, task: string, models: string[] }} params
 * @returns {Promise<{ results: object[], rows: number, features: string[] }>}
 */
export async function trainModels({ file, target, task, models }) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('target', target)
  formData.append('task', task)
  formData.append('models', JSON.stringify(models))

  const response = await fetch(`${BASE_URL}/train`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail ?? `Server error ${response.status}`)
  }

  return response.json()
}

/**
 * Health check — verify FastAPI is running
 * @returns {Promise<boolean>}
 */
export async function checkHealth() {
  try {
    const res = await fetch(`${BASE_URL}/`)
    return res.ok
  } catch {
    return false
  }
}
