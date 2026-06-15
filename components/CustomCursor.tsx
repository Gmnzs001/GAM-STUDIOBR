'use client'

import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: -100, y: -100 })
  const current = useRef({ x: -100, y: -100 })
  const [isHovering, setIsHovering] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show on pointer:fine devices (not touch)
    if (!window.matchMedia('(pointer: fine)').matches) return

    setVisible(true)

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
    }

    const onEnter = () => setIsHovering(true)
    const onLeave = () => setIsHovering(false)

    window.addEventListener('mousemove', onMove)

    // Observe DOM changes so newly mounted links get listeners
    const attachListeners = () => {
      document.querySelectorAll('a, button').forEach((el) => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }
    attachListeners()
    const observer = new MutationObserver(attachListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    let rafId: number
    const animate = () => {
      current.current.x += (pos.current.x - current.current.x) * 0.12
      current.current.y += (pos.current.y - current.current.y) * 0.12
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${current.current.x}px, ${current.current.y}px)`
      }
      rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [])

  if (!visible) return null

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{ willChange: 'transform' }}
    >
      <div
        className="rounded-full border-2 border-[#E02020] transition-all duration-200 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: isHovering ? '44px' : '22px',
          height: isHovering ? '44px' : '22px',
          backgroundColor: isHovering ? 'rgba(224,32,32,0.12)' : 'transparent',
        }}
      />
    </div>
  )
}
