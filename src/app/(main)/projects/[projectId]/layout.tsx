// src/app/(main)/projects/[projectId]/layout.tsx
import { ChatDock } from '@/features/chat/components/ChatDock';

// 프로젝트(과목) 진입 후 공통 레이아웃.
// (main) 사이드바 위에 얹히는 2중 구조 — 사이드바는 (main)/layout에 이미 있어 건드리지 않는다.
// 이 레이아웃은 프로젝트 하위(study/chat/todo/share)에서만 채팅 도크를 함께 렌더한다.
export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      {children}
      {/* 채팅 탭 + 패널. 오버레이 방식이라 children 폭에는 영향 없다. */}
      <ChatDock />
    </div>
  );
}
