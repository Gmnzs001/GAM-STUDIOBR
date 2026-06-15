'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

export default function CTASection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const msg = encodeURIComponent(
      `Olá, GAM Studio!\n\nMeu nome é ${form.name}.\n\n${form.message}\n\nEmail para retorno: ${form.email}`
    )
    window.open(`https://wa.me/5562981147673?text=${msg}`, '_blank')
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <section ref={ref} id="contato" className="relative py-24 px-6 overflow-hidden">
      {/* Animated gradient bg */}
      <motion.div
        className="absolute inset-0 -z-10"
        animate={{
          background: [
            'radial-gradient(ellipse 80% 60% at 20% 50%, #1A0000 0%, #0A0A0A 65%)',
            'radial-gradient(ellipse 80% 60% at 80% 50%, #1A0000 0%, #0A0A0A 65%)',
            'radial-gradient(ellipse 80% 60% at 50% 15%, #1A0000 0%, #0A0A0A 65%)',
            'radial-gradient(ellipse 80% 60% at 20% 50%, #1A0000 0%, #0A0A0A 65%)',
          ],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
      />

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <motion.p
            className="text-[#E02020] text-xs tracking-[0.32em] uppercase font-semibold mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45 }}
          >
            Vamos conversar
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            Pronto para o{' '}
            <span className="text-[#E02020]">próximo nível</span>?
          </motion.h2>
          <motion.p
            className="text-[#A0A0A0] text-sm"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.45, delay: 0.2 }}
          >
            Fale com a gente e descubra como transformar sua presença digital.
          </motion.p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3.5"
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.28 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <input
              type="text"
              placeholder="Seu nome"
              aria-label="Seu nome"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-[#111111] border border-[#222222] text-white placeholder-[#444444] rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:border-[#E02020] transition-colors"
            />
            <input
              type="email"
              placeholder="Seu email"
              aria-label="Seu email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-[#111111] border border-[#222222] text-white placeholder-[#444444] rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:border-[#E02020] transition-colors"
            />
          </div>
          <textarea
            placeholder="Conte sobre seu projeto..."
            aria-label="Mensagem sobre seu projeto"
            required
            rows={4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="bg-[#111111] border border-[#222222] text-white placeholder-[#444444] rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:border-[#E02020] transition-colors resize-none"
          />
          <button
            type="submit"
            className="bg-[#E02020] text-white font-bold py-4 rounded-lg text-sm hover:bg-[#C01010] transition-colors"
            style={{ boxShadow: '0 0 28px rgba(224,32,32,0.28)' }}
          >
            {sent ? 'Abrindo WhatsApp...' : 'Enviar via WhatsApp'}
          </button>
        </motion.form>

        {/* Direct contacts */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-9 pt-9 border-t border-[#1E1E1E]"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.45, delay: 0.45 }}
        >
          <a
            href="https://wa.me/5562981147673"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-[#A0A0A0] hover:text-white transition-colors"
          >
            <span className="text-[#E02020] font-semibold">WhatsApp</span>
            <span>62 98114-7673</span>
          </a>
          <div className="hidden sm:block w-px h-4 bg-[#2A2A2A]" />
          <a
            href="mailto:contato@gamstudio.com"
            className="flex items-center gap-2 text-sm text-[#A0A0A0] hover:text-white transition-colors"
          >
            <span className="text-[#E02020] font-semibold">Email</span>
            <span>contato@gamstudio.com</span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
