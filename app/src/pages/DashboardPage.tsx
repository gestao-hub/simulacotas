import { useAuth } from '@/contexts/AuthContext'

export default function DashboardPage() {
  const { profile, role } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-navy)]">
          Olá, {profile?.full_name || 'Corretor'}!
        </h1>
        <p className="text-[var(--color-muted)]">
          {role === 'super_admin' ? 'Painel Administrativo' : 'Seu painel de simulações'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Simulações" value={profile?.simulacoes_count ?? 0} />
        <StatCard label="Propostas geradas" value={profile?.propostas_count ?? 0} />
        <StatCard label="Status" value={profile?.status ?? 'trial'} />
        <StatCard label="Plano" value="Pro — R$ 189,90" />
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">{label}</p>
      <p className="mt-1 text-xl font-bold text-[var(--color-navy)]">{value}</p>
    </div>
  )
}
