import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { listarSimulacoes, excluirSimulacao } from '@/lib/salvarSimulacao'
import { formatBRL, type PlanoTipo } from '@/hooks/useSimulador'
import { gerarHTMLProposta } from '@/lib/gerarPDF'
import PropostaPreview from '@/components/simulador/PropostaPreview'
import { Button } from '@/components/ui/button'
import { Trash2, FileText, Eye } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface SimulacaoRow {
  id: string
  cliente_nome: string | null
  categoria: string
  plano: string
  resumo: {
    carta_credito?: number
    parcela_inicial?: number
    parcela_pos_lance?: number
    credito_liquido?: number
    recursos_proprios?: number
    prazo_meses?: number
  }
  created_at: string
  administradoras: { nome: string; logo_url: string | null } | null
}

const planoLabel: Record<string, string> = {
  linear: 'Linear',
  reduzida_70_30: '70/30',
  reduzida_50_50: '50/50',
}

export default function HistoricoPage() {
  const { user, profile } = useAuth()
  const [simulacoes, setSimulacoes] = useState<SimulacaoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [previewHtml, setPreviewHtml] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    listarSimulacoes(user.id).then((data) => {
      setSimulacoes(data as SimulacaoRow[])
      setLoading(false)
    })
  }, [user])

  const handleExcluir = async (id: string) => {
    if (!confirm('Excluir esta simulação?')) return
    await excluirSimulacao(id)
    setSimulacoes((prev) => prev.filter((s) => s.id !== id))
  }

  const handlePreview = (sim: SimulacaoRow) => {
    const html = gerarHTMLProposta({
      corretorNome: profile?.full_name ?? '',
      corretorWhatsapp: profile?.whatsapp ?? '',
      corretorLogo: profile?.logo_corretor_url ?? null,
      corPrimaria: profile?.cor_primaria ?? '#0D1B4B',
      corSecundaria: profile?.cor_secundaria ?? '#CCEE00',
      clienteNome: sim.cliente_nome ?? '',
      administradoraNome: sim.administradoras?.nome ?? '',
      plano: sim.plano as PlanoTipo,
      categoria: sim.categoria,
      resumo: {
        carta_credito: sim.resumo?.carta_credito ?? 0,
        parcela_inicial: sim.resumo?.parcela_inicial ?? 0,
        parcela_pos_lance: sim.resumo?.parcela_pos_lance ?? 0,
        credito_liquido: sim.resumo?.credito_liquido ?? 0,
        recursos_proprios: sim.resumo?.recursos_proprios ?? 0,
        prazo_meses: sim.resumo?.prazo_meses ?? 0,
      },
    })
    setPreviewHtml(html)
    setPreviewOpen(true)
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const min = Math.floor(diff / 60000)
    if (min < 1) return 'agora'
    if (min < 60) return `há ${min}min`
    const hrs = Math.floor(min / 60)
    if (hrs < 24) return `há ${hrs}h`
    const days = Math.floor(hrs / 24)
    if (days === 1) return 'ontem'
    if (days < 30) return `há ${days}d`
    return new Date(date).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Histórico</h1>
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Histórico</h1>
        <span className="text-sm text-gray-400">{simulacoes.length} simulações</span>
      </div>

      {simulacoes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-10 text-center shadow-sm">
          <FileText size={32} className="text-gray-300" />
          <p className="text-sm text-gray-400">Nenhuma simulação salva ainda.</p>
          <a href="/app/simulador">
            <Button size="sm" className="rounded-xl bg-gray-900">Criar simulação</Button>
          </a>
        </div>
      ) : (
        <div className="space-y-2">
          {simulacoes.map((sim) => (
            <button
              key={sim.id}
              onClick={() => handlePreview(sim)}
              className="group flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 text-left shadow-sm transition-all duration-200 hover:shadow-md"
            >
              {sim.administradoras?.logo_url ? (
                <img src={sim.administradoras.logo_url} alt="" className="h-6 w-auto max-w-[60px] shrink-0 object-contain" />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-400">
                  {sim.administradoras?.nome?.charAt(0) ?? 'S'}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-gray-900">{sim.cliente_nome || 'Sem cliente'}</span>
                  <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">{planoLabel[sim.plano] ?? sim.plano}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{formatBRL(sim.resumo?.carta_credito ?? 0)}</span>
                  <span>·</span>
                  <span>{formatBRL(sim.resumo?.parcela_pos_lance ?? 0)}/mês</span>
                  <span>·</span>
                  <span>{timeAgo(sim.created_at)}</span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Eye size={14} className="text-gray-300 transition-colors group-hover:text-gray-500" />
                <button
                  onClick={(e) => { e.stopPropagation(); handleExcluir(sim.id) }}
                  className="rounded-lg p-1 text-gray-300 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </button>
          ))}
        </div>
      )}

      <PropostaPreview
        html={previewHtml}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  )
}
