import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { blurFadeUp } from '@/lib/animations'
import FloatingShapes from '@/components/ui/floating-shapes'
import { Button } from '@/components/ui/button'

export default function CTAFinalSection() {
  const navigate = useNavigate()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0D1B4B] to-[#152260] py-20">
      <FloatingShapes accentColor="#CCEE00" secondaryColor="#CCEE00" />

      <div className="relative z-10 mx-auto max-w-xl px-6 text-center">
        <motion.div variants={blurFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <img src="/assets/icone.png" alt="SC" className="mx-auto mb-6 h-14 w-14" />
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Comece a simular agora</h2>
          <p className="mt-3 text-white/50 text-lg">7 dias grátis. Sem cartão. Cancele quando quiser.</p>
          <Button
            onClick={() => navigate('/login')}
            size="lg"
            className="mt-8 bg-[#CCEE00] px-10 text-base font-bold text-[#0D1B4B] hover:bg-[#AACC00] shadow-lg glow-lime py-6"
          >
            Criar Conta Grátis
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
