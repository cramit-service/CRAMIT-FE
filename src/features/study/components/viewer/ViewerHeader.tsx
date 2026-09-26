'use client';
// src/features/study/components/viewer/ViewerHeader.tsx
import { ViewerTabs } from '@/features/study/components/viewer/ViewerTabs';
import { EditableChapterTitle } from '@/features/study/components/viewer/EditableChapterTitle';
import { ReviewStepper } from '@/features/study/components/viewer/ReviewStepper';
import { Toggle } from '@/shared/ui/Toggle';
import { formatChapterDay } from '@/features/study/lib/format';
import type { Chapter, ViewerTab } from '@/shared/types/api';
import { Icon } from '@/shared/ui/Icon';

interface ViewerHeaderProps {
  chapter: Chapter;
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
        <Icon name="collapse" size={16} />
      ) : (
        <Icon name="expand" size={16} />
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
      {/* 1단: 제목과 회독.
          뒤로가기를 두지 않는다. 사이드바가 늘 그 강의를 켜 두고 있어서 나가는 길이
          이미 있고, §4가 모달의 ×를 뺀 것과 같은 이유다 — 길이 있는데 출구를 하나 더
          두면 사람이 가장 늦게 찾는 구석에 두 번째 출구가 생긴다. */}
      <div className="relative flex flex-wrap items-center gap-x-4 gap-y-3">
        <EditableChapterTitle chapter={chapter} />
        {/* 회독. 제목 반대편 끝에 선다 — 제목은 무엇을 보는지고, 이건 몇 번 봤는지다. */}
        <div className="ml-auto">
          <ReviewStepper
            projectId={chapter.projectId}
            chapterId={chapter.chapterId}
            reviewCount={chapter.reviewCount}
          />
        </div>
      </div>

      {/* 날짜. 태그였는데 글자로 내린다 — §4가 Tag를 폐기했고, 유한한 집합에서 온 값이
          아니면 배지가 형식만 빌려 오고 아무 말도 하지 않는다. */}
      <p className="text-label mt-2 text-gray-500">
        {formatChapterDay(chapter.createdAt)}
      </p>

      {/* 2단: 좌측 탭 4개 + 우측 집중 모드 */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <ViewerTabs activeTabs={activeTabs} onToggle={onTabToggle} />
        {focusButton}
      </div>
    </header>
  );
}
