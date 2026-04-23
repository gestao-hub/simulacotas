import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTrialStatus } from '@/hooks/useTrialStatus'
import TrialBanner from '@/components/trial/TrialBanner'
import TrialExpiredModal from '@/components/trial/TrialExpiredModal'
import { PlusCircle, History, Users, Settings, BarChart3, CreditCard, Megaphone, Database, Shield, LogOut, MessageSquare, Crown, Clock, Zap, FileText, TrendingUp } from 'lucide-react'

const corretorLinks = [
  { to: '/app', icon: PlusCircle, label: 'Simulador' },
  { to: '/app/historico', icon: History, label: 'Histórico' },
  { to: '/app/clientes', icon: Users, label: 'Clientes' },
  { to: '/app/assinatura', icon: CreditCard, label: 'Assinatura' },
  { to: '/app/config', icon: Settings, label: 'Config' },
]

const adminLinks = [
  { to: '/app/admin', icon: BarChart3, label: 'Métricas' },
  { to: '/app/admin/financeiro', icon: CreditCard, label: 'Financeiro' },
  { to: '/app/admin/campanhas', icon: Megaphone, label: 'Campanhas' },
  { to: '/app/admin/administradoras', icon: Database, label: 'Administradoras' },
  { to: '/app/admin/configuracoes', icon: Shield, label: 'API Keys' },
  { to: '/app/admin/whatsapp', icon: MessageSquare, label: 'WhatsApp' },
]

export default function AppLayout() {
  const { profile, isAdmin, signOut } = useAuth()
  const trial = useTrialStatus()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-[#F5F5F7]">
      {/* Sidebar — desktop, fixed */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed top-0 left-0 flex h-screen w-64 flex-col border-r border-gray-100 bg-[#FAFAFA]">
          <div className="flex justify-center px-4 pt-4 pb-2">
            <img src="/assets/logo.png" alt="SimulaCotas" className="h-20 w-auto" />
          </div>

          <nav className="flex-1 space-y-3 overflow-y-auto px-3 py-2">
            <div className="space-y-1 rounded-2xl bg-white p-2 shadow-sm">
              {corretorLinks.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/app'}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[var(--color-navy)] text-white font-semibold shadow-sm'
                        : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700 hover:scale-[1.02]'
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </div>

            {isAdmin && (
              <div className="space-y-1 rounded-2xl bg-white p-2 shadow-sm">
                {adminLinks.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/app/admin'}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-[var(--color-navy)] text-white font-semibold shadow-sm'
                          : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700 hover:scale-[1.02]'
                      }`
                    }
                  >
                    <Icon size={18} />
                    {label}
                  </NavLink>
                ))}
              </div>
            )}

            {/* Card de assinatura */}
            {trial.isPaidUser ? (
              <div className="rounded-2xl bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-navy-light)] p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Crown size={16} className="text-[var(--color-lime)]" />
                  <span className="text-xs font-bold text-[var(--color-lime)] uppercase tracking-wider">Plano Pro</span>
                </div>
                <p className="text-[11px] text-white/50">Simulações ilimitadas</p>
                <p className="text-[11px] text-white/50">Todas as administradoras</p>
                <p className="text-[11px] text-white/50">PDF + WhatsApp</p>
              </div>
            ) : trial.isTrialActive ? (
              <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-amber-600" />
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Trial Gratuito</span>
                  </div>
                  <span className="text-lg font-extrabold text-amber-600">{trial.daysRemaining}d</span>
                </div>
                <div className="mb-3">
                  <div className="h-1.5 w-full rounded-full bg-amber-200/50">
                    <div className="h-1.5 rounded-full bg-amber-500 transition-all" style={{ width: `${((3 - trial.daysRemaining) / 3) * 100}%` }} />
                  </div>
                  <p className="mt-1 text-[10px] text-amber-600/70">{trial.daysRemaining} {trial.daysRemaining === 1 ? 'dia restante' : 'dias restantes'}</p>
                </div>
                <button
                  onClick={() => navigate('/app/checkout')}
                  className="w-full rounded-xl bg-[var(--color-navy)] py-2 text-xs font-bold text-white transition-all hover:bg-[var(--color-navy-light)] hover:scale-[1.02]"
                >
                  <Zap size={12} className="mr-1 inline" />
                  Assinar agora
                </button>
              </div>
            ) : trial.isTrialExpired ? (
              <div className="rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-200/50 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-red-500" />
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Trial Expirado</span>
                </div>
                <p className="text-[11px] text-red-600/70 mb-3">Seu período de teste acabou. Assine para continuar usando.</p>
                <button
                  onClick={() => navigate('/app/checkout')}
                  className="w-full rounded-xl bg-red-500 py-2 text-xs font-bold text-white transition-all hover:bg-red-600 hover:scale-[1.02]"
                >
                  Assinar agora
                </button>
              </div>
            ) : null}

            {/* Estatísticas rápidas */}
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Suas Métricas</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                      <TrendingUp size={14} className="text-blue-500" />
                    </div>
                    <span className="text-xs text-gray-500">Simulações</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{profile?.simulacoes_count ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50">
                      <FileText size={14} className="text-purple-500" />
                    </div>
                    <span className="text-xs text-gray-500">Propostas</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{profile?.propostas_count ?? 0}</span>
                </div>
              </div>
            </div>
          </nav>

          {/* Perfil + Logout */}
          <div className="px-3 pb-4">
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-navy)] text-sm font-bold text-[var(--color-lime)]">
                  {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'C'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{profile?.full_name ?? 'Consultor'}</p>
                  <p className="truncate text-xs text-gray-400">{profile?.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-gray-50 hover:text-gray-500"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content — scrollable */}
      <main className="flex-1 overflow-auto">
        {/* Mobile header */}
        <header className="sticky top-0 z-40 flex items-center justify-between bg-white/80 px-5 py-3 backdrop-blur-xl lg:hidden">
          <img src="/assets/logo.png" alt="SimulaCotas" className="h-7" />
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-navy)] text-[10px] font-bold text-[var(--color-lime)]">
            {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'C'}
          </div>
        </header>

        <TrialBanner />
        <div className="p-5 pb-28 lg:p-8 lg:pb-8">
          <Outlet />
        </div>
      </main>

      <TrialExpiredModal />

      {/* Bottom nav — mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-gray-100 bg-white/80 backdrop-blur-xl lg:hidden">
        {corretorLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/app'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-all duration-200 ${
                isActive
                  ? 'text-[var(--color-navy)]'
                  : 'text-gray-300'
              }`
            }
          >
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
