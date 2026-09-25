'use client';
// src/features/study/components/viewer/ViewerHeader.tsx
import Link from 'next/link';
import { Tag } from '@/features/study/components/Tag';
import { ViewerTabs } from '@/features/study/components/viewer/ViewerTabs';
import { EditableChapterTitle } from '@/features/study/components/viewer/EditableChapterTitle';
import {
  CollapseIcon,
  ExpandIcon,
} from '@/features/study/components/viewer/icons';
import { Icon } from '@/shared/ui/Icon';
import { Toggle } from '@/shared/ui/Toggle';
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
  // 두 모드가 같은 자리(탭줄 오른쪽 끝)에서 켜고 끈다
  const focusButton = (
    // 탭과 같은 줄에 서므로 같은 칸을 쓴다. aria-pressed를 들고 있으니 토글이다.
    <Toggle
      pressed={focus}
      size="sm"
      onClick={onToggleFocus}
      title={focus ? '집중 모드 끄기 (Esc)' : '집중 모드'}
      aria-label={focus ? '집중 모드 끄기' : '집중 모드'}
    >
      {focus ? (
        <CollapseIcon className="size-4" />
      ) : (
        <ExpandIcon className="size-4" />
      )}
      {focus ? '나가기' : '집중 모드'}
    </Toggle>
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
      {/* 1단: 이전으로 + 제목. 제목이 왼쪽에 선다 — 다른 화면(주차 리스트)이
          나중에 이쪽에 맞춘다. */}
      <div className="relative flex flex-wrap items-center gap-x-4 gap-y-3">
        {/* 목적지가 있으면 버튼이 아니라 링크다 (§4).
            router.back()은 새 탭·직접 URL 진입 시 프로젝트 밖으로 나가버리므로
            항상 챕터 목록(프로젝트 상세)을 가리킨다. */}
        <Link
          href={`/projects/${chapter.projectId}`}
          className="text-label inline-flex shrink-0 items-center gap-1.5 font-medium text-gray-800 transition-colors hover:text-gray-500"
        >
          <Icon name="arrow-left" size={16} />
          이전으로
        </Link>
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
