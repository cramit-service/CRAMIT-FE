'use client';
// src/features/study/components/LectureCard.tsx
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/lib/cn';
import { getDday } from '@/features/study/lib/format';
import { DdayBadge } from '@/features/exam/components/DdayBadge';
import type { ProjectSummary } from '@/shared/types/api';
import { Card } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';

interface LectureCardProps {
  lecture: ProjectSummary;
  /** 과목 점 색 클래스. 사이드바·캘린더와 같은 배정을 목록 화면이 넘긴다. */
  dotClass: string;
}

export function LectureCard({ lecture, dotClass }: LectureCardProps) {
  const router = useRouter();
  const dday = getDday(lecture.examName, lecture.examDate);

  return (
    // 흰 배경·호버·눌림을 Card가 전부 갖고 있다. 호버는 고정 토큰이 아니라 곱셈이라
    // 어떤 판 위에 놓여도 그 판과 같은 색이 되지 않는다(§4).
    <Card
      press="navigates"
      onClick={() => router.push(`/projects/${lecture.projectId}`)}
    >
      <span className="flex items-center gap-3">
        <span className="flex min-w-0 flex-1 flex-col gap-2">
          {/* 점이 과목과 색을 잇는다 — 사이드바 밖에서 색을 배우는 유일한 자리다.
              뱃지도 이 줄에 선다. 아래 줄에 뒀을 때는 옆 글자가 뱃지와 같은 14px이라
              채움을 두른 쪽이 더 큰 것으로 읽혔다 — 제목은 16이라 그 경쟁이 없다. */}
          <span className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden
              className={cn('size-2 shrink-0 rounded-full', dotClass)}
            />
            <span className="text-body-md truncate font-semibold text-gray-800">
              {lecture.title}
            </span>
            {/* §4: 값이 유한한 집합에서 올 때만 뱃지다. 교수명은 자유 텍스트고 강의 수는
                숫자라 집합이 없다 — 알약을 둘러도 눈만 끌고 아무 말도 안 한다.
                이 카드에서 집합인 건 시험까지 남은 날 하나뿐이고, §2가 색을 정해 뒀다.
                제목이 길면 제목이 잘리고 뱃지는 남는다 — min-w가 줄어들 바닥을 막는다. */}
            {dday && <DdayBadge days={dday.days} />}
          </span>

          <span className="text-label truncate text-gray-500">
            {`${lecture.professor} 교수님 · 강의 ${lecture.chapterCount}개`}
          </span>
        </span>

        <span className="shrink-0 text-gray-700">
          <Icon name="arrow-right" size={16} />
        </span>
      </span>
    </Card>
  );
}
