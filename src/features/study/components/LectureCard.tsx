'use client';
// src/features/study/components/LectureCard.tsx
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/lib/cn';
import { Tag } from './Tag';
import { ChevronRightIcon } from './icons';
import { getDday } from '@/features/study/lib/format';
import type { ProjectSummary } from '@/shared/types/api';

interface LectureCardProps {
  lecture: ProjectSummary;
  /** 과목 점 색 클래스. 사이드바·캘린더와 같은 배정을 목록 화면이 넘긴다. */
  dotClass: string;
}

export function LectureCard({ lecture, dotClass }: LectureCardProps) {
  const router = useRouter();
  const dday = getDday(lecture.examName, lecture.examDate);

  return (
    <button
      type="button"
      onClick={() => router.push(`/projects/${lecture.projectId}`)}
      className="hover:bg-gray-150 flex w-full items-center gap-3 rounded-md bg-white p-4.25 text-left transition-colors"
    >
      <span className="flex min-w-0 flex-1 flex-col gap-3">
        {/* 점이 과목과 색을 잇는다 — 사이드바 밖에서 색을 배우는 유일한 자리다 */}
        <span className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden
            className={cn('size-2 shrink-0 rounded-full', dotClass)}
          />
          <span className="text-body-sm truncate font-semibold text-gray-800">
            {lecture.title}
          </span>
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
