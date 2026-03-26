import { motion } from 'framer-motion'
import { blurFadeUp } from '@/lib/animations'
import { ZoomParallax } from '@/components/ui/zoom-parallax'
import { MousePointerClick, PenLine, Send } from 'lucide-react'

const steps = [
  { icon: MousePointerClick, title: 'Escolha a administradora', desc: 'Selecione e as taxas são preenchidas automaticamente.' },
  { icon: PenLine, title: 'Preencha 4 campos', desc: 'Valor, prazo, cotas e lance. O resto calcula sozinho.' },
  { icon: Send, title: 'Envie a proposta', desc: 'Gere PDF ou compartilhe pelo WhatsApp em 1 toque.' },
]

function StepCard({ icon: Icon, title, desc }: typeof steps[0]) {
  return (
    <div className="glass-premium-card p-8 w-full h-full flex flex-col justify-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0D1B4B] to-[#152260]">
        <Icon size={24} className="text-[#CCEE00]" />
      </div>
      <h3 className="text-lg font-bold text-[#0D1B4B]">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  )
}

export default function HowItWorksSection() {
  const parallaxItems = [
    // Item central (principal)
    { content: <StepCard {...steps[0]} /> },
    // Items orbitando ao redor
    { content: <StepCard {...steps[1]} /> },
    { content: <StepCard {...steps[2]} /> },
    // Decorativos: logos de administradoras nos slots restantes
    { content: <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0D1B4B] text-2xl font-bold text-[#CCEE00] shadow-elevation-2">I</div> },
    { content: <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0D1B4B] text-2xl font-bold text-[#CCEE00] shadow-elevation-2">BB</div> },
    { content: <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0D1B4B] text-2xl font-bold text-[#CCEE00] shadow-elevation-2">S</div> },
    { content: <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0D1B4B] text-2xl font-bold text-[#CCEE00] shadow-elevation-2">M</div> },
  ]

  return (
    <section className="relative overflow-hidden">
      <motion.div variants={blurFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center pt-20 pb-8 relative z-10">
        <h2 className="text-3xl font-extrabold text-[#0D1B4B] sm:text-4xl">Como funciona</h2>
        <p className="mt-3 text-lg text-gray-500">Três passos. Sem complicação.</p>
      </motion.div>

      <ZoomParallax items={parallaxItems} />
    </section>
  )
}
