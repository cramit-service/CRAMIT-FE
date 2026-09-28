'use client';
// src/features/auth/components/SocialButton.tsx
import Image from 'next/image';
import { cn } from '@/shared/lib/cn';
import type { SocialProvider } from '@/features/auth/api';

interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  provider: SocialProvider;
}

// 브랜드 색 — 카카오·구글 규정색이라 §2 바깥이다. 이 파일만 임의 색을 허락한다
// (eslint.config.mjs). 규정색은 우리가 고를 수 있는 값이 아니라서, 토큰으로 옮기면
// 다음 사람이 "§2에 있으니 다른 데서도 써도 되겠다"로 읽는다.
// 구글은 흰 채움인데 bg-white가 토큰에서 지워져 투명하게 렌더되고 있었다 —
// 흰 표면의 이름은 surface다. 호버는 §2의 8%를 채움에 곱하는 방식으로 통일한다.
const providerStyles: Record<SocialProvider, string> = {
  KAKAO: 'bg-[#FFE812] hover:brightness-92',
  GOOGLE: 'bg-surface hover:brightness-92',
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
        'text-body-md flex w-full items-center justify-center gap-3 rounded-full px-6 py-2.5 font-medium text-gray-800 transition',
        // 비활성이면 회색만, 아니면 브랜드 색 적용
        disabled
          ? 'cursor-not-allowed bg-gray-200 text-gray-500'
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
