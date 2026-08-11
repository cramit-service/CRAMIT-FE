// src/app/page.tsx
import { LandingSplash } from '@/features/landing/components/LandingSplash';
import { LandingHeader } from '@/features/landing/components/LandingHeader';
import { HeroSection } from '@/features/landing/components/HeroSection';
import { IntroSection } from '@/features/landing/components/IntroSection';
import { ConnectSection } from '@/features/landing/components/ConnectSection';
import { FinalCtaSection } from '@/features/landing/components/FinalCtaSection';
import { ScrollTopButton } from '@/features/landing/components/ScrollTopButton';

export default function LandingPage() {
  return (
    <>
      <LandingSplash />
      <LandingHeader />
      <main>
        <HeroSection />
        <IntroSection />
        <ConnectSection />
        <FinalCtaSection />
      </main>
      {/* main 바깥에 둔다 — 문서 전체를 올리는 버튼이라 특정 섹션에 속하지 않는다 */}
      <ScrollTopButton />
    </>
  );
}
