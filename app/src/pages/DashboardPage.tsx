import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTrialStatus } from '@/hooks/useTrialStatus'
import { BarChart3, FileText, Users, Clock, ArrowRight, PlusCircle } from 'lucide-react'

export default function DashboardPage() {
  const { profile, role } = useAuth()
  const trial = useTrialStatus()
  const navigate = useNavigate()

  const firstName = profile?.full_name?.split(' ')[0] || 'Consultor'

  const stats = [
    { icon: BarChart3, label: 'Simulações', value: profile?.simulacoes_count ?? 0, color: 'bg-blue-50 text-blue-500' },
    { icon: FileText, label: 'Propostas', value: profile?.propostas_count ?? 0, color: 'bg-purple-50 text-purple-500' },
    { icon: Users, label: 'Clientes', value: '—', color: 'bg-emerald-50 text-emerald-500' },
    { icon: Clock, label: trial.isPaidUser ? 'Plano' : 'Trial', value: trial.isPaidUser ? 'Pro' : `${trial.daysRemaining}d`, color: trial.isPaidUser ? 'bg-green-50 text-green-500' : 'bg-amber-50 text-amber-500' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Olá, {firstName}
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          {role === 'super_admin' ? 'Painel Administrativo' : 'Seu painel de simulações'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-2xl bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
            <div className={`mb-3 inline-flex rounded-xl p-2.5 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{value}</p>
            <p className="mt-0.5 text-sm text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Action */}
      <button
        onClick={() => navigate('/app/simulador')}
        className="group flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-[var(--color-navy)] to-[var(--color-navy-light)] p-6 text-left shadow-sm transition-all duration-200 hover:shadow-lg"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
            <PlusCircle size={24} className="text-[var(--color-lime)]" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">Nova Simulação</p>
            <p className="text-sm text-white/50">Criar proposta de consórcio</p>
          </div>
        </div>
        <ArrowRight size={20} className="text-white/40 transition-transform duration-200 group-hover:translate-x-1" />
      </button>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-3">
        <QuickLink icon={FileText} label="Histórico" desc="Ver simulações anteriores" onClick={() => navigate('/app/historico')} />
        <QuickLink icon={Users} label="Clientes" desc="Gerenciar seus clientes" onClick={() => navigate('/app/clientes')} />
        <QuickLink icon={Clock} label="Configurações" desc="Perfil e branding" onClick={() => navigate('/app/config')} />
      </div>
    </div>
  )
}

function QuickLink({ icon: Icon, label, desc, onClick }: { icon: typeof BarChart3; label: string; desc: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 rounded-2xl bg-white p-5 text-left shadow-sm transition-all duration-200 hover:shadow-md"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-400 transition-colors group-hover:bg-[var(--color-lime-faint)] group-hover:text-[var(--color-navy)]">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
    </button>
  )
}
