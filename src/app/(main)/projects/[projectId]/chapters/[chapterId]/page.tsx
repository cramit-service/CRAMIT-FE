// src/app/(main)/projects/[projectId]/chapters/[chapterId]/page.tsx
import { StudyViewerScreen } from '@/features/study/components/viewer/StudyViewerScreen';

// 학습 뷰어(PDF/요약/원문/TODO) 페이지. 얇게 유지하고 조립만 한다.
// projects/[projectId] 하위라 프로젝트 레이아웃(채팅 도크)이 그대로 적용된다.
// Next 16: params는 Promise이므로 await로 푼다.
export default async function StudyViewerPage({
  params,
}: {
  params: Promise<{ projectId: string; chapterId: string }>;
}) {
  const { projectId, chapterId } = await params;
  return <StudyViewerScreen projectId={projectId} chapterId={chapterId} />;
}
