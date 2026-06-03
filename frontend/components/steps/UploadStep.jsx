'use client'

import { useState } from 'react'

export default function UploadStep({ onFile, error }) {
  const [over, setOver] = useState(false)

  const handleFile = (file) => {
    if (!file) return
    if (!file.name.endsWith('.csv')) {
      onFile(null, 'Please upload a .csv file')
      return
    }
    onFile(file, null)
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">
            <span className="card-title-icon">📂</span>
            Upload Dataset
          </div>
          <div className="card-sub">CSV files only · Any size supported</div>
        </div>
      </div>

      <div
        className={`dropzone${over ? ' over' : ''}`}
        onClick={() => document.getElementById('csv-file').click()}
        onDragOver={e => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={e => { e.preventDefault(); setOver(false); handleFile(e.dataTransfer.files[0]) }}
      >
        <span className="dz-icon">🗄️</span>
        <div className="dz-title">Drag &amp; drop your dataset here</div>
        <div className="dz-sub">or <b>click to browse</b> your files</div>
        <div className="dz-hint">Supported format: .csv</div>
        <input
          type="file"
          id="csv-file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])}
        />
      </div>
    </div>
  )
}
