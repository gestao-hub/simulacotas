import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Home, PlusCircle, History, Users, Settings, BarChart3, CreditCard, Megaphone, Database, Shield, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
]

export default function AppLayout() {
  const { profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — desktop */}
      <aside className="hidden w-64 flex-col border-r border-[var(--color-border)] bg-white lg:flex">
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-5 py-4">
          <img src="/assets/icone.png" alt="SC" className="h-8 w-8" />
          <span className="text-lg font-bold text-[var(--color-navy)]">
            Simula<span className="text-[var(--color-lime-dark)]">Cotas</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Corretor</p>
          {corretorLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/app'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--color-navy)] text-white'
                    : 'text-[var(--color-foreground)] hover:bg-[var(--color-lime-faint)]'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="my-3 h-px bg-[var(--color-border)]" />
              <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Admin</p>
              {adminLinks.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/app/admin'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[var(--color-navy)] text-white'
                        : 'text-[var(--color-foreground)] hover:bg-[var(--color-lime-faint)]'
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="border-t border-[var(--color-border)] px-3 py-3">
          <div className="mb-2 flex items-center gap-2 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-navy)] text-xs font-bold text-[var(--color-lime)]">
              {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'C'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--color-foreground)]">{profile?.full_name ?? 'Corretor'}</p>
              <p className="truncate text-xs text-[var(--color-muted)]">{profile?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-[var(--color-muted)]" onClick={handleSignOut}>
            <LogOut size={16} />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile header */}
        <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <img src="/assets/icone.png" alt="SC" className="h-7 w-7" />
            <span className="text-base font-bold text-[var(--color-navy)]">
              Simula<span className="text-[var(--color-lime-dark)]">Cotas</span>
            </span>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-navy)] text-[10px] font-bold text-[var(--color-lime)]">
            {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'C'}
          </div>
        </header>

        <div className="p-4 pb-24 lg:p-8 lg:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Bottom nav — mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-[var(--color-border)] bg-white lg:hidden">
        {corretorLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/app'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition-colors ${
                isActive
                  ? 'text-[var(--color-navy)]'
                  : 'text-[var(--color-muted)]'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
