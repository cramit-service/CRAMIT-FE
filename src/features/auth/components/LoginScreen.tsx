'use client';
// src/features/auth/components/LoginScreen.tsx
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/shared/ui/Logo';
import { GradientBackground } from '@/shared/ui/GradientBackground';
import { SocialButton } from './SocialButton';
import { startSocialLogin, saveAuthTokens, type SocialProvider } from '../api';

export function LoginScreen() {
  const router = useRouter();
  // 진행 중인 제공자. 응답을 기다리는 동안 두 버튼을 함께 잠근다.
  const [pending, setPending] = useState<SocialProvider | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // state는 동기로 갱신되지 않아 같은 tick에 연타하면 pending이 계속 null로 보인다.
  // 리렌더 전에도 막으려면 ref로 검사해야 한다.
  const isRunning = useRef(false);

  const handleLogin = async (provider: SocialProvider) => {
    if (isRunning.current) return;
    isRunning.current = true;
    setPending(provider);
    setErrorMessage(null);

    try {
      const tokens = await startSocialLogin(provider);
      saveAuthTokens(tokens);

      // TODO: 지금은 모두 온보딩으로 보낸다. 기존 회원은 홈으로 가야 하므로 분기가 필요하다.
      // 백엔드 담당에게 확인 필요: 소셜 로그인 응답에 신규/기존 회원을 구분하는 필드가 있는지,
      // 있다면 필드명이 무엇인지. 확인되면 LoginResponse(shared/types/api.ts)에 추가하고
      // 그 값으로 여기서 갈라야 한다(신규 → /onboarding, 기존 → 홈).
      router.push('/onboarding');
    } catch (error) {
      // TODO: 공통 에러 토스트가 생기면 그쪽으로 옮긴다
      console.error('소셜 로그인 실패', error);
      setErrorMessage('로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      isRunning.current = false;
      setPending(null);
    }
  };

  return (
    // (auth) 레이아웃은 중립 골격만 두므로 배경·정렬을 이 화면이 직접 잡는다
    <GradientBackground className="flex min-h-screen flex-col items-center justify-center px-6">
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

        {errorMessage && (
          <p role="alert" className="text-error mt-6 text-sm">
            {errorMessage}
          </p>
        )}
      </div>
    </GradientBackground>
  );
}
