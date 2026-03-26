import { formatBRL } from '@/hooks/useSimulador'
import { FileText, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Resumo {
  carta_credito: number
  parcela_inicial: number
  parcela_pos_lance: number
  credito_liquido: number
  recursos_proprios: number
  prazo_meses: number
}

interface Props {
  resumo: Resumo | null
  clienteNome: string
  onGerarPDF: () => void
  onCompartilharWhatsApp: () => void
  salvando?: boolean
}

export default function ResultadoCard({ resumo, clienteNome, onGerarPDF, onCompartilharWhatsApp, salvando }: Props) {
  if (!resumo) return null

  const items = [
    { label: 'Carta de Crédito', value: formatBRL(resumo.carta_credito) },
    { label: 'Parcela Inicial', value: formatBRL(resumo.parcela_inicial) },
    { label: 'Parcela Pós-Lance', value: formatBRL(resumo.parcela_pos_lance) },
    { label: 'Crédito Líquido', value: formatBRL(resumo.credito_liquido) },
    { label: 'Recursos Próprios', value: formatBRL(resumo.recursos_proprios) },
    { label: 'Prazo', value: `${resumo.prazo_meses} meses` },
  ]

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-navy-light)] p-5 shadow-xl">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <img src="/assets/icone.png" alt="SC" className="h-6 w-6" />
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-lime)]">
          Resumo da Simulação
        </span>
      </div>

      {clienteNome && (
        <p className="mb-3 text-sm font-medium text-white/60">
          Cliente: <span className="text-white">{clienteNome}</span>
        </p>
      )}

      {/* Grid de resultados */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border-l-[3px] border-[var(--color-lime)] bg-white/[0.07] px-3 py-3"
          >
            <p className="text-[10px] font-bold uppercase tracking-wide text-white/50">
              {label}
            </p>
            <p className="mt-1 text-sm font-extrabold text-white">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Ações */}
      <div className="mt-4 flex gap-2">
        <Button
          onClick={onGerarPDF}
          disabled={salvando}
          className="flex-1 gap-2 bg-[var(--color-lime)] font-bold text-[var(--color-navy)] hover:bg-[var(--color-lime-dark)]"
        >
          <FileText size={16} />
          {salvando ? 'Salvando...' : 'Gerar PDF'}
        </Button>
        <Button
          onClick={onCompartilharWhatsApp}
          disabled={salvando}
          variant="outline"
          className="flex-1 gap-2 border-[var(--color-lime)]/30 font-bold text-white hover:bg-white/10 hover:text-[var(--color-lime)]"
        >
          <Share2 size={16} />
          WhatsApp
        </Button>
      </div>
    </div>
  )
}
