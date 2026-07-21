'use client';
// src/features/study/components/viewer/StudyViewerScreen.tsx
import { useState } from 'react';
import { useProjectDetail } from '@/features/study/hooks/useProjectDetail';
import {
  useChapter,
  useLectureMaterial,
} from '@/features/study/hooks/useLectureMaterial';
import { ViewerHeader } from '@/features/study/components/viewer/ViewerHeader';
import { PdfMaterialTab } from '@/features/study/components/viewer/PdfMaterialTab';
import { SummaryTab } from '@/features/study/components/viewer/SummaryTab';
import { TabPlaceholder } from '@/features/study/components/viewer/TabPlaceholder';
import { Button } from '@/shared/ui/Button';
import type { ViewerTab } from '@/shared/types/api';

interface StudyViewerScreenProps {
  projectId: string;
  chapterId: string;
}

// 학습 뷰어(챕터 "학습하기" 진입) 화면. page.tsx는 이 컴포넌트를 조립만 한다.
export function StudyViewerScreen({
  projectId,
  chapterId,
}: StudyViewerScreenProps) {
  const [activeTab, setActiveTab] = useState<ViewerTab>('PDF');
  const projectQuery = useProjectDetail(projectId);
  const chapterQuery = useChapter(projectId, chapterId);
  const materialQuery = useLectureMaterial(chapterId);

  const queries = [projectQuery, chapterQuery, materialQuery];

  // 로딩 / 에러 / 빈 데이터를 구분한다.
  // 셋을 뭉뚱그려 falsy로 판단하면 조회에 실패해도 "불러오는 중…"에서 멈춘다.
  if (queries.some((q) => q.isPending)) {
    return <div className="p-10 text-gray-500">불러오는 중…</div>;
  }

  if (queries.some((q) => q.isError)) {
    return (
      <div className="flex flex-col items-start gap-4 p-10">
        <p className="text-gray-700">
          학습 자료를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => queries.forEach((q) => q.refetch())}
        >
          다시 시도
        </Button>
      </div>
    );
  }

  const project = projectQuery.data;
  const chapter = chapterQuery.data;
  const material = materialQuery.data;

  // 성공했는데 본문이 비어 있는 경우 (204 등)
  if (!project || !chapter || !material) {
    return (
      <div className="p-10 text-gray-500">표시할 학습 자료가 없습니다.</div>
    );
  }

  return (
    // Figma 시안은 1920 기준 절대 px라 실제 화면(사이드바 제외)에선 과하게 커진다.
    // 챕터 상세 화면과 같은 약 0.72배 축소 비율을 그대로 따른다.
    <div className="mx-auto w-full max-w-[1152px] px-8 pt-12 pb-12">
      <ViewerHeader
        chapter={chapter}
        project={project}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="mt-5">
        {activeTab === 'PDF' && <PdfMaterialTab material={material} />}
        {/* 요약은 이 탭에서만 필요하니 화면 진입 시가 아니라 탭 안에서 따로 조회한다 */}
        {activeTab === 'SUMMARY' && <SummaryTab chapterId={chapterId} />}
        {/* TODO(다음 이슈): 원문 스크립트 탭 — STT 원문 렌더 */}
        {activeTab === 'SCRIPT' && (
          <TabPlaceholder label="원문 스크립트는 다음 이슈에서 구현합니다." />
        )}
        {/* TODO(todo 담당): TODO 탭은 다른 담당 영역이라 자리만 잡아둔다 */}
        {activeTab === 'TODO' && (
          <TabPlaceholder label="TODO 탭은 담당자가 구현합니다." />
        )}
      </div>
    </div>
  );
}
