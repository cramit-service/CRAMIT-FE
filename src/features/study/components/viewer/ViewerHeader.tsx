'use client';
// src/features/study/components/viewer/ViewerHeader.tsx
import { useRouter } from 'next/navigation';
import { Tag } from '@/features/study/components/Tag';
import { ChevronLeftIcon } from '@/features/study/components/icons';
import { ViewerTabs } from '@/features/study/components/viewer/ViewerTabs';
import { formatChapterDay } from '@/features/study/lib/format';
import type { Chapter, ProjectDetail, ViewerTab } from '@/shared/types/api';

interface ViewerHeaderProps {
  chapter: Chapter;
  project: ProjectDetail;
  activeTabs: ViewerTab[];
  onTabToggle: (tab: ViewerTab) => void;
}

// 학습 뷰어 공통 헤더 (모든 탭 공통).
// Figma 2단 구성: 위 = 뒤로가기 / Chapter 제목, 아래 = 탭 / 강의명·교수·날짜.
export function ViewerHeader({
  chapter,
  project,
  activeTabs,
  onTabToggle,
}: ViewerHeaderProps) {
  const router = useRouter();

  return (
    <header>
      {/* 1단: 이전으로(챕터 상세로) + 우측 Chapter 제목 */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          // router.back()은 새 탭·직접 URL 진입 시 프로젝트 밖으로 나가버린다.
          // 항상 챕터 목록(프로젝트 상세)으로 되돌아가도록 경로를 고정한다.
          onClick={() => router.push(`/projects/${chapter.projectId}`)}
          className="inline-flex shrink-0 items-center gap-1.5 text-gray-950 transition-colors hover:text-gray-700"
        >
          <ChevronLeftIcon className="size-5" />
          <span className="text-label font-medium">
            이전으로
          </span>
        </button>
        <h1 className="min-w-0 truncate text-right text-[24px] leading-[34px] font-semibold tracking-[-0.48px] text-gray-950">
          Chapter {chapter.chapterNumber} - {chapter.title}
        </h1>
      </div>

      {/* 2단: 좌측 탭 4개 + 우측 강의명·교수 태그·날짜 태그 */}
      <div className="mt-7 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <ViewerTabs activeTabs={activeTabs} onToggle={onTabToggle} />
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-label text-gray-950">
            {project.title}
          </p>
          <Tag tone="dark">{project.professor} 교수님</Tag>
          <Tag tone="outline">{formatChapterDay(chapter.createdAt)}</Tag>
        </div>
      </div>
    </header>
  );
}
