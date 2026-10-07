// src/app/(auth)/login/page.tsx
import type { Metadata } from 'next';
import { LoginScreen } from '@/features/auth/components/LoginScreen';

export const metadata: Metadata = {
  title: '로그인 | Cramit',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // 소셜 콜백이 토큰 없이 돌아오면 ?error=oauth로 넘어온다
  const { error } = await searchParams;
  return <LoginScreen oauthFailed={error === 'oauth'} />;
}
