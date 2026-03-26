import { useNavigate } from 'react-router-dom'
import { AnimatedGroup } from '@/components/ui/animated-group'
import FloatingShapes from '@/components/ui/floating-shapes'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'

const transitionVariants = {
  item: {
    hidden: { opacity: 0, filter: 'blur(12px)', y: 12 },
    visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { type: 'spring' as const, bounce: 0.3, duration: 1.5 } },
  },
}

export default function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Mesh gradient background */}
      <div className="hero-mesh-bg" />
      {/* Glow orb */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[600px] rounded-full animate-orb-pulse" style={{ background: 'radial-gradient(circle, rgba(204,238,0,0.15), transparent 70%)', filter: 'blur(60px)' }} />
      <FloatingShapes accentColor="#CCEE00" secondaryColor="#0D1B4B" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-32 pb-16 lg:pt-48 lg:pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <AnimatedGroup variants={{ container: { visible: { transition: { staggerChildren: 0.05, delayChildren: 0.75 } } }, ...transitionVariants }}>
            <h1 className="text-balance text-4xl font-extrabold text-[#0D1B4B] sm:text-5xl md:text-6xl leading-[1.1]">
              Propostas de consórcio profissionais em{' '}
              <span className="relative inline-block">
                <span className="text-[#AACC00]">30 segundos</span>
                <span className="absolute bottom-0 left-0 h-1 w-full rounded-full bg-[#CCEE00]/40" />
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-gray-500">
              Simulador multi-administradora com geração de PDF e envio por WhatsApp.
              Para corretores que querem vender mais, não gerenciar planilhas.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                onClick={() => navigate('/login')}
                size="lg"
                className="gap-2 bg-[#0D1B4B] px-8 text-base font-bold shadow-elevation-2 hover:shadow-elevation-3 transition-shadow"
              >
                Testar Grátis 7 Dias
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 text-base font-semibold"
                onClick={() => document.getElementById('simulador')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Ver Como Funciona <ChevronDown size={16} />
              </Button>
            </div>

            {/* Decorative cards mockup */}
            <div aria-hidden className="relative mx-auto mt-20 max-w-2xl">
              <div className="absolute inset-0 bg-radial-[at_50%_50%] from-[#CCEE00]/20 to-transparent to-70%" />
              <div className="mx-auto w-80 translate-x-4 rounded-2xl border border-white/50 bg-white/60 p-3 backdrop-blur-xl shadow-elevation-3 sm:translate-x-8 [mask-image:linear-gradient(to_bottom,#000_60%,transparent_95%)]">
                <div className="space-y-3 overflow-hidden rounded-xl border bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#CCEE00]" />
                    <span className="text-xs font-bold text-[#0D1B4B]">SimulaCotas Pro</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Carta de Crédito</span>
                      <span className="font-bold text-[#0D1B4B]">R$ 400.000</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Parcela</span>
                      <span className="font-bold text-[#0D1B4B]">R$ 2.000</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Pós-Lance</span>
                      <span className="font-bold text-[#AACC00]">R$ 1.200</span>
                    </div>
                    <div className="mt-2 h-8 rounded-lg bg-gradient-to-r from-[#0D1B4B] to-[#152260] flex items-center justify-center">
                      <span className="text-[10px] font-bold text-[#CCEE00]">Gerar PDF</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedGroup>
        </div>
      </div>
    </section>
  )
}
