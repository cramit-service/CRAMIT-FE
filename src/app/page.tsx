// src/app/page.tsx
import { LandingHeader } from '@/features/landing/components/LandingHeader';
import { HeroSection } from '@/features/landing/components/HeroSection';
import { StorySection } from '@/features/landing/components/StorySection';
import { FinalCtaSection } from '@/features/landing/components/FinalCtaSection';
import { Logo } from '@/shared/ui/Logo';

export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <main>
        <HeroSection />
        <StorySection />
        <FinalCtaSection />
      </main>
      <footer className="text-label mx-auto flex max-w-[1200px] items-center justify-between border-t border-gray-100 px-4 py-8 text-gray-500">
        <Logo height={14} />
        <span>© 2026 Cramit</span>
      </footer>
    </>
  );
}
