// src/app/page.tsx
import { LandingSplash } from '@/features/landing/components/LandingSplash';
import { LandingHeader } from '@/features/landing/components/LandingHeader';
import { HeroSection } from '@/features/landing/components/HeroSection';
import { IntroSection } from '@/features/landing/components/IntroSection';
import { ConnectSection } from '@/features/landing/components/ConnectSection';
import { FinalCtaSection } from '@/features/landing/components/FinalCtaSection';
import { ScrollTopButton } from '@/features/landing/components/ScrollTopButton';
import { ClickToScrollArea } from '@/features/landing/components/ClickToScrollArea';

export default function LandingPage() {
  return (
    <>
      <LandingSplash />
      <LandingHeader />
      {/* main을 대신 그린다 — 클릭 핸들러만 얹은 껍데기라 섹션들은 그대로 서버에서 렌더된다 */}
      <ClickToScrollArea>
        <HeroSection />
        <IntroSection />
        <ConnectSection />
        <FinalCtaSection />
      </ClickToScrollArea>
      {/* main 바깥에 둔다 — 문서 전체를 올리는 버튼이라 특정 섹션에 속하지 않는다 */}
      <ScrollTopButton />
    </>
  );
}
