// src/app/(auth)/login/page.tsx
import type { Metadata } from 'next';
import { LoginScreen } from '@/features/auth/components/LoginScreen';

export const metadata: Metadata = {
  title: '로그인 | Cramit',
};

export default function LoginPage() {
  return <LoginScreen />;
}
