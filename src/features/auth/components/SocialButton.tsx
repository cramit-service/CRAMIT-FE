'use client';
// src/features/auth/components/SocialButton.tsx
import Image from 'next/image';
import { cn } from '@/shared/lib/cn';
import type { SocialProvider } from '../api';

interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  provider: SocialProvider;
}

// 브랜드 색상 — 카카오·구글 규정색이라 예외적으로 하드코딩한다 (디자인 토큰 아님).
// Figma: 카카오 #FFE812 채움 / 구글 흰색 채움, 둘 다 테두리 없음.
const providerStyles: Record<SocialProvider, string> = {
  KAKAO: 'bg-[#FFE812] hover:brightness-95',
  GOOGLE: 'bg-white hover:bg-gray-200',
};

// 아이콘도 브랜드 에셋이라 Figma에서 내보낸 원본 이미지를 그대로 쓴다.
// Figma 기준 아이콘 박스 52px 안에서 카카오 42px(0.81) / 구글 32px(0.62)라
// 40px 박스로 축소해도 같은 비율이 되도록 크기를 나눠 지정한다.
const providerIcons: Record<
  SocialProvider,
  { src: string; label: string; className: string }
> = {
  KAKAO: {
    src: '/social/kakao.png',
    label: '카카오로 시작하기',
    className: 'size-8 rounded-full',
  },
  GOOGLE: {
    src: '/social/google.png',
    label: 'Google로 시작하기',
    className: 'size-[25px]',
  },
};

// 소셜 로그인 전용 pill 버튼. 브랜드 색·아이콘 규격이 shared/ui/Button과 달라 auth 전용으로 둔다.
export function SocialButton({
  provider,
  className,
  disabled,
  ...props
}: SocialButtonProps) {
  const icon = providerIcons[provider];

  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center justify-center gap-3 rounded-full px-6 py-2.5 text-[19px] leading-[28px] font-medium tracking-[-0.48px] text-gray-950 transition',
        // 비활성이면 회색만, 아니면 브랜드 색 적용
        disabled
          ? 'cursor-not-allowed bg-gray-300 text-gray-600'
          : providerStyles[provider],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      <span className="flex size-10 shrink-0 items-center justify-center">
        <Image
          src={icon.src}
          alt=""
          width={64}
          height={64}
          className={icon.className}
        />
      </span>
      {icon.label}
    </button>
  );
}
