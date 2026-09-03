'use client';
// src/features/study/components/ChapterCard.tsx
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/lib/cn';
import { formatChapterDate } from '@/features/study/lib/format';
import { useLongPress } from '@/features/study/hooks/useLongPress';
import { CalendarIcon, ChevronRightIcon, RefreshIcon } from './icons';
import type { Chapter, ChapterStatus } from '@/shared/types/api';

// 상태 3종(학습 전/중/완료)의 라벨.
const statusLabel: Record<ChapterStatus, string> = {
  BEFORE: '학습 전',
  IN_PROGRESS: '학습 중',
  DONE: '완료',
};

// 상태 텍스트 색(Figma): 학습 전 #4dd8ff(secondary-400) / 학습 중 #ffde65(level-02) / 완료 #aeb1b6(gray-500)
// cn은 merge가 없으므로 상태별로 서로 겹치지 않는 '완성된' 클래스 세트를 통째로 고른다.
const statusTextStyle: Record<ChapterStatus, string> = {
  BEFORE: 'text-secondary-400',
  IN_PROGRESS: 'text-level-02',
  DONE: 'text-gray-500',
};

const actionLabel: Record<ChapterStatus, string> = {
  BEFORE: '학습하기',
  IN_PROGRESS: '이어서 학습',
  DONE: '복습하기',
};

// 액션 버튼 색(Figma): 학습 전 하늘(secondary-400/border secondary-500)
// / 학습 중 노랑(#ffde65=level-02) / 완료 회색(#e7e7e8=gray-300/border #cecfd1=gray-400)
const actionStyle: Record<ChapterStatus, string> = {
  BEFORE:
    'border-[0.5px] border-secondary-500 bg-secondary-400 text-white hover:bg-secondary-500',
  IN_PROGRESS: 'bg-level-02 text-white hover:opacity-90',
  DONE: 'border-[0.5px] border-gray-400 bg-gray-300 text-white hover:bg-gray-400',
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
    // Figma 시안(높이 152/패딩 40·24)을 전체 화면과 같은 0.72배로 줄인 값.
    // 꾹 누르는 동안 글자가 드래그 선택되면 제스처처럼 안 보여서 select-none을 둔다.
    <div
      {...longPress}
      className="flex min-h-[108px] items-center justify-between gap-4 rounded-md bg-white px-6 py-4 select-none"
    >
      {/* 좌측: Chapter 번호(제목) + 설명 + 날짜 */}
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-col gap-0.5">
          <p className="text-body-sm text-gray-950">
            Chapter {chapter.chapterNumber}
          </p>
          <p className="text-label font-medium text-gray-700">
            {chapter.title}
          </p>
        </div>
        <p className="flex items-center gap-1 text-[12px] leading-[18px] font-medium tracking-[-0.24px] text-gray-500">
          <CalendarIcon className="size-3.5" />
          {formatChapterDate(chapter.createdAt)}
        </p>
      </div>

      {/* 우측: 상태 텍스트 + 액션 버튼 (폭 고정 영역에서 좌우로 벌림) */}
      <div className="flex w-[260px] shrink-0 items-center justify-between gap-4">
        <span
          className={cn(
            'text-body-sm font-medium',
            statusTextStyle[chapter.status],
          )}
        >
          {statusLabel[chapter.status]}
        </span>
        <button
          type="button"
          onClick={goStudy}
          className={cn(
            'flex h-11 w-[140px] items-center justify-center gap-1.5 rounded-md px-3 text-[14px] leading-[20px] font-medium tracking-[-0.28px] transition-colors',
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
    </div>
  );
}
