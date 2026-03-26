import { motion } from 'framer-motion'
import { blurFadeUp, staggerContainer } from '@/lib/animations'
import SpotlightCard from '@/components/ui/spotlight-card'
import { Clock, FileText, Share2, Building2, BarChart3, Smartphone } from 'lucide-react'

const features = [
  { icon: Clock, title: 'Simulação em 30 segundos', desc: 'Cálculo em tempo real. Preencha e veja o resultado instantaneamente.', color: '#0D1B4B' },
  { icon: FileText, title: 'Proposta em PDF', desc: 'Com seu logo, cores e contato. Profissional e personalizado.', color: '#AACC00' },
  { icon: Share2, title: 'Envie pelo WhatsApp', desc: 'Compartilhe a proposta no WhatsApp do cliente em 1 toque.', color: '#0D1B4B' },
  { icon: Building2, title: '7 administradoras', desc: 'Itaú, BB, Santander, Magalu, Reconomia, Breitkopf e Âncora.', color: '#AACC00' },
  { icon: BarChart3, title: '3 planos de consórcio', desc: 'Linear, Reduzida 70/30 e Reduzida 50/50 — todos calculados.', color: '#0D1B4B' },
  { icon: Smartphone, title: 'Funciona no celular', desc: 'PWA — instale como app no Android ou iPhone. Use em campo.', color: '#AACC00' },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-20 bg-section-muted overflow-hidden">
      {/* Blob */}
      <div className="gradient-blob gradient-blob-navy w-[400px] h-[400px] -right-48 top-0 opacity-30 animate-float-slow" />
      <div className="mx-auto max-w-6xl px-6 relative z-10">
        <motion.div variants={blurFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-[#0D1B4B] sm:text-4xl">Tudo que o corretor precisa</h2>
          <p className="mt-3 text-lg text-gray-500">Simples. Rápido. Profissional.</p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div key={title} variants={blurFadeUp} transition={{ delay: i * 0.08 }}>
              <SpotlightCard accentColor={color}>
                <div className="glass-premium-card p-6 h-full" style={{ borderTop: `3px solid ${color}` }}>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl animate-float-slow" style={{ background: `${color}10` }}>
                    <Icon size={22} style={{ color }} />
                  </div>
                  <h3 className="text-sm font-bold text-[#0D1B4B]">{title}</h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
