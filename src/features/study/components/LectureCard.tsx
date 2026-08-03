'use client';
// src/features/study/components/LectureCard.tsx
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/lib/cn';
import { Tag } from './Tag';
import { ChevronRightIcon } from './icons';
import { getDday } from '../lib/format';
import type { ProjectSummary } from '@/shared/types/api';

// 섹션에 따라 카드 바탕색이 갈린다 (Figma: 내 강의 #e7f7fa / 공유 강의 #f0f1f1).
// cn은 merge가 없으므로 hover까지 묶어 '완성된' 세트로 고른다.
export type LectureTone = 'mine' | 'shared';

const toneStyles: Record<LectureTone, string> = {
  mine: 'bg-secondary-100 hover:bg-secondary-200',
  shared: 'bg-gray-200 hover:bg-gray-300',
};

interface LectureCardProps {
  lecture: ProjectSummary;
  tone: LectureTone;
}

export function LectureCard({ lecture, tone }: LectureCardProps) {
  const router = useRouter();
  const dday = getDday(lecture.examName, lecture.examDate);

  return (
    <button
      type="button"
      onClick={() => router.push(`/projects/${lecture.projectId}`)}
      className={cn(
        'flex w-full items-center gap-3 rounded-md p-4.25 text-left transition-colors',
        toneStyles[tone],
      )}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-3">
        <span className="truncate text-[16px] leading-6 font-semibold tracking-[-0.32px] text-gray-800">
          {lecture.title}
        </span>

        {/* 태그 구성·순서는 챕터 상세 헤더(ProjectHeader)와 맞춘다 */}
        <span className="flex flex-wrap items-center gap-1.5">
          <Tag tone="dark">{lecture.professor} 교수님</Tag>
          <Tag tone="outline">강의 {lecture.chapterCount}개</Tag>
          {dday && <Tag tone={dday.tone}>{dday.label}</Tag>}
          {lecture.sharedBy && (
            <Tag tone="shared">{lecture.sharedBy} 님의 공유</Tag>
          )}
        </span>
      </span>

      <ChevronRightIcon className="size-3.5 shrink-0 text-gray-700" />
    </button>
  );
}
