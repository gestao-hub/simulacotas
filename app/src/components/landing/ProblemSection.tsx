import { motion } from 'framer-motion'
import { blurFadeUp, staggerContainer } from '@/lib/animations'
import { FileSpreadsheet, Clock, Smartphone } from 'lucide-react'

const problems = [
  { icon: FileSpreadsheet, title: 'Planilhas que quebram', desc: 'Erros #DIV/0!, fórmulas frágeis, cada administradora com uma planilha diferente.', num: '01' },
  { icon: Clock, title: 'Tempo desperdiçado', desc: 'Corretores gastam 10+ minutos montando propostas que deveriam levar 30 segundos.', num: '02' },
  { icon: Smartphone, title: 'Sem uso no celular', desc: 'Impossível abrir planilha Excel no celular para simular na frente do cliente.', num: '03' },
]

export default function ProblemSection() {
  return (
    <section className="py-16 bg-gray-50/50">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div variants={blurFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-[#0D1B4B] sm:text-4xl">
            Cansado de <span className="text-red-500">planilhas</span>?
          </h2>
          <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
            Corretores de consórcio enfrentam esses problemas todos os dias.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid gap-6 sm:grid-cols-3"
        >
          {problems.map(({ icon: Icon, title, desc, num }, i) => (
            <motion.div
              key={title}
              variants={blurFadeUp}
              transition={{ delay: i * 0.1 }}
              className="glass-premium-card group relative overflow-hidden p-6"
              style={{ borderTop: '3px solid #EF4444' }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <span className="absolute -right-2 -top-2 text-6xl font-black text-red-500/5">{num}</span>
              <div className="relative z-10">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                  <Icon size={22} className="text-red-500" />
                </div>
                <h3 className="text-base font-bold text-[#0D1B4B]">{title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
