// src/app/(main)/layout.tsx
import { MainNav } from '@/features/navigation/components/MainNav';

// 로그인 후 공통 레이아웃.
// 좌측에 공용 사이드바를 두고, 각 페이지 콘텐츠를 children으로 받는다.
// (홈/학습/설정 등 실제 화면 콘텐츠는 각 담당 feature에서 채운다.)
//
// 사이드바 폭·main 좌패딩·콘텐츠 열은 모두 --sidebar-w 하나를 보고, 그 값은 MainShell이 정한다.
// 강의 목록·프로필을 가져오는 일은 MainNav(features)가 한다 — shared/ui는 도메인을 모른다.
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainNav>{children}</MainNav>;
}
