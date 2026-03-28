import { useSearchParams } from 'react-router-dom'
import { AnimatedGroup } from '@/components/ui/animated-group'
import FloatingShapes from '@/components/ui/floating-shapes'
import { LiquidButton } from '@/components/ui/liquid-glass-button'
import { ChevronDown } from 'lucide-react'

const transitionVariants = {
  item: {
    hidden: { opacity: 0, filter: 'blur(12px)', y: 12 },
    visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { type: 'spring' as const, bounce: 0.3, duration: 1.5 } },
  },
}

export default function HeroSection() {
  const [, setSearchParams] = useSearchParams()

  return (
    <section className="relative overflow-hidden">
      {/* Mesh gradient background */}
      <div className="hero-mesh-bg" />
      {/* Glow orb */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[600px] rounded-full animate-orb-pulse" style={{ background: 'radial-gradient(circle, rgba(204,238,0,0.12), transparent 70%)', filter: 'blur(80px)' }} />
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
              Para consultores que querem vender mais, não gerenciar planilhas.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <LiquidButton
                onClick={() => setSearchParams({ auth: 'register' })}
                size="xl"
                className="text-[#0D1B4B] font-bold text-base px-10"
              >
                Testar Grátis 3 Dias
              </LiquidButton>
              <LiquidButton
                variant="outline"
                size="xl"
                className="text-[#0D1B4B] font-semibold text-base px-10"
                onClick={() => document.getElementById('simulador')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span className="flex items-center gap-2">Ver Como Funciona <ChevronDown size={16} /></span>
              </LiquidButton>
            </div>

          </AnimatedGroup>
        </div>
      </div>
    </section>
  )
}
