// src/app/(auth)/layout.tsx
import { GradientBackground } from '@/shared/ui/GradientBackground';

// 로그인 전 공통 레이아웃. 헤더·사이드바 없이 그라데이션 위 중앙 정렬만 잡는다.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GradientBackground className="flex min-h-screen flex-col items-center justify-center px-6">
      {children}
    </GradientBackground>
  );
}
