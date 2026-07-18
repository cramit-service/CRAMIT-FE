// src/app/(main)/layout.tsx
import { Sidebar } from '@/shared/ui/Sidebar';

// 로그인 후 공통 레이아웃.
// 좌측에 공용 사이드바를 두고, 각 페이지 콘텐츠를 children으로 받는다.
// (홈/학습/설정 등 실제 화면 콘텐츠는 각 담당 feature에서 채운다.)
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-primary-100 flex min-h-screen">
      <Sidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
