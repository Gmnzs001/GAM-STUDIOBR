'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { motion } from 'framer-motion'

const TARGET = 'SUA MARCA NO PRÓXIMO NÍVEL'
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%ÇÃÕ!?'

function useScramble(target: string, delay = 350) {
  const [text, setText] = useState(() => target.replace(/[^ ]/g, CHARS[0]))

  useEffect(() => {
    let frame = 0
    const total = 38
    let interval: ReturnType<typeof setInterval>

    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        const progress = frame / total
        const revealed = Math.floor(progress * target.length)
        setText(
          target
            .split('')
            .map((ch, i) => {
              if (ch === ' ') return ' '
              if (i < revealed) return ch
              return CHARS[Math.floor(Math.random() * CHARS.length)]
            })
            .join('')
        )
        frame++
        if (frame > total) {
          clearInterval(interval)
          setText(target)
        }
      }, 42)
    }, delay)

    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [target, delay])

  return text
}

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scrambled = useScramble(TARGET, 350)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
    camera.position.z = 6

    const COUNT = 2000
    const positions = new Float32Array(COUNT * 3)
    const colors = new Float32Array(COUNT * 3)

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 26
      positions[i * 3 + 1] = (Math.random() - 0.5) * 26
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14

      if (Math.random() < 0.12) {
        colors[i * 3] = 0.88; colors[i * 3 + 1] = 0.13; colors[i * 3 + 2] = 0.13
      } else {
        const b = 0.55 + Math.random() * 0.45
        colors[i * 3] = b; colors[i * 3 + 1] = b; colors[i * 3 + 2] = b
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.PointsMaterial({ size: 0.034, vertexColors: true, transparent: true, opacity: 0.72, sizeAttenuation: true })
    const pts = new THREE.Points(geo, mat)
    scene.add(pts)

    const mouse = { x: 0, y: 0 }
    const smooth = { x: 0, y: 0 }

    const onMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    const onResize = () => {
      renderer.setSize(canvas.clientWidth, canvas.clientHeight)
      camera.aspect = canvas.clientWidth / canvas.clientHeight
      camera.updateProjectionMatrix()
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('resize', onResize)

    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      smooth.x += (mouse.x - smooth.x) * 0.03
      smooth.y += (mouse.y - smooth.y) * 0.03
      pts.rotation.y += 0.00028 + smooth.x * 0.0007
      pts.rotation.x += smooth.y * 0.0004
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', onResize)
      geo.dispose()
      mat.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Bottom gradient fade to next section */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/10 via-transparent to-[#0A0A0A] pointer-events-none" />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.p
          className="text-[#A0A0A0] text-xs tracking-[0.35em] uppercase mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
        >
          Goiânia · Brasil · BR · USA · EUR
        </motion.p>

        <motion.h1
          className="font-black leading-[1.04] text-white mb-6 tracking-tight"
          style={{ fontSize: 'clamp(2rem, 5.5vw, 5.2rem)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          {scrambled.split(' ').map((word, i) => (
            <span key={i} className="inline-block mr-[0.22em]">
              {word === 'PRÓXIMO' || word === 'NÍVEL' ? (
                <span className="text-[#E02020]">{word}</span>
              ) : word}
            </span>
          ))}
        </motion.h1>

        <motion.p
          className="text-[#A0A0A0] text-sm md:text-base tracking-[0.28em] uppercase mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.5 }}
        >
          presença · estrutura · previsibilidade
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.65 }}
        >
          <a
            href="https://wa.me/5562981147673"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-[#E02020] text-white font-bold px-8 py-4 rounded-lg text-base hover:bg-[#C01010] transition-colors animate-pulse"
            style={{ boxShadow: '0 0 32px rgba(224,32,32,0.35)' }}
          >
            Falar com a GAM Studio
          </a>
          <a
            href="#servicos"
            className="inline-flex items-center justify-center border border-[#333333] text-white font-semibold px-8 py-4 rounded-lg text-base hover:border-[#E02020] hover:text-[#E02020] transition-all duration-300"
          >
            Ver serviços
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.55, delay: 1 }}
      >
        <span className="text-[#A0A0A0] text-[10px] tracking-widest uppercase">scroll</span>
        <motion.div
          className="w-px h-7 bg-gradient-to-b from-[#E02020] to-transparent"
          animate={{ scaleY: [1, 0.25, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
