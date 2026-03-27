import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { listarSimulacoes, excluirSimulacao } from '@/lib/salvarSimulacao'
import { formatBRL } from '@/hooks/useSimulador'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, FileText, Copy } from 'lucide-react'
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
  const { user } = useAuth()
  const [simulacoes, setSimulacoes] = useState<SimulacaoRow[]>([])
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] space-y-4 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Histórico</h1>
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Histórico</h1>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">{simulacoes.length} simulações</span>
      </div>

      {simulacoes.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 rounded-2xl bg-white p-12 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-50">
            <FileText size={32} className="text-gray-300" />
          </div>
          <p className="text-gray-400">Nenhuma simulação salva ainda.</p>
          <a href="/app/simulador">
            <Button className="rounded-xl bg-[var(--color-navy)] transition-all duration-200 hover:opacity-90">Criar simulação</Button>
          </a>
        </Card>
      ) : (
        simulacoes.map((sim) => (
          <Card key={sim.id} className="group flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-xs font-bold text-gray-500">
              {sim.administradoras?.nome?.charAt(0) ?? 'S'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-gray-900">
                  {sim.cliente_nome || 'Sem cliente'}
                </span>
                <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                  {planoLabel[sim.plano] ?? sim.plano}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-400">
                <span>{sim.administradoras?.nome}</span>
                <span>{formatBRL(sim.resumo?.carta_credito ?? 0)}</span>
                <span>{sim.resumo?.prazo_meses}m</span>
              </div>
              <p className="mt-0.5 text-[10px] text-gray-400">
                {new Date(sim.created_at).toLocaleDateString('pt-BR')} às {new Date(sim.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="flex shrink-0 gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 transition-colors duration-150 hover:text-gray-600" onClick={() => navigator.clipboard.writeText(JSON.stringify(sim.resumo))}>
                <Copy size={14} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 transition-colors duration-150 hover:text-red-600" onClick={() => handleExcluir(sim.id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}
