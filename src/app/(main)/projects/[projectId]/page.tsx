// src/app/(main)/projects/[projectId]/page.tsx
import { ChapterDetailScreen } from '@/features/study/components/ChapterDetailScreen';

// 챕터 상세(단계별 학습) 페이지. 얇게 유지하고 조립만 한다.
// Next 16: params는 Promise이므로 await로 푼다.
export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ChapterDetailScreen projectId={projectId} />;
}
