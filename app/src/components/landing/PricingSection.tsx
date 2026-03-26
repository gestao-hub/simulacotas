import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { blurFadeUp } from '@/lib/animations'
import { GlassEffect } from '@/components/ui/liquid-glass'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

const features = [
  'Simulações ilimitadas',
  'Todas as 7 administradoras',
  'Propostas em PDF com seu branding',
  'Compartilhamento via WhatsApp',
  'Histórico ilimitado',
  'CRM de clientes',
  'PWA — use como app',
  'Suporte via WhatsApp',
]

export default function PricingSection() {
  const navigate = useNavigate()

  return (
    <section id="pricing" className="py-20">
      <div className="mx-auto max-w-lg px-6">
        <motion.div variants={blurFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-[#0D1B4B] sm:text-4xl">Plano único. Tudo incluso.</h2>
          <p className="mt-3 text-gray-500">Sem limitações. Sem surpresas.</p>
        </motion.div>

        <motion.div variants={blurFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.2 }}>
          <GlassEffect className="rounded-3xl" style={{ boxShadow: '0 0 60px rgba(204,238,0,0.15), 0 20px 60px rgba(0,0,0,0.1)' }}>
            <div className="w-full overflow-hidden rounded-3xl border-2 border-[#CCEE00]/50">
              <div className="bg-gradient-to-br from-[#0D1B4B] to-[#152260] p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 30% 50%, #CCEE00 0%, transparent 50%)' }} />
                <div className="relative z-10">
                  <p className="text-sm font-bold text-[#CCEE00] tracking-wider uppercase">SimulaCotas Pro</p>
                  <p className="mt-3 text-5xl font-extrabold text-white">
                    R$ 189<span className="text-3xl">,90</span>
                    <span className="text-lg font-normal text-white/50">/mês</span>
                  </p>
                  <p className="mt-2 text-sm text-white/40">por corretor · 10+ corretores = 10% off</p>
                </div>
              </div>
              <div className="bg-white p-8">
                <ul className="space-y-3">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F5FFCC]">
                        <Check size={12} className="text-[#AACC00]" />
                      </div>
                      <span className="text-gray-600">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => navigate('/login')}
                  size="lg"
                  className="mt-8 w-full bg-[#0D1B4B] text-base font-bold shadow-elevation-2 hover:shadow-elevation-3 py-6"
                >
                  Começar — 7 dias grátis
                </Button>
                <p className="mt-3 text-center text-xs text-gray-400">Sem cartão. Cancele quando quiser.</p>
              </div>
            </div>
          </GlassEffect>
        </motion.div>
      </div>
    </section>
  )
}
