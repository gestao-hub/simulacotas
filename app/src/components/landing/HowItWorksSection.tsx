import { motion } from 'framer-motion'
import { blurFadeUp, staggerContainer } from '@/lib/animations'
import { MousePointerClick, PenLine, Send } from 'lucide-react'

const steps = [
  { icon: MousePointerClick, title: 'Escolha a administradora', desc: 'Selecione e as taxas são preenchidas automaticamente.', num: '1' },
  { icon: PenLine, title: 'Preencha 4 campos', desc: 'Valor, prazo, cotas e lance. O resto calcula sozinho.', num: '2' },
  { icon: Send, title: 'Envie a proposta', desc: 'Gere PDF ou compartilhe pelo WhatsApp em 1 toque.', num: '3' },
]

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-gray-50/50">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div variants={blurFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-[#0D1B4B] sm:text-4xl">Como funciona</h2>
          <p className="mt-3 text-lg text-gray-500">Três passos. Sem complicação.</p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid gap-6 sm:grid-cols-3"
          style={{ perspective: '1200px' }}
        >
          {steps.map(({ icon: Icon, title, desc, num }, i) => (
            <motion.div
              key={title}
              variants={blurFadeUp}
              transition={{ delay: i * 0.15 }}
              className="shimmer-border group"
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 backdrop-blur-[32px] p-8 shadow-elevation-2 transition-all duration-500 group-hover:[transform:translateY(-8px)_rotateX(2deg)] group-hover:shadow-elevation-3">
                <span className="absolute -right-3 -top-3 text-7xl font-black text-[#0D1B4B]/[0.03]">{num}</span>
                <div className="relative z-10">
                  <motion.div
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0D1B4B] to-[#152260]"
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Icon size={24} className="text-[#CCEE00]" />
                  </motion.div>
                  <h3 className="text-base font-bold text-[#0D1B4B]">{title}</h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
