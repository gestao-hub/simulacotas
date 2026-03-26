import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { calcularLinear, formatBRL } from '@/hooks/useSimulador'
import { blurFadeUp } from '@/lib/animations'
import SpotlightCard from '@/components/ui/spotlight-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const adminsDemo = [
  { nome: 'Itaú', taxa: 20, fr: 3 },
  { nome: 'BB', taxa: 30.9, fr: 3 },
  { nome: 'Santander', taxa: 18, fr: 3 },
  { nome: 'Magalu', taxa: 22, fr: 3 },
]

export default function SimuladorSection() {
  const navigate = useNavigate()
  const [selectedAdmin, setSelectedAdmin] = useState(0)
  const [valorBem, setValorBem] = useState(400000)
  const [prazo, setPrazo] = useState(200)
  const [lance, setLance] = useState(50)

  const admin = adminsDemo[selectedAdmin]
  const resultado = useMemo(() => calcularLinear({
    valor_bem: valorBem, prazo, qtde_cotas: 1,
    taxa_adm: admin.taxa, fundo_reserva: admin.fr,
    lance_percentual: lance, lance_embutido_percentual: 0.3,
  }), [valorBem, prazo, lance, admin])

  const items = [
    { label: 'Carta de Crédito', value: formatBRL(resultado.valor_total) },
    { label: 'Parcela Inicial', value: formatBRL(resultado.parcela_base) },
    { label: 'Pós-Lance', value: formatBRL(resultado.parcela_pos_lance) },
    { label: 'Crédito Líquido', value: formatBRL(resultado.credito_liquido) },
    { label: 'Recursos Próprios', value: formatBRL(resultado.lance_recursos_proprios) },
    { label: 'Prazo', value: `${prazo} meses` },
  ]

  return (
    <section id="simulador" className="relative py-20 overflow-hidden">
      {/* Blobs */}
      <div className="gradient-blob gradient-blob-lime w-[500px] h-[500px] right-0 top-1/4 opacity-20" />
      <div className="gradient-blob gradient-blob-navy w-[350px] h-[350px] -left-32 bottom-0 opacity-15 animate-float-slow" />
      <div className="mx-auto max-w-3xl px-6 relative z-10">
        <motion.div variants={blurFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-8">
          <span className="inline-block rounded-full bg-[#CCEE00] px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#0D1B4B] glow-lime-sm">
            Teste agora — sem criar conta
          </span>
          <h2 className="mt-4 text-2xl font-bold text-[#0D1B4B] sm:text-3xl">Simulador Interativo</h2>
        </motion.div>

        <motion.div variants={blurFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.2 }}>
          <SpotlightCard accentColor="#CCEE00" className="shimmer-border">
            <div className="overflow-hidden rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl shadow-elevation-3">
              <div className="p-6">
                {/* Admin chips */}
                <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
                  {adminsDemo.map((a, i) => (
                    <button
                      key={a.nome}
                      onClick={() => setSelectedAdmin(i)}
                      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                        selectedAdmin === i
                          ? 'border-[#CCEE00] bg-[#0D1B4B] text-[#CCEE00] shadow-lg glow-lime-sm'
                          : 'border-gray-200 hover:border-[#AACC00] hover:bg-[#F5FFCC]'
                      }`}
                    >
                      {a.nome}
                    </button>
                  ))}
                </div>

                {/* Inputs */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#0D1B4B]">Valor do Bem</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-semibold">R$</span>
                      <Input type="number" value={valorBem} onChange={(e) => setValorBem(Number(e.target.value))}
                        className="border-2 border-[#CCEE00] bg-[#F5FFCC] pl-9 font-bold text-[#0D1B4B] focus:ring-[#CCEE00]/30" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#0D1B4B]">Prazo (meses)</label>
                    <Input type="number" value={prazo} onChange={(e) => setPrazo(Number(e.target.value))}
                      className="border-2 border-[#CCEE00] bg-[#F5FFCC] font-bold text-[#0D1B4B]" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#0D1B4B]">% Lance</label>
                    <Input type="number" value={lance} onChange={(e) => setLance(Number(e.target.value))}
                      className="border-2 border-[#CCEE00] bg-[#F5FFCC] font-bold text-[#0D1B4B]" />
                  </div>
                </div>
              </div>

              {/* Resultado */}
              <div className="bg-gradient-to-br from-[#0D1B4B] to-[#152260] p-6">
                <div className="mb-4 flex items-center gap-2">
                  <img src="/assets/icone.png" alt="SC" className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#CCEE00]">Resultado</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {items.map(({ label, value }) => (
                    <div key={label} className="rounded-xl border-l-[3px] border-[#CCEE00] bg-white/[0.07] px-3 py-3 transition-all hover:bg-white/[0.12]">
                      <p className="text-[9px] font-bold uppercase tracking-wide text-white/50">{label}</p>
                      <p className="mt-1 text-sm font-extrabold text-white">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-xl bg-white/10 backdrop-blur-sm p-4 text-center border border-white/10">
                  <p className="text-sm font-semibold text-white/70">Quer gerar PDF e enviar pelo WhatsApp?</p>
                  <Button onClick={() => navigate('/login')} className="mt-3 bg-[#CCEE00] font-bold text-[#0D1B4B] hover:bg-[#AACC00] shadow-lg glow-lime-sm">
                    Criar Conta Grátis
                  </Button>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    </section>
  )
}
