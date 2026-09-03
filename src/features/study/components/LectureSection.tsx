'use client';
// src/features/study/components/LectureSection.tsx
import { SortSelect } from './SortSelect';
import { LectureCard, type LectureTone } from './LectureCard';
import type { SortKey } from '@/features/study/lib/lectureList';
import type { ProjectSummary } from '@/shared/types/api';

interface LectureSectionProps {
  title: string;
  description?: string;
  lectures: ProjectSummary[];
  tone: LectureTone;
  sort: SortKey;
  onSortChange: (value: SortKey) => void;
  // 검색 중이면 "결과 없음", 아니면 "아직 강의 없음"으로 빈 상태 문구가 갈린다.
  searching: boolean;
  emptyMessage: string;
  // 우측 정렬 드롭다운 옆에 붙는 액션 (내 강의의 "생성하기")
  action?: React.ReactNode;
}

// 내 강의 / 공유 강의가 같은 골격이라 하나로 쓰고 색·문구·액션만 받는다.
export function LectureSection({
  title,
  description,
  lectures,
  tone,
  sort,
  onSortChange,
  searching,
  emptyMessage,
  action,
}: LectureSectionProps) {
  return (
    <section>
      <header className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        {/* 제목과 설명은 크기가 달라(24px/12px) 베이스라인으로 맞춘다 — 시안도 같은 선에 있다 */}
        <div className="flex flex-wrap items-baseline gap-x-2.5">
          <h2 className="text-heading-sm font-semibold text-gray-950">
            {title}
          </h2>
          {description && (
            <p className="text-button-sm text-gray-600">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <SortSelect
            value={sort}
            onChange={onSortChange}
            label={`${title} 정렬`}
          />
          {action}
        </div>
      </header>

      {lectures.length === 0 ? (
        <p className="text-body rounded-md bg-white px-6 py-12 text-center text-gray-500">
          {searching ? '검색 결과가 없어요.' : emptyMessage}
        </p>
      ) : (
        // max-h는 시안대로 3행까지만 보이는 높이 — 카드 90px × 3 + 세로 gap 12 × 2 = 294.
        // pr은 그리드와 스크롤바 사이 간격(시안 17px).
        <div className="scrollbar-slim max-h-73.5 overflow-y-auto pr-4.25">
          <div className="grid grid-cols-1 gap-x-3.25 gap-y-3 md:grid-cols-2">
            {lectures.map((lecture) => (
              <LectureCard
                key={lecture.projectId}
                lecture={lecture}
                tone={tone}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
