// src/app/(main)/layout.tsx
import { Sidebar } from '@/shared/ui/Sidebar';

// 로그인 후 공통 레이아웃.
// 좌측에 공용 사이드바를 두고, 각 페이지 콘텐츠를 children으로 받는다.
// (홈/학습/설정 등 실제 화면 콘텐츠는 각 담당 feature에서 채운다.)
//
// 사이드바는 fixed라 흐름 밖에 있다. 그래서 main의 좌패딩은 사이드바의 현재 폭이 아니라
// 접힘 레일 폭(90px)에 고정한다 — 펼쳐도 콘텐츠가 밀리지 않는다.
// 이 값이 시안과 맞는 근거는 home/page.tsx의 주석에 있다(홈 시안 24:9523이 접힌 레일 기준).
// Sidebar의 접힘 폭(w-22.5)과 한 쌍이라 한쪽을 바꾸면 다른 쪽도 같이 바꿔야 한다.
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-primary-100 min-h-screen">
      <Sidebar />
      <main className="pl-22.5">{children}</main>
    </div>
  );
}
