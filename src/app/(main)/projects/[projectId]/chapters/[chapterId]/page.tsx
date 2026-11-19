// src/app/(main)/projects/[projectId]/chapters/[chapterId]/page.tsx
import { StudyViewerScreen } from '@/features/study/components/viewer/StudyViewerScreen';
import { toRouteId } from '@/shared/lib/routeId';

// 학습 뷰어(PDF/요약/원문/TODO) 페이지. 얇게 유지하고 조립만 한다.
// 채팅 도크는 같은 폴더의 layout이 붙인다.
// Next 16: params는 Promise이므로 await로 푼다.
export default async function StudyViewerPage({
  params,
}: {
  params: Promise<{ projectId: string; chapterId: string }>;
}) {
  const { projectId, chapterId } = await params;
  return (
    <StudyViewerScreen
      projectId={toRouteId(projectId)}
      chapterId={toRouteId(chapterId)}
    />
  );
}
