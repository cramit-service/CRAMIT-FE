// src/app/(main)/projects/[projectId]/layout.tsx
import { ChatDock } from '@/features/chat/components/ChatDock';

// 프로젝트(과목) 진입 후 공통 레이아웃.
// (main) 사이드바 위에 얹히는 2중 구조 — 사이드바는 (main)/layout에 이미 있어 건드리지 않는다.
// 이 레이아웃은 프로젝트 하위(study/chat/todo/share)에서만 채팅 도크를 함께 렌더한다.
// Next 16: params는 Promise이므로 await로 푼다 (page.tsx와 동일).
export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="relative min-h-screen">
      {children}
      {/* 챗봇 탭 + 패널. 오버레이 방식이라 children 폭에는 영향 없다.
          대화는 프로젝트 단위라 projectId를 내려준다. */}
      <ChatDock projectId={projectId} />
    </div>
  );
}
