import { GlassFilter } from '@/components/ui/liquid-glass'
import LandingHeader from '@/components/landing/LandingHeader'
import HeroSection from '@/components/landing/HeroSection'
import LogoCloudSection from '@/components/landing/LogoCloudSection'
import StatsSection from '@/components/landing/StatsSection'
import ProblemSection from '@/components/landing/ProblemSection'
import SimuladorSection from '@/components/landing/SimuladorSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import PricingSection from '@/components/landing/PricingSection'
import FAQSection from '@/components/landing/FAQSection'
import CTAFinalSection from '@/components/landing/CTAFinalSection'
import LandingFooter from '@/components/landing/LandingFooter'

function Divider({ from, to }: { from: string; to: string }) {
  return <div className="h-20 md:h-28" style={{ background: `linear-gradient(to bottom, ${from}, ${to})` }} />
}

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      <GlassFilter />
      <LandingHeader />

      {/* Hero — white with mesh gradient + orbs */}
      <HeroSection />

      {/* Logo Cloud — white */}
      <LogoCloudSection />

      {/* Stats — DARK navy section */}
      <StatsSection />

      {/* Problem — muted lime bg */}
      <ProblemSection />

      {/* Divider muted → white */}
      <Divider from="hsl(80 30% 96%)" to="white" />

      {/* Simulador — white with blobs */}
      <SimuladorSection />

      {/* Divider white → muted */}
      <Divider from="white" to="hsl(80 30% 96%)" />

      {/* Features — muted lime bg */}
      <FeaturesSection />

      {/* Divider muted → white */}
      <Divider from="hsl(80 30% 96%)" to="white" />

      {/* How it works — white with blob */}
      <HowItWorksSection />

      {/* Divider white → muted */}
      <Divider from="white" to="hsl(80 30% 96%)" />

      {/* Testimonials — muted bg */}
      <TestimonialsSection />

      {/* Divider muted → white */}
      <Divider from="hsl(80 30% 96%)" to="white" />

      {/* Pricing — white */}
      <PricingSection />

      {/* FAQ — white with blob */}
      <FAQSection />

      {/* CTA Final — dark navy */}
      <CTAFinalSection />

      {/* Footer — dark navy */}
      <LandingFooter />
    </div>
  )
}
