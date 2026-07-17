'use client';
// src/shared/ui/GradientBackground.tsx
import { cn } from '@/shared/lib/cn';

interface GradientBackgroundProps {
  // true면 부모를 꽉 채우는 배경 레이어가 된다 (부모에 relative 필요).
  // false면 스스로 relative 컨테이너가 되어 children을 감싼다.
  layer?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// 랜딩 히어로·하단 CTA·로그인 화면이 공유하는 연두~하늘 파스텔 배경.
// 토큰 색 원을 흐리게 겹쳐 mesh 그라데이션처럼 보이게 한다.
export function GradientBackground({
  layer = false,
  className,
  children,
}: GradientBackgroundProps) {
  return (
    // isolate로 스택 컨텍스트를 만들어 -z-10 블롭이 부모 배경 뒤로 빠지지 않게 한다.
    // position은 cn()이 병합해주지 않으므로 className으로 덮지 말고 layer로 분기한다.
    <div
      className={cn(
        'bg-primary-100 isolate overflow-hidden',
        layer ? 'absolute inset-0' : 'relative',
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-secondary-200 absolute -top-1/4 -left-1/5 h-[75%] w-[55%] rounded-full opacity-70 blur-3xl" />
        <div className="bg-primary-200 absolute -top-1/3 -right-1/5 h-[85%] w-[55%] rounded-full opacity-80 blur-3xl" />
        <div className="bg-primary-200 absolute -bottom-1/4 left-1/5 h-[70%] w-[50%] rounded-full opacity-60 blur-3xl" />
        <div className="bg-secondary-200 absolute -right-1/5 -bottom-1/3 h-[70%] w-[45%] rounded-full opacity-60 blur-3xl" />
      </div>
      {children}
    </div>
  );
}
