'use client'

import { STEPS } from '@/lib/constants'

export default function Stepper({ currentStep }) {
  return (
    <div className="stepper">
      {STEPS.map((step, i) => {
        const isDone   = currentStep > step.n
        const isActive = currentStep === step.n

        return (
          <div
            key={step.n}
            style={{ display: 'flex', flex: 1, alignItems: 'center' }}
          >
            <div className={`stepper-item${isActive ? ' active' : isDone ? ' done' : ''}`} style={{ flex: 1 }}>
              <div className={`s-num${isActive ? ' active' : isDone ? ' done' : ''}`}>
                {isDone ? '✓' : step.n}
              </div>
              <div className="s-info">
                <div className="s-label">{step.label}</div>
                <div className="s-desc">{step.desc}</div>
              </div>
            </div>
            {i < STEPS.length - 1 && <div className="s-divider" />}
          </div>
        )
      })}
    </div>
  )
}
