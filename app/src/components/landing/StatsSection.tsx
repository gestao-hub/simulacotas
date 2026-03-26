import { motion } from 'framer-motion'
import { blurFadeUp, staggerContainer } from '@/lib/animations'
import { Building2, BarChart3, Zap } from 'lucide-react'

const stats = [
  { icon: Building2, value: '7', label: 'Administradoras', suffix: '+', gradient: 'from-[#CCEE00]/20 to-transparent' },
  { icon: BarChart3, value: '3', label: 'Planos de consórcio', suffix: '', gradient: 'from-blue-400/20 to-transparent' },
  { icon: Zap, value: '30', label: 'Segundos por simulação', suffix: 's', gradient: 'from-purple-400/20 to-transparent' },
]

export default function StatsSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Gradient fade into dark */}
      <div className="h-16 bg-gradient-to-b from-[#f8f9fa] to-[#0D1B4B]" />

      <div className="relative bg-[#0D1B4B] py-16">
        {/* Dot pattern */}
        <div className="dot-pattern absolute inset-0 opacity-60" />
        {/* Glowing orbs */}
        <div className="absolute top-0 left-1/4 h-[300px] w-[300px] rounded-full bg-[#CCEE00]/[0.06]" style={{ filter: 'blur(100px)' }} />
        <div className="absolute bottom-0 right-1/4 h-[250px] w-[250px] rounded-full bg-blue-500/[0.06]" style={{ filter: 'blur(80px)' }} />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="relative z-10 mx-auto grid max-w-4xl gap-6 px-6 sm:grid-cols-3"
        >
          {stats.map(({ icon: Icon, value, label, suffix, gradient }, i) => (
            <motion.div
              key={label}
              variants={blurFadeUp}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm p-6 text-center bg-gradient-to-br ${gradient}`}
              whileHover={{ y: -6, scale: 1.02, borderColor: 'rgba(204,238,0,0.2)' }}
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.08] animate-float">
                <Icon size={24} className="text-[#CCEE00]" />
              </div>
              <p className="text-4xl font-extrabold text-white">
                {value}<span className="text-2xl text-[#CCEE00]">{suffix}</span>
              </p>
              <p className="mt-1 text-sm font-medium text-white/50">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Gradient fade out of dark */}
      <div className="h-16 bg-gradient-to-b from-[#0D1B4B] to-[#f8f9fa]" />
    </section>
  )
}
