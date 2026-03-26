import { AnimatedGroup } from '@/components/ui/animated-group'

export default function LandingFooter() {
  return (
    <footer className="bg-[#0D1B4B] py-10">
      <AnimatedGroup preset="fade" className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <img src="/assets/icone.png" alt="SC" className="h-6 w-6 opacity-60" />
            <span className="text-sm font-bold text-white/40">
              Simula<span className="text-[#CCEE00]/40">Cotas</span>
            </span>
          </div>
          <p className="text-xs text-white/30 text-center">
            SimulaCotas &copy; {new Date().getFullYear()} &middot; Simulação meramente informativa &middot; Valores sujeitos a confirmação pela administradora
          </p>
        </div>
      </AnimatedGroup>
    </footer>
  )
}
