import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import { LiquidButton } from '@/components/ui/liquid-glass-button'

const navLinks = [
  { label: 'Simulador', href: '#simulador' },
  { label: 'Recursos', href: '#features' },
  { label: 'Preço', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

export default function LandingHeader() {
  const [, setSearchParams] = useSearchParams()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const heroHeight = window.innerHeight * 0.85
    const onScroll = () => {
      setScrolled(window.scrollY > 50)
      setHidden(window.scrollY > heroHeight)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={cn(
      'fixed z-50 w-full px-2 transition-all duration-500',
      hidden && '-translate-y-full opacity-0 pointer-events-none'
    )}>
      <nav
        data-state={menuOpen ? 'active' : undefined}
        className={cn(
          'mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12',
          scrolled && 'max-w-4xl rounded-2xl border border-white/50 bg-white/70 backdrop-blur-xl shadow-elevation-2 lg:px-5'
        )}
      >
        <div className="relative flex flex-wrap items-center justify-between gap-6 py-1 lg:gap-0 lg:py-1.5">
          <div className="flex w-full justify-between lg:w-auto">
            <a href="/" className="flex items-center">
              <img src="/assets/logo.png" alt="SimulaCotas" className="h-[108px]" />
            </a>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
            >
              <Menu className={cn('size-6 duration-200', menuOpen && 'rotate-180 scale-0 opacity-0')} />
              <X className={cn('absolute inset-0 m-auto size-6 duration-200', !menuOpen && '-rotate-180 scale-0 opacity-0')} />
            </button>
          </div>

          <div className="absolute inset-0 m-auto hidden size-fit lg:block">
            <ul className="flex gap-8 text-sm">
              {navLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-gray-500 hover:text-[#0D1B4B] duration-150 font-medium">{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className={cn(
            'mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border bg-white p-6 shadow-2xl shadow-zinc-300/20 lg:m-0 lg:flex lg:w-fit lg:gap-3 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none',
            menuOpen && 'block'
          )}>
            <div className="lg:hidden">
              <ul className="space-y-6 text-base">
                {navLinks.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="text-gray-500 hover:text-[#0D1B4B] duration-150" onClick={() => setMenuOpen(false)}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
              <LiquidButton size="sm" onClick={() => setSearchParams({ auth: 'login' })} className={cn('text-[#0D1B4B] font-semibold', scrolled && 'lg:hidden')}>
                Entrar
              </LiquidButton>
              <LiquidButton size="sm" onClick={() => setSearchParams({ auth: 'register' })} className={cn('text-[#0D1B4B] font-bold', scrolled && 'lg:hidden')}>
                Testar Grátis
              </LiquidButton>
              <LiquidButton size="sm" onClick={() => setSearchParams({ auth: 'register' })} className={cn('text-[#0D1B4B] font-bold', scrolled ? 'lg:inline-flex' : 'hidden')}>
                Começar
              </LiquidButton>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
