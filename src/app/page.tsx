// src/app/page.tsx
import { LandingHeader } from '@/features/landing/components/LandingHeader';
import { HeroSection } from '@/features/landing/components/HeroSection';
import { IntroSection } from '@/features/landing/components/IntroSection';
import { ConnectSection } from '@/features/landing/components/ConnectSection';
import { FinalCtaSection } from '@/features/landing/components/FinalCtaSection';

export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <main>
        <HeroSection />
        <IntroSection />
        <ConnectSection />
        <FinalCtaSection />
      </main>
    </>
  );
}
