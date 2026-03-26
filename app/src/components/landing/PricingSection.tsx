import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { blurFadeUp, staggerContainer } from '@/lib/animations'
import { RippleButton } from '@/components/ui/ripple-button'
import { Check, User, Building2, Rocket } from 'lucide-react'

const featuresAll = [
  'Simulações ilimitadas',
  'Todas as administradoras',
  'PDF com seu branding',
  'WhatsApp em 1 toque',
  'Histórico ilimitado',
  'CRM de clientes',
  'PWA — use como app',
  'Suporte via WhatsApp',
]

const plans = [
  {
    name: 'Individual',
    icon: User,
    description: 'Para o corretor autônomo que quer se profissionalizar.',
    price: '189',
    priceCents: ',90',
    period: '/mês',
    features: featuresAll.slice(0, 6),
    buttonText: 'Começar — 7 dias grátis',
    isPopular: false,
    highlight: false,
  },
  {
    name: 'Pro',
    icon: Rocket,
    description: 'Tudo ilimitado. O plano mais escolhido por corretores ativos.',
    price: '189',
    priceCents: ',90',
    period: '/mês',
    features: featuresAll,
    buttonText: 'Testar Grátis 7 Dias',
    isPopular: true,
    highlight: true,
  },
  {
    name: 'Empresa',
    icon: Building2,
    description: '10+ corretores com desconto progressivo. Gestão centralizada.',
    price: '170',
    priceCents: ',91',
    period: '/corretor/mês',
    features: [
      ...featuresAll,
      'Painel admin da empresa',
      'Desconto 10% por corretor',
    ],
    buttonText: 'Falar com Vendas',
    isPopular: false,
    highlight: false,
  },
]

export default function PricingSection() {
  const navigate = useNavigate()

  return (
    <section id="pricing" className="relative py-20 overflow-hidden">
      <div className="gradient-blob gradient-blob-lime w-[500px] h-[500px] left-1/4 top-0 opacity-20 animate-float" />
      <div className="gradient-blob gradient-blob-navy w-[400px] h-[400px] right-1/4 bottom-0 opacity-15 animate-float-slow" />

      <div className="mx-auto max-w-5xl px-6 relative z-10">
        <motion.div variants={blurFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-[#0D1B4B] sm:text-4xl">
            Encontre o plano <span className="text-[#AACC00]">ideal</span>
          </h2>
          <p className="mt-3 text-gray-500 text-lg">Comece grátis. Sem cartão. Cancele quando quiser.</p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid gap-6 md:grid-cols-3 items-stretch"
        >
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              variants={blurFadeUp}
              transition={{ delay: i * 0.1 }}
              className={`relative flex flex-col rounded-2xl backdrop-blur-[14px] shadow-xl px-7 py-8 transition-all duration-300 border ${
                plan.highlight
                  ? 'scale-[1.03] ring-2 ring-[#CCEE00]/30 bg-gradient-to-br from-[#0D1B4B]/[0.08] to-transparent border-[#CCEE00]/30 shadow-2xl'
                  : 'bg-gradient-to-br from-black/[0.03] to-transparent border-black/10'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3.5 right-4 px-3 py-1 text-xs font-bold rounded-full bg-[#CCEE00] text-[#0D1B4B]">
                  Mais Popular
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <plan.icon size={20} className={plan.highlight ? 'text-[#CCEE00]' : 'text-[#0D1B4B]'} />
                  <h3 className="text-xl font-bold text-[#0D1B4B]">{plan.name}</h3>
                </div>
                <p className="text-sm text-gray-500">{plan.description}</p>
              </div>

              <div className="my-4 flex items-baseline gap-0.5">
                <span className="text-sm text-gray-400">R$</span>
                <span className="text-5xl font-extralight text-[#0D1B4B] tracking-tight">{plan.price}</span>
                <span className="text-2xl font-extralight text-[#0D1B4B]">{plan.priceCents}</span>
                <span className="text-sm text-gray-400 ml-1">{plan.period}</span>
              </div>

              <div className="w-full mb-5 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />

              <ul className="flex flex-col gap-2.5 text-sm text-gray-600 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <div className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#F5FFCC]">
                      <Check size={11} className="text-[#AACC00]" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <RippleButton
                onClick={() => navigate('/login')}
                rippleColor={plan.highlight ? 'rgba(13,27,75,0.3)' : 'rgba(204,238,0,0.4)'}
                className={`mt-auto w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  plan.highlight
                    ? 'bg-[#CCEE00] hover:bg-[#AACC00] text-[#0D1B4B] shadow-lg glow-lime-sm'
                    : 'bg-[#0D1B4B]/10 hover:bg-[#0D1B4B]/20 text-[#0D1B4B] border border-[#0D1B4B]/20'
                }`}
              >
                {plan.buttonText}
              </RippleButton>
            </motion.div>
          ))}
        </motion.div>

        <motion.p variants={blurFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mt-8 text-xs text-gray-400">
          Sem cartão para o trial. Empresa com 20+ corretores: desconto composto (19% off). 50+: sob consulta.
        </motion.p>
      </div>
    </section>
  )
}
