// src/app/(main)/projects/[projectId]/chapters/new/page.tsx
import { NewChapterScreen } from '@/features/project/components/NewChapterScreen';

// 새 주차 등록 페이지. 모달 대신 학습 화면 자리로 바로 들어온다.
// 정적 세그먼트라 같은 깊이의 [chapterId]보다 먼저 잡힌다.
// Next 16: params는 Promise이므로 await로 푼다.
export default async function NewChapterPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <NewChapterScreen projectId={projectId} />;
}
