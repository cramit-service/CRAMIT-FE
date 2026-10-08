'use client';
// src/features/auth/components/LoginScreen.tsx
import { useEffect, useRef, useState } from 'react';
import { Logo } from '@/shared/ui/Logo';
import { GradientBackground } from '@/shared/ui/GradientBackground';
import { SocialButton } from './SocialButton';
import { startSocialLogin, type SocialProvider } from '@/features/auth/api';

const LOGIN_FAILED = '로그인하지 못했어요. 잠시 후 다시 시도해 주세요.';

export function LoginScreen({
  oauthFailed = false,
}: {
  oauthFailed?: boolean;
}) {
  // 진행 중인 제공자. 페이지를 떠날 때까지 두 버튼을 함께 잠근다.
  const [pending, setPending] = useState<SocialProvider | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    oauthFailed ? LOGIN_FAILED : null,
  );

  // state는 동기로 갱신되지 않아 같은 tick에 연타하면 pending이 계속 null로 보인다.
  // 리렌더 전에도 막으려면 ref로 검사해야 한다.
  const isRunning = useRef(false);

  // 카카오 화면에서 뒤로 오면 bfcache가 잠긴 버튼 그대로 되살린다
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      isRunning.current = false;
      setPending(null);
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  const handleLogin = async (provider: SocialProvider) => {
    if (isRunning.current) return;
    isRunning.current = true;
    setPending(provider);
    setErrorMessage(null);

    try {
      await startSocialLogin(provider);
      // 성공하면 페이지가 넘어가므로 잠금을 풀지 않는다 — 풀면 이동 직전 버튼이 다시 살아난다
    } catch (error) {
      // TODO: 공통 에러 토스트가 생기면 그쪽으로 옮긴다
      console.error('소셜 로그인 실패', error);
      setErrorMessage(LOGIN_FAILED);
      isRunning.current = false;
      setPending(null);
    }
  };

  return (
    // (auth) 레이아웃은 중립 골격만 두므로 배경·정렬을 이 화면이 직접 잡는다.
    // 배경은 layer로 깔고 정렬은 이 div가 갖는다 — 공통 부품에 className을 넘기면
    // 부품의 생김새가 호출처로 샌다(CONTRIBUTING).
    <div className="bg-canvas relative flex min-h-screen flex-col items-center justify-center px-6">
      <GradientBackground layer variant="login" />
      {/* Figma: 워드마크 → 200px 간격 → 소셜 버튼 2개(간격 20px) */}
      {/* relative 필수 — 위 layer가 absolute라 뒤에 오는 흐름 내용보다 나중에 칠해진다.
          bg-canvas가 불투명이라 이게 없으면 화면이 통째로 가려진다(랜딩의 두 섹션도
          같은 이유로 내용을 relative로 감싼다). */}
      <div className="relative flex w-full max-w-[500px] flex-col items-center">
        {/* md:h-14로 한 단 커지고 있었다. §5가 "부품 내부 치수는 어느 폭에서도 그대로"라
            해서 한 값으로 둔다. */}
        <Logo height={48} />

        <div className="mt-32 flex w-full flex-col gap-4 md:mt-40">
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
          <p role="alert" className="text-body-sm text-red-ink mt-6">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
