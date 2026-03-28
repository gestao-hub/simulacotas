import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, CreditCard, FileText, TrendingUp, UserPlus, AlertTriangle } from 'lucide-react'

interface KPIs {
  total_corretores: number
  corretores_ativos: number
  corretores_trial: number
  corretores_inadimplentes: number
  total_simulacoes: number
  total_propostas: number
}

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [recentUsers, setRecentUsers] = useState<Array<{ id: string; full_name: string | null; email: string | null; status: string; created_at: string }>>([])

  useEffect(() => {
    const fetchKPIs = async () => {
      const [profiles, simulacoes, propostas] = await Promise.all([
        supabase.from('profiles').select('status', { count: 'exact' }),
        supabase.from('simulacoes').select('id', { count: 'exact', head: true }),
        supabase.from('propostas_geradas').select('id', { count: 'exact', head: true }),
      ])

      const all = profiles.data ?? []
      setKpis({
        total_corretores: all.length,
        corretores_ativos: all.filter((p) => p.status === 'ativo').length,
        corretores_trial: all.filter((p) => p.status === 'trial').length,
        corretores_inadimplentes: all.filter((p) => p.status === 'inadimplente').length,
        total_simulacoes: simulacoes.count ?? 0,
        total_propostas: propostas.count ?? 0,
      })
    }

    const fetchRecent = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10)
      setRecentUsers(data ?? [])
    }

    fetchKPIs()
    fetchRecent()
  }, [])

  const cards = kpis ? [
    { label: 'Consultores', value: kpis.total_corretores, icon: Users, bg: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'Ativos', value: kpis.corretores_ativos, icon: TrendingUp, bg: 'bg-green-50', iconColor: 'text-green-500' },
    { label: 'Trial', value: kpis.corretores_trial, icon: UserPlus, bg: 'bg-amber-50', iconColor: 'text-amber-500' },
    { label: 'Inadimplentes', value: kpis.corretores_inadimplentes, icon: AlertTriangle, bg: 'bg-red-50', iconColor: 'text-red-500' },
    { label: 'Simulações', value: kpis.total_simulacoes, icon: FileText, bg: 'bg-indigo-50', iconColor: 'text-indigo-500' },
    { label: 'Propostas', value: kpis.total_propostas, icon: CreditCard, bg: 'bg-purple-50', iconColor: 'text-purple-500' },
  ] : []

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      trial: 'bg-amber-100 text-amber-800',
      ativo: 'bg-green-100 text-green-800',
      inadimplente: 'bg-red-100 text-red-800',
      cancelado: 'bg-gray-100 text-gray-800',
      suspenso: 'bg-orange-100 text-orange-800',
    }
    return map[status] ?? 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map(({ label, value, icon: Icon, bg, iconColor }) => (
          <div key={label} className="rounded-xl bg-white p-4 shadow-sm">
            <div className={`mb-2 inline-flex rounded-lg p-2 ${bg}`}>
              <Icon size={16} className={iconColor} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-gray-900 uppercase tracking-wide">Últimos cadastros</h2>
        <div className="space-y-2">
          {recentUsers.map((u) => (
            <div key={u.id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-xs font-bold text-white">
                {u.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{u.full_name || u.email}</p>
                <p className="text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusBadge(u.status)}`}>
                {u.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
