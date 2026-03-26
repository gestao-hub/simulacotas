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
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-[var(--color-navy)]">Histórico</h1>
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-navy)]">Histórico</h1>
        <span className="text-sm text-[var(--color-muted)]">{simulacoes.length} simulações</span>
      </div>

      {simulacoes.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <FileText size={40} className="text-[var(--color-muted)]" />
          <p className="text-[var(--color-muted)]">Nenhuma simulação salva ainda.</p>
          <a href="/app/simulador">
            <Button className="bg-[var(--color-navy)]">Criar simulação</Button>
          </a>
        </Card>
      ) : (
        simulacoes.map((sim) => (
          <Card key={sim.id} className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-navy)] text-xs font-bold text-[var(--color-lime)]">
              {sim.administradoras?.nome?.charAt(0) ?? 'S'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-bold text-[var(--color-navy)]">
                  {sim.cliente_nome || 'Sem cliente'}
                </span>
                <span className="shrink-0 rounded-full bg-[var(--color-lime-faint)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-navy)]">
                  {planoLabel[sim.plano] ?? sim.plano}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-3 text-xs text-[var(--color-muted)]">
                <span>{sim.administradoras?.nome}</span>
                <span>{formatBRL(sim.resumo?.carta_credito ?? 0)}</span>
                <span>{sim.resumo?.prazo_meses}m</span>
              </div>
              <p className="mt-0.5 text-[10px] text-[var(--color-muted)]">
                {new Date(sim.created_at).toLocaleDateString('pt-BR')} às {new Date(sim.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigator.clipboard.writeText(JSON.stringify(sim.resumo))}>
                <Copy size={14} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => handleExcluir(sim.id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}
