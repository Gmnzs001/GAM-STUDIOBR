'use client'

import React from 'react'
import { motion } from 'framer-motion'

type TestimonialItem = {
  text: string
  name: string
  role: string
  initial: string
}

export const TestimonialsColumn = (props: {
  className?: string
  testimonials: TestimonialItem[]
  duration?: number
  reverse?: boolean
}) => {
  const dir = props.reverse ? '0%' : '-50%'

  return (
    <div className={`overflow-hidden ${props.className ?? ''}`}>
      <motion.div
        animate={{ translateY: dir }}
        initial={{ translateY: props.reverse ? dir : '0%' }}
        transition={{ duration: props.duration ?? 15, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
        className="flex flex-col gap-4 pb-4"
      >
        {[0, 1].map((pass) => (
          <React.Fragment key={pass}>
            {props.testimonials.map(({ text, name, role, initial }, i) => (
              <div
                key={`${pass}-${i}`}
                className="bg-[#111111] border border-[#222222] rounded-2xl p-6 w-[280px] relative overflow-hidden"
                style={{ boxShadow: '0 4px 24px rgba(224,32,32,0.05)' }}
              >
                {/* Quote decoration */}
                <div className="absolute top-3 right-5 text-5xl text-[#E02020]/10 font-black leading-none select-none">
                  "
                </div>

                <p className="text-[#E8E8EC] text-sm leading-relaxed mb-5 relative z-10">
                  "{text}"
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E02020] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {initial}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm leading-tight">{name}</div>
                    <div className="text-[#9898A4] text-xs mt-0.5">{role}</div>
                  </div>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-[#E02020]/30 via-transparent to-transparent" />
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  )
}
