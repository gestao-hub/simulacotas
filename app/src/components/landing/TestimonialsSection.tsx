import { motion } from 'framer-motion'
import { blurFadeUp, staggerContainer } from '@/lib/animations'
import { Star } from 'lucide-react'

const testimonials = [
  { name: 'Carlos S.', role: 'Corretor de Imóveis — SP', text: 'Antes eu levava 10 minutos com planilha. Agora faço em 30 segundos e mando pelo WhatsApp. O cliente recebe um PDF profissional.', avatar: 'C' },
  { name: 'Ana M.', role: 'Representante Comercial — SC', text: 'A proposta em PDF com meu logo mudou o jogo. Os clientes levam a sério quando veem algo profissional.', avatar: 'A' },
  { name: 'Roberto F.', role: 'Corretor Independente — RJ', text: 'Trabalho com 5 administradoras e o SimulaCotas tem todas. Não preciso mais abrir planilha diferente pra cada uma.', avatar: 'R' },
  { name: 'Juliana P.', role: 'Equipe de Vendas — MG', text: 'Uso direto no celular nas reuniões com clientes. Simulo na hora e já envio a proposta. Minha conversão aumentou muito.', avatar: 'J' },
]

export default function TestimonialsSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Blob */}
      <div className="gradient-blob gradient-blob-navy w-[400px] h-[400px] -right-48 top-0 opacity-15 animate-float-slow" />
      <div className="mx-auto max-w-6xl px-6 relative z-10">
        <motion.div variants={blurFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-[#0D1B4B] sm:text-4xl">O que corretores dizem</h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid gap-5 sm:grid-cols-2"
        >
          {testimonials.map(({ name, role, text, avatar }, i) => (
            <motion.div
              key={name}
              variants={blurFadeUp}
              transition={{ delay: i * 0.1 }}
              className="glass-premium-card p-6"
              whileHover={{ y: -4 }}
            >
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} className="fill-[#CCEE00] text-[#CCEE00]" />)}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed italic">"{text}"</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#0D1B4B] to-[#152260] text-sm font-bold text-[#CCEE00]">
                  {avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0D1B4B]">{name}</p>
                  <p className="text-xs text-gray-400">{role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
