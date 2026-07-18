'use client';
// src/features/auth/components/SocialButton.tsx
import { cn } from '@/shared/lib/cn';
import { KakaoIcon, GoogleIcon } from './icons';
import type { SocialProvider } from '../api';

interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  provider: SocialProvider;
}

// 브랜드 색상 — 카카오·구글 규정색이라 예외적으로 하드코딩한다 (디자인 토큰 아님)
const providerStyles: Record<SocialProvider, string> = {
  KAKAO: 'bg-[#FEE500] text-[#191600] hover:brightness-95',
  GOOGLE: 'border border-gray-300 bg-gray-100 text-gray-900 hover:bg-gray-200',
};

const providerLabels: Record<SocialProvider, string> = {
  KAKAO: '카카오로 시작하기',
  GOOGLE: 'Google로 시작하기',
};

// 소셜 로그인 전용 pill 버튼. 브랜드 색·아이콘 규격이 shared/ui/Button과 달라 auth 전용으로 둔다.
export function SocialButton({
  provider,
  className,
  disabled,
  ...props
}: SocialButtonProps) {
  const Icon = provider === 'KAKAO' ? KakaoIcon : GoogleIcon;

  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center justify-center gap-3 rounded-full px-6 py-4 text-base font-medium transition',
        // 비활성이면 회색만, 아니면 브랜드 색 적용
        disabled
          ? 'cursor-not-allowed bg-gray-300 text-gray-600'
          : providerStyles[provider],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {providerLabels[provider]}
    </button>
  );
}
