'use client';
// src/features/auth/components/LoginScreen.tsx
import { useState } from 'react';
import { Logo } from '@/shared/ui/Logo';
import { SocialButton } from './SocialButton';
import { startSocialLogin, saveAuthTokens, type SocialProvider } from '../api';

export function LoginScreen() {
  // 진행 중인 제공자. 응답을 기다리는 동안 두 버튼을 함께 잠근다.
  const [pending, setPending] = useState<SocialProvider | null>(null);

  const handleLogin = async (provider: SocialProvider) => {
    if (pending) return;
    setPending(provider);

    try {
      const tokens = await startSocialLogin(provider);
      saveAuthTokens(tokens);

      // TODO: 로그인 성공 후 신규/기존 회원 분기.
      //   신규 → 온보딩(약관 → 닉네임), 기존 → 홈.
      // 백엔드 담당에게 확인 필요: 소셜 로그인 응답에 신규/기존 회원을 구분하는 필드가 있는지,
      // 있다면 필드명이 무엇인지. 확인되면 LoginResponse(shared/types/api.ts)에 추가하고
      // 그 값으로 여기서 갈라야 한다. 온보딩 화면 작업 전까지는 스펙이 확정돼야 한다.
      console.log(`[mock] ${provider} 로그인 성공 — 다음 화면으로 이동할 자리`);
    } catch (error) {
      // TODO: 공통 에러 토스트가 생기면 교체
      console.error('소셜 로그인 실패', error);
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <Logo className="text-5xl md:text-6xl" />

      <div className="mt-24 flex w-full flex-col gap-4">
        <SocialButton
          provider="KAKAO"
          disabled={pending !== null}
          onClick={() => handleLogin('KAKAO')}
        />
        <SocialButton
          provider="GOOGLE"
          disabled={pending !== null}
          onClick={() => handleLogin('GOOGLE')}
        />
      </div>
    </div>
  );
}
