'use client';
// src/features/study/components/LectureSection.tsx
import { LectureCard } from './LectureCard';
import { subjectDotClass } from '@/shared/lib/subjectColor';
import type { ProjectSummary } from '@/shared/types/api';

interface LectureSectionProps {
  lectures: ProjectSummary[];
  subjectDots: Map<string, number>;
  // 검색 중이면 "결과 없음", 아니면 "아직 강의 없음"으로 빈 상태 문구가 갈린다.
  searching: boolean;
  emptyMessage: string;
}

// 목록 한 묶음. 제목·정렬·액션은 화면이 자기 머리줄에서 들고 있다 —
// 섹션이 하나뿐이라 그건 섹션의 머리가 아니라 화면의 머리였다.
export function LectureSection({
  lectures,
  subjectDots,
  searching,
  emptyMessage,
}: LectureSectionProps) {
  if (lectures.length === 0) {
    return (
      <p className="text-body bg-surface rounded-md px-6 py-12 text-center text-gray-500">
        {searching ? '검색 결과가 없어요.' : emptyMessage}
      </p>
    );
  }

  // 높이를 안 잡는다. 여기 있던 max-h는 카드 90 × 3행 + gap 12 × 2 = 294였는데,
  // §5가 "영역은 줄 수를 고르면 안 된다"로 막는다 — 높은 창에서도 3행, 낮은 창에서도
  // 3행이라 어느 뷰포트에서도 defend할 수 없는 숫자였다(사이드바의 일곱 강의와 같은 건이다).
  // 레일의 목록과 달리 여긴 위아래로 낀 것이 없어 자기 스크롤이 필요 없다.
  // 창보다 길어지면 §5대로 페이지가 스크롤한다.
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {lectures.map((lecture) => (
        <LectureCard
          key={lecture.projectId}
          lecture={lecture}
          dotClass={subjectDotClass(subjectDots, lecture.projectId)}
        />
      ))}
    </div>
  );
}
