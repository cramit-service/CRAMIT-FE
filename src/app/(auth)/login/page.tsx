// src/app/(auth)/login/page.tsx
import { LoginScreen } from '@/features/auth/components/LoginScreen';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // 백엔드 인가 실패(?error=oauth_login_failed)와 토큰 없는 콜백(?error=oauth) 둘 다 온다
  const { error } = await searchParams;
  return <LoginScreen oauthFailed={error !== undefined} />;
}
