import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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

  const kpis = [
    { icon: DollarSign, label: 'MRR', value: `R$ ${mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, bg: 'bg-green-50', iconColor: 'text-green-500' },
    { icon: CheckCircle, label: 'Total Recebido', value: `R$ ${totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, bg: 'bg-blue-50', iconColor: 'text-blue-500' },
    { icon: Clock, label: 'Assinaturas', value: String(assinaturas.length), bg: 'bg-indigo-50', iconColor: 'text-indigo-500' },
    { icon: AlertTriangle, label: 'Inadimplentes', value: String(inadimplentes.length), bg: 'bg-red-50', iconColor: 'text-red-500' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpis.map(({ icon: Icon, label, value, bg, iconColor }) => (
          <div key={label} className="rounded-xl bg-white p-4 shadow-sm">
            <div className={`mb-2 inline-flex rounded-lg p-2 ${bg}`}>
              <Icon size={16} className={iconColor} />
            </div>
            <p className="text-xl font-bold text-gray-900">{value}</p>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="pagamentos">
        <TabsList>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
          <TabsTrigger value="assinaturas">Assinaturas</TabsTrigger>
          <TabsTrigger value="inadimplencia">Inadimplência ({inadimplentes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pagamentos" className="mt-4 space-y-2">
          {pagamentos.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{p.profiles?.full_name ?? p.profiles?.email ?? '—'}</p>
                <p className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
              <span className="text-sm font-bold text-gray-900">R$ {Number(p.valor).toFixed(2)}</span>
              <Badge className={statusColor[p.status] ?? 'bg-gray-100'}>{p.status}</Badge>
            </div>
          ))}
          {pagamentos.length === 0 && <p className="py-8 text-center text-gray-400">Nenhum pagamento registrado.</p>}
        </TabsContent>

        <TabsContent value="assinaturas" className="mt-4 space-y-2">
          {assinaturas.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{s.profiles?.full_name ?? s.profiles?.email ?? '—'}</p>
                <p className="text-xs text-gray-400">R$ {Number(s.valor_mensal).toFixed(2)}/mês · {s.ciclo}</p>
              </div>
              <Badge className={statusColor[s.status] ?? 'bg-gray-100'}>{s.status}</Badge>
            </div>
          ))}
          {assinaturas.length === 0 && <p className="py-8 text-center text-gray-400">Nenhuma assinatura.</p>}
        </TabsContent>

        <TabsContent value="inadimplencia" className="mt-4 space-y-2">
          {inadimplentes.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-xl border border-red-100 bg-white p-3 shadow-sm">
              <AlertTriangle size={16} className="shrink-0 text-red-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{s.profiles?.full_name ?? s.profiles?.email ?? '—'}</p>
                <p className="text-xs text-red-400">{s.tentativas_falha} tentativas falhadas</p>
              </div>
              <span className="text-sm font-bold text-gray-900">R$ {Number(s.valor_mensal).toFixed(2)}</span>
            </div>
          ))}
          {inadimplentes.length === 0 && <p className="py-8 text-center text-gray-500 font-medium">Nenhum inadimplente.</p>}
        </TabsContent>
      </Tabs>
    </div>
  )
}
