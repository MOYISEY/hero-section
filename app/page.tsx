import { LandingHero } from "@/components/landing/hero"
import { TrustedBar } from "@/components/landing/trusted-bar"
import { LandingFeatures } from "@/components/landing/features"
import { LandingProcess } from "@/components/landing/process"
import { LandingFinalCTA } from "@/components/landing/final-cta"

export default function HomePage() {
  return (
    <>
      <LandingHero />
      <TrustedBar />
      <LandingFeatures />
      <LandingProcess />
      <LandingFinalCTA />
    </>
  )
}
