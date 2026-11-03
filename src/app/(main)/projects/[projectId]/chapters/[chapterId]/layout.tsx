// src/app/(main)/projects/[projectId]/chapters/[chapterId]/layout.tsx
import { ChatDock } from '@/features/chat/components/ChatDock';
import { ChatDockProvider } from '@/shared/hooks/useChatDock';
import { toRouteId } from '@/shared/lib/routeId';

// 챗봇 도크는 학습 뷰어에만 뜬다. 대화가 주차에 묶여 있어 주차가 정해진 라우트여야 한다.
// Next 16: params는 Promise이므로 await로 푼다.
export default async function ChapterLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string; chapterId: string }>;
}) {
  const { projectId, chapterId } = await params;

  return (
    // 뷰어에서 고른 글을 챗독으로 넘기려고 둘을 한 프로바이더 아래 둔다.
    <ChatDockProvider>
      {children}
      {/* 탭과 패널이 둘 다 fixed라 children의 폭에도 흐름에도 영향이 없다. */}
      <ChatDock
        projectId={toRouteId(projectId)}
        chapterId={toRouteId(chapterId)}
      />
    </ChatDockProvider>
  );
}
