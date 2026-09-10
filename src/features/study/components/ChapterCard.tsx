'use client';
// src/features/study/components/ChapterCard.tsx
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/lib/cn';
import { formatChapterDate } from '@/features/study/lib/format';
import { useLongPress } from '@/features/study/hooks/useLongPress';
import { CalendarIcon, ChevronRightIcon, RefreshIcon } from './icons';
import type { Chapter, ChapterStatus } from '@/shared/types/api';

// 액션 버튼 라벨이 곧 상태다 — 상태 3종(학습 전/중/완료)과 1:1로 대응한다.
const actionLabel: Record<ChapterStatus, string> = {
  BEFORE: '학습하기',
  IN_PROGRESS: '이어서 학습',
  DONE: '복습하기',
};

// 액션 버튼 색(Figma): 학습 전 하늘(secondary-400/border secondary-500)
// / 학습 중 노랑(#ffde65=level-02) / 완료 회색(#e7e7e8=gray-300/border #cecfd1=gray-400)
// 채움은 시안 그대로 두고 글자만 어둡게 바꿨다 — 시안의 흰 글자는 셋 다 밝은 채움 위라
// 1.24~1.67:1이었다. 완료만 gray-700인 건 다 끝낸 항목이 진행 중보다 앞서 보이지 않게 하려는 것.
const actionStyle: Record<ChapterStatus, string> = {
  BEFORE:
    'border-[0.5px] border-secondary-500 bg-secondary-400 text-gray-950 hover:bg-secondary-500',
  IN_PROGRESS: 'bg-level-02 text-gray-950 hover:opacity-90',
  DONE: 'border-[0.5px] border-gray-400 bg-gray-300 text-gray-700 hover:bg-gray-400',
};

interface ChapterCardProps {
  chapter: Chapter;
  /** 카드를 꾹 눌렀을 때 (주차 정보 수정). 없으면 제스처를 걸지 않는다. */
  onLongPress?: (chapter: Chapter) => void;
}

export function ChapterCard({ chapter, onLongPress }: ChapterCardProps) {
  const router = useRouter();
  // 시안에 수정 버튼이 따로 없다 — 카드를 꾹 눌러서 주차 정보 수정으로 들어간다.
  const longPress = useLongPress(
    () => onLongPress?.(chapter),
    onLongPress !== undefined,
  );

  const goStudy = () => {
    // 학습 뷰어(PDF 강의 자료 / AI 요약 / 원문 스크립트 / TODO)로 이동한다.
    router.push(`/projects/${chapter.projectId}/chapters/${chapter.chapterId}`);
  };

  return (
    // Figma 시안 높이 152 / 패딩 40·24.
    // 꾹 누르는 동안 글자가 드래그 선택되면 제스처처럼 안 보여서 select-none을 둔다.
    <div
      {...longPress}
      className="flex min-h-[152px] items-center justify-between gap-[22px] rounded-md bg-white px-10 py-6 select-none"
    >
      {/* 좌측: Chapter 번호(제목) + 설명 + 날짜 */}
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-col gap-0.5">
          <p className="text-body-sm text-gray-950">
            Chapter {chapter.chapterNumber}
          </p>
          {/* 제목은 등록 때 받지 않는다 — 붙이기 전까지는 빈 줄 대신 자리를 보여준다 */}
          <p
            className={cn(
              'text-label font-medium',
              chapter.title === '' ? 'text-gray-700' : 'text-gray-800',
            )}
          >
            {chapter.title === '' ? '제목 없음' : chapter.title}
          </p>
        </div>
        <p className="text-button-sm text-gray-650 flex items-center gap-1 font-medium">
          <CalendarIcon className="size-3.5" />
          {formatChapterDate(chapter.createdAt)}
        </p>
      </div>

      {/* 우측: 액션 버튼.
          상태 텍스트("학습 전/중/완료")를 따로 두지 않는다 — 버튼 라벨이
          학습하기/이어서 학습/복습하기로 상태와 1:1이라 같은 말을 두 번 하는 자리였다. */}
      <button
        type="button"
        onClick={goStudy}
        className={cn(
          'text-label flex h-11 w-[140px] shrink-0 items-center justify-center gap-1.5 rounded-md px-3 font-medium transition-colors',
          actionStyle[chapter.status],
        )}
      >
        {actionLabel[chapter.status]}
        {chapter.status === 'DONE' ? (
          <RefreshIcon className="size-4" />
        ) : (
          <ChevronRightIcon className="size-4" />
        )}
      </button>
    </div>
  );
}
