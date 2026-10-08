'use client';
// src/features/auth/components/OAuthCallback.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { completeSocialLogin } from '@/features/auth/api';

// 백엔드가 소셜 인가를 마치고 돌려보내는 자리. 토큰만 받아 두고 바로 넘긴다.
export function OAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const next = completeSocialLogin(
      new URLSearchParams(window.location.search),
    );
    // replace — 토큰이 담긴 주소를 방문 기록에 남기지 않는다
    router.replace(next ?? '/login?error=oauth');
  }, [router]);

  return null;
}
