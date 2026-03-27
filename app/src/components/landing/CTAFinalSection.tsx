import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { blurFadeUp } from '@/lib/animations'
import FloatingShapes from '@/components/ui/floating-shapes'
import { Button } from '@/components/ui/button'

export default function CTAFinalSection() {
  const [, setSearchParams] = useSearchParams()

  return (
    <section className="relative overflow-hidden">
      <div className="h-16 bg-gradient-to-b from-[#f8f9fa] to-[#0D1B4B]" />
      <div className="relative bg-gradient-to-br from-[#0D1B4B] to-[#152260] py-20">
        <FloatingShapes accentColor="#CCEE00" secondaryColor="#CCEE00" />
        <div className="relative z-10 mx-auto max-w-xl px-6 text-center">
          <motion.div variants={blurFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="mx-auto mb-6 inline-flex rounded-2xl bg-white/90 p-4 shadow-lg"><img src="/assets/icone.png" alt="SC" className="h-20 w-auto" /></div>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Comece a simular agora</h2>
            <p className="mt-3 text-white/50 text-lg">3 dias grátis. Sem cartão. Cancele quando quiser.</p>
            <Button
              onClick={() => setSearchParams({ auth: 'register' })}
              size="lg"
              className="mt-8 bg-[#CCEE00] px-10 text-base font-bold text-[#0D1B4B] hover:bg-[#AACC00] shadow-lg glow-lime py-6"
            >
              Criar Conta Grátis
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
