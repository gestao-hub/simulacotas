import { AnimatedGroup } from '@/components/ui/animated-group'

export default function LandingFooter() {
  return (
    <footer className="bg-[#0D1B4B] py-10">
      <AnimatedGroup preset="fade" className="mx-auto max-w-6xl px-6">
        <p className="text-xs text-white/30 text-center">
          SimulaCotas &copy; {new Date().getFullYear()} &middot; Simulação meramente informativa &middot; Valores sujeitos a confirmação pela administradora
        </p>
      </AnimatedGroup>
    </footer>
  )
}
