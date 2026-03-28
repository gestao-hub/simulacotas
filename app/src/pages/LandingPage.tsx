import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
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
import AuthModal from '@/components/auth/AuthModal'

export default function LandingPage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && session) {
      navigate('/app', { replace: true })
    }
  }, [session, loading, navigate])

  return (
    <div className="min-h-screen overflow-hidden bg-[#f8f9fa]">
      <GlassFilter />
      <LandingHeader />
      <HeroSection />
      <LogoCloudSection />
      <StatsSection />
      <ProblemSection />
      <SimuladorSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTAFinalSection />
      <LandingFooter />
      <AuthModal />
    </div>
  )
}
