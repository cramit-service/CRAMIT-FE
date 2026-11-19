// src/app/(auth)/oauth/callback/page.tsx
import type { Metadata } from 'next';
import { OAuthCallback } from '@/features/auth/components/OAuthCallback';

export const metadata: Metadata = {
  title: '로그인 중 | Cramit',
};

export default function OAuthCallbackPage() {
  return <OAuthCallback />;
}
