// src/app/(auth)/onboarding/page.tsx
import type { Metadata } from 'next';
import { OnboardingFlow } from '@/features/auth/components/OnboardingFlow';

export const metadata: Metadata = {
  title: '시작하기 | Cramit',
};

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
