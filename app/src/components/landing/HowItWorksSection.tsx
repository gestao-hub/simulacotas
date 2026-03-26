import { motion, useScroll, useTransform } from 'framer-motion'
import { blurFadeUp } from '@/lib/animations'
import { useRef } from 'react'
import { MousePointerClick, PenLine, Send } from 'lucide-react'

const steps = [
  { icon: MousePointerClick, title: 'Escolha a administradora', desc: 'Selecione e as taxas são preenchidas automaticamente.' },
  { icon: PenLine, title: 'Preencha 4 campos', desc: 'Valor, prazo, cotas e lance. O resto calcula sozinho.' },
  { icon: Send, title: 'Envie a proposta', desc: 'Gere PDF ou compartilhe pelo WhatsApp em 1 toque.' },
]

function StepCard({ icon: Icon, title, desc }: typeof steps[0] & { index: number }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  })
  const scale = useTransform(scrollYProgress, [0, 1], [0.7, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1])
  const y = useTransform(scrollYProgress, [0, 1], [80, 0])

  return (
    <motion.div
      ref={ref}
      style={{ scale, opacity, y }}
      className="glass-premium-card p-8 flex flex-col"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0D1B4B] to-[#152260]">
        <Icon size={24} className="text-[#CCEE00]" />
      </div>
      <h3 className="text-lg font-bold text-[#0D1B4B]">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 leading-relaxed">{desc}</p>
    </motion.div>
  )
}

export default function HowItWorksSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="gradient-blob gradient-blob-lime w-[400px] h-[400px] -left-48 bottom-0 opacity-20 animate-float" />

      <div className="mx-auto max-w-5xl px-6 relative z-10">
        <motion.div variants={blurFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-[#0D1B4B] sm:text-4xl">Como funciona</h2>
          <p className="mt-3 text-lg text-gray-500">Três passos. Sem complicação.</p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <StepCard key={step.title} {...step} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
