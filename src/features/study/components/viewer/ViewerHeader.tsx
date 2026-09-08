'use client';
// src/features/study/components/viewer/ViewerHeader.tsx
import { useRouter } from 'next/navigation';
import { Tag } from '@/features/study/components/Tag';
import { ChevronLeftIcon } from '@/features/study/components/icons';
import { ViewerTabs } from '@/features/study/components/viewer/ViewerTabs';
import { EditableChapterTitle } from '@/features/study/components/viewer/EditableChapterTitle';
import {
  CollapseIcon,
  ExpandIcon,
} from '@/features/study/components/viewer/icons';
import { cn } from '@/shared/lib/cn';
import { formatChapterDay } from '@/features/study/lib/format';
import type { Chapter, ProjectDetail, ViewerTab } from '@/shared/types/api';

interface ViewerHeaderProps {
  chapter: Chapter;
  project: ProjectDetail;
  activeTabs: ViewerTab[];
  onTabToggle: (tab: ViewerTab) => void;
  // 집중 모드에서는 이전으로·제목·태그를 접고 탭줄만 남긴다
  focus: boolean;
  onToggleFocus: () => void;
}

// 학습 뷰어 공통 헤더 (모든 탭 공통).
// Figma 2단 구성: 위 = 뒤로가기 / Chapter 제목, 아래 = 탭 / 강의명·교수·날짜.
export function ViewerHeader({
  chapter,
  project,
  activeTabs,
  onTabToggle,
  focus,
  onToggleFocus,
}: ViewerHeaderProps) {
  const router = useRouter();

  // 두 모드가 같은 자리(탭줄 오른쪽 끝)에서 켜고 끈다
  const focusButton = (
    <button
      type="button"
      onClick={onToggleFocus}
      aria-pressed={focus}
      title={focus ? '집중 모드 끄기 (Esc)' : '집중 모드'}
      aria-label={focus ? '집중 모드 끄기' : '집중 모드'}
      // 탭과 같은 줄에 서므로 높이·모양·테두리 굵기를 탭(ViewerTabs)에 맞춘다.
      // py로 높이를 만들면 줄높이(22)에 얹혀 36이 되어 탭보다 4px 커진다.
      className={cn(
        'text-label focus-visible:ring-secondary-400 flex h-8 shrink-0 items-center gap-1.5 rounded-full px-4 font-medium whitespace-nowrap transition-colors',
        'border-[0.5px] border-gray-500 text-gray-600 hover:border-gray-600 hover:text-gray-700',
        'focus-visible:ring-2 focus-visible:outline-none',
      )}
    >
      {focus ? (
        <CollapseIcon className="size-4" />
      ) : (
        <ExpandIcon className="size-4" />
      )}
      {focus ? '나가기' : '집중 모드'}
    </button>
  );

  // 집중 모드 — 탭줄 한 줄만 남긴다. 제목·태그는 지금 보고 있는 걸 다시 말해 줄 뿐이라
  // 그 자리를 자료에 넘긴다.
  if (focus) {
    return (
      <header className="flex items-center justify-between gap-4">
        <ViewerTabs activeTabs={activeTabs} onToggle={onTabToggle} />
        {focusButton}
      </header>
    );
  }

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
          <span className="text-label font-medium">이전으로</span>
        </button>
        <EditableChapterTitle chapter={chapter} />
      </div>

      {/* 2단: 좌측 탭 4개 + 우측 강의명·교수 태그·날짜 태그 */}
      <div className="mt-7 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <ViewerTabs activeTabs={activeTabs} onToggle={onTabToggle} />
        <div className="flex flex-wrap items-center gap-2">
          {focusButton}
          <p className="text-label text-gray-950">{project.title}</p>
          <Tag tone="dark">{project.professor} 교수님</Tag>
          <Tag tone="outline">{formatChapterDay(chapter.createdAt)}</Tag>
        </div>
      </div>
    </header>
  );
}
