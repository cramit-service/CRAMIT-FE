'use client';
// src/features/study/components/viewer/StudyViewerScreen.tsx
import { useState } from 'react';
import { useProjectDetail } from '../../hooks/useProjectDetail';
import { useChapter, useLectureMaterial } from '../../hooks/useLectureMaterial';
import { ViewerHeader } from './ViewerHeader';
import { PdfMaterialTab } from './PdfMaterialTab';
import { TabPlaceholder } from './TabPlaceholder';
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
  const { data: project } = useProjectDetail(projectId);
  const { data: chapter } = useChapter(projectId, chapterId);
  const { data: material } = useLectureMaterial(chapterId);

  if (!project || !chapter || !material) {
    return <div className="p-10 text-gray-500">불러오는 중…</div>;
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
        {/* TODO(다음 이슈): AI 강의 요약 탭 — Markdown 요약본 렌더 */}
        {activeTab === 'SUMMARY' && (
          <TabPlaceholder label="AI 강의 요약은 다음 이슈에서 구현합니다." />
        )}
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
