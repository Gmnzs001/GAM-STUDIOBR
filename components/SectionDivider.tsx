'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function SectionDivider() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <div ref={ref} className="flex justify-center py-1 px-8">
      <motion.div
        className="h-px bg-[#E02020]"
        initial={{ width: 0, opacity: 0 }}
        animate={inView ? { width: 100, opacity: 1 } : {}}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      />
    </div>
  )
}
