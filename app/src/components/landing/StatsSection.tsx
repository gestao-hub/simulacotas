import { motion } from 'framer-motion'
import { blurFadeUp, staggerContainer } from '@/lib/animations'
import { Building2, BarChart3, Zap } from 'lucide-react'

const stats = [
  { icon: Building2, value: '7', label: 'Administradoras', suffix: '+', color: '#0D1B4B', glow: 'rgba(13,27,75,0.15)' },
  { icon: BarChart3, value: '3', label: 'Planos de consórcio', suffix: '', color: '#AACC00', glow: 'rgba(204,238,0,0.2)' },
  { icon: Zap, value: '30', label: 'Segundos por simulação', suffix: 's', color: '#0D1B4B', glow: 'rgba(13,27,75,0.15)' },
]

export default function StatsSection() {
  return (
    <section className="py-16">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="mx-auto grid max-w-4xl gap-6 px-6 sm:grid-cols-3"
      >
        {stats.map(({ icon: Icon, value, label, suffix, color, glow }, i) => (
          <motion.div
            key={label}
            variants={blurFadeUp}
            transition={{ delay: i * 0.1 }}
            className="glass-premium-card p-6 text-center"
            whileHover={{ y: -8, boxShadow: `0 0 60px ${glow}, 0 20px 50px rgba(0,0,0,0.1)` }}
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl animate-float" style={{ background: `${color}10` }}>
              <Icon size={24} style={{ color }} />
            </div>
            <p className="text-4xl font-extrabold" style={{ color }}>
              {value}<span className="text-2xl">{suffix}</span>
            </p>
            <p className="mt-1 text-sm font-medium text-gray-500">{label}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
