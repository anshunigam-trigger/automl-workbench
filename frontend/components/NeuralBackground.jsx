'use client'

import { useEffect, useRef } from 'react'

export default function NeuralBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const COLORS = ['#38BDF8', '#A78BFA', '#F472B6', '#2DD4BF']
    const NUM    = 70

    const particles = Array.from({ length: NUM }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      vx:    (Math.random() - 0.5) * 0.35,
      vy:    (Math.random() - 0.5) * 0.35,
      r:     Math.random() * 1.5 + 0.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      pulse: Math.random() * Math.PI * 2,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x
          const dy   = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 130) {
            const alpha = 0.12 * (1 - dist / 130)
            ctx.beginPath()
            ctx.strokeStyle = `rgba(56,189,248,${alpha})`
            ctx.lineWidth   = 0.6
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      // nodes
      particles.forEach(p => {
        p.pulse += 0.02
        const scale  = 1 + Math.sin(p.pulse) * 0.3
        const radius = p.r * scale

        // glow
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 5)
        grd.addColorStop(0, p.color + '40')
        grd.addColorStop(1, p.color + '00')
        ctx.beginPath()
        ctx.arc(p.x, p.y, radius * 5, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()

        // core dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color + 'CC'
        ctx.fill()

        // move
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
      })

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'fixed',
        inset:         0,
        zIndex:        0,
        opacity:       0.35,
        pointerEvents: 'none',
      }}
    />
  )
}
