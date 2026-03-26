import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { DollarSign, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface Pagamento {
  id: string
  valor: string
  status: string
  metodo: string | null
  created_at: string
  profiles: { full_name: string | null; email: string | null } | null
}

interface Assinatura {
  id: string
  valor_mensal: string
  status: string
  ciclo: string
  tentativas_falha: number
  created_at: string
  profiles: { full_name: string | null; email: string | null } | null
}

const statusColor: Record<string, string> = {
  approved: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  rejected: 'bg-red-100 text-red-800',
  refunded: 'bg-purple-100 text-purple-800',
  in_process: 'bg-blue-100 text-blue-800',
  ativo: 'bg-green-100 text-green-800',
  trial: 'bg-amber-100 text-amber-800',
  inadimplente: 'bg-red-100 text-red-800',
  cancelado: 'bg-gray-100 text-gray-800',
}

export default function AdminFinanceiroPage() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([])
  const [mrr, setMrr] = useState(0)

  useEffect(() => {
    supabase
      .from('pagamentos')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => setPagamentos((data as Pagamento[]) ?? []))

    supabase
      .from('assinaturas')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        const subs = (data as Assinatura[]) ?? []
        setAssinaturas(subs)
        const mrrCalc = subs
          .filter((s) => s.status === 'ativo')
          .reduce((acc, s) => acc + Number(s.valor_mensal), 0)
        setMrr(mrrCalc)
      })
  }, [])

  const totalRecebido = pagamentos
    .filter((p) => p.status === 'approved')
    .reduce((acc, p) => acc + Number(p.valor), 0)

  const inadimplentes = assinaturas.filter((s) => s.status === 'inadimplente')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-navy)]">Financeiro</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPICard icon={DollarSign} label="MRR" value={`R$ ${mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} color="text-green-600" />
        <KPICard icon={CheckCircle} label="Total Recebido" value={`R$ ${totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} color="text-blue-600" />
        <KPICard icon={Clock} label="Assinaturas" value={String(assinaturas.length)} color="text-indigo-600" />
        <KPICard icon={AlertTriangle} label="Inadimplentes" value={String(inadimplentes.length)} color="text-red-600" />
      </div>

      <Tabs defaultValue="pagamentos">
        <TabsList>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
          <TabsTrigger value="assinaturas">Assinaturas</TabsTrigger>
          <TabsTrigger value="inadimplencia">Inadimplência ({inadimplentes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pagamentos" className="mt-4 space-y-2">
          {pagamentos.map((p) => (
            <Card key={p.id} className="flex items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{p.profiles?.full_name ?? p.profiles?.email ?? '—'}</p>
                <p className="text-xs text-[var(--color-muted)]">{new Date(p.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
              <span className="text-sm font-bold">R$ {Number(p.valor).toFixed(2)}</span>
              <Badge className={statusColor[p.status] ?? 'bg-gray-100'}>{p.status}</Badge>
            </Card>
          ))}
          {pagamentos.length === 0 && <p className="py-8 text-center text-[var(--color-muted)]">Nenhum pagamento registrado.</p>}
        </TabsContent>

        <TabsContent value="assinaturas" className="mt-4 space-y-2">
          {assinaturas.map((s) => (
            <Card key={s.id} className="flex items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{s.profiles?.full_name ?? s.profiles?.email ?? '—'}</p>
                <p className="text-xs text-[var(--color-muted)]">R$ {Number(s.valor_mensal).toFixed(2)}/mês · {s.ciclo}</p>
              </div>
              <Badge className={statusColor[s.status] ?? 'bg-gray-100'}>{s.status}</Badge>
            </Card>
          ))}
          {assinaturas.length === 0 && <p className="py-8 text-center text-[var(--color-muted)]">Nenhuma assinatura.</p>}
        </TabsContent>

        <TabsContent value="inadimplencia" className="mt-4 space-y-2">
          {inadimplentes.map((s) => (
            <Card key={s.id} className="flex items-center gap-3 border-red-200 p-3">
              <AlertTriangle size={16} className="shrink-0 text-red-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{s.profiles?.full_name ?? s.profiles?.email ?? '—'}</p>
                <p className="text-xs text-red-500">{s.tentativas_falha} tentativas falhadas</p>
              </div>
              <span className="text-sm font-bold">R$ {Number(s.valor_mensal).toFixed(2)}</span>
            </Card>
          ))}
          {inadimplentes.length === 0 && <p className="py-8 text-center text-green-600 font-semibold">Nenhum inadimplente.</p>}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function KPICard({ icon: Icon, label, value, color }: { icon: typeof DollarSign; label: string; value: string; color: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <Icon size={16} className={color} />
        <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">{label}</span>
      </div>
      <p className="mt-1 text-xl font-extrabold text-[var(--color-navy)]">{value}</p>
    </Card>
  )
}
