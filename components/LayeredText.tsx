"use client"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import type React from "react"

interface LayeredTextProps {
  lines?: Array<{ top: string; bottom: string }>
  fontSize?: string
  fontSizeMd?: string
  lineHeight?: number
  lineHeightMd?: number
  className?: string
}

export function LayeredText({ lines = [{ top: "\u00A0", bottom: "INFINITE" }, { top: "INFINITE", bottom: "PROGRESS" }, { top: "PROGRESS", bottom: "INNOVATION" }, { top: "INNOVATION", bottom: "FUTURE" }, { top: "FUTURE", bottom: "DREAMS" }, { top: "DREAMS", bottom: "ACHIEVEMENT" }, { top: "ACHIEVEMENT", bottom: "\u00A0" }], fontSize = "72px", lineHeight = 60, className = "" }: LayeredTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  const calculateTranslateX = (index: number) => {
    const baseOffset = 35
    const centerIndex = Math.floor(lines.length / 2)
    return { desktop: (index - centerIndex) * baseOffset }
  }

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    const paragraphs = container.querySelectorAll("p")
    timelineRef.current = gsap.timeline({ paused: true })
    timelineRef.current.to(paragraphs, { y: -60, duration: 0.8, ease: "power2.out", stagger: 0.08 })
    const handleMouseEnter = () => { timelineRef.current?.play() }
    const handleMouseLeave = () => { timelineRef.current?.reverse() }
    container.addEventListener("mouseenter", handleMouseEnter)
    container.addEventListener("mouseleave", handleMouseLeave)
    return () => {
      container.removeEventListener("mouseenter", handleMouseEnter)
      container.removeEventListener("mouseleave", handleMouseLeave)
      timelineRef.current?.kill()
    }
  }, [lines])

  return (
    <div ref={containerRef} className={`mx-auto py-24 font-sans font-black tracking-[-2px] uppercase text-black dark:text-white antialiased cursor-pointer ${className}`} style={{ fontSize }}>
      <ul className="list-none p-0 m-0 flex flex-col items-center">
        {lines.map((line, index) => {
          const translateX = calculateTranslateX(index)
          return (
            <li key={index} className="overflow-hidden relative" style={{ height: `${lineHeight}px`, transform: `translateX(${translateX.desktop}px) skew(${index % 2 === 0 ? "60deg, -30deg" : "0deg, -30deg"}) scaleY(${index % 2 === 0 ? "0.66667" : "1.33333"})` }}>
              <p className="px-[15px] align-top whitespace-nowrap m-0" style={{ height: `${lineHeight}px`, lineHeight: `${lineHeight - 5}px` }}>{line.top}</p>
              <p className="px-[15px] align-top whitespace-nowrap m-0" style={{ height: `${lineHeight}px`, lineHeight: `${lineHeight - 5}px` }}>{line.bottom}</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
