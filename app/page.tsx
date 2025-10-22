import { HeroSection } from '@/components/home/hero-section'
import { FeaturesSection } from '@/components/home/features-section'
import { WorkflowsSection } from '@/components/home/workflows-section'
import { PricingSection } from '@/components/home/pricing-section'
import { CTASection } from '@/components/home/cta-section'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <HeroSection />
      <FeaturesSection />
      <WorkflowsSection />
      <PricingSection />
      <CTASection />
    </main>
  )
}
