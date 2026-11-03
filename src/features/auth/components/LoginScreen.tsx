'use client';
// src/features/auth/components/LoginScreen.tsx
import { useEffect, useState } from 'react';
import { Logo } from '@/shared/ui/Logo';
import { GradientBackground } from '@/shared/ui/GradientBackground';
import { SocialButton } from './SocialButton';
import { socialLoginHref } from '@/features/auth/api';

export function LoginScreen({
  oauthFailed = false,
}: {
  oauthFailed?: boolean;
}) {
  // 링크라 JS 전에도 이동한다. 붙은 뒤에는 이동하는 동안 두 버튼을 잠근다 —
  // 연달아 누르면 인가 요청이 서로 덮어써 콜백이 실패할 수 있다.
  const [pending, setPending] = useState(false);
  const [showError, setShowError] = useState(oauthFailed);

  // 카카오 화면에서 뒤로 오면 bfcache가 잠긴 버튼 그대로 되살린다
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setPending(false);
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  const start = (e: React.MouseEvent) => {
    if (pending) {
      e.preventDefault();
      return;
    }
    setPending(true);
    setShowError(false);
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
            href={socialLoginHref('KAKAO')}
            pending={pending}
            onClick={start}
          />
          <SocialButton
            provider="GOOGLE"
            href={socialLoginHref('GOOGLE')}
            pending={pending}
            onClick={start}
          />
        </div>

        {showError && (
          <p role="alert" className="text-body-sm text-red-ink mt-6">
            로그인하지 못했어요. 잠시 후 다시 시도해 주세요.
          </p>
        )}
      </div>
    </div>
  );
}
