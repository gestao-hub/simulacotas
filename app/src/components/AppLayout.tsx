import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTrialStatus } from '@/hooks/useTrialStatus'
import TrialBanner from '@/components/trial/TrialBanner'
import TrialExpiredModal from '@/components/trial/TrialExpiredModal'
import { Home, PlusCircle, History, Users, Settings, BarChart3, CreditCard, Megaphone, Database, Shield, LogOut, MessageSquare } from 'lucide-react'

const corretorLinks = [
  { to: '/app', icon: Home, label: 'Início' },
  { to: '/app/simulador', icon: PlusCircle, label: 'Nova' },
  { to: '/app/historico', icon: History, label: 'Histórico' },
  { to: '/app/clientes', icon: Users, label: 'Clientes' },
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
          <div className="flex justify-center px-5 py-6">
            <img src="/assets/logo.png" alt="SimulaCotas" className="h-12" />
          </div>

          <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-2">
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
              <>
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
              </>
            )}
          </nav>

          <div className="px-3 pb-4">
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-navy)] text-sm font-bold text-[var(--color-lime)]">
                  {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'C'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{profile?.full_name ?? 'Corretor'}</p>
                  <p className="truncate text-xs text-gray-400">{profile?.email}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                {trial.isPaidUser && (
                  <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-bold text-green-600">Pro</span>
                )}
                {trial.isTrialActive && (
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-600">
                    Trial · {trial.daysRemaining}d
                  </span>
                )}
                {trial.isTrialExpired && (
                  <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-bold text-red-500">Expirado</span>
                )}
                {!trial.isPaidUser && !trial.isTrialActive && !trial.isTrialExpired && <span />}
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
