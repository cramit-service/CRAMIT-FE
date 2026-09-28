'use client';
// src/features/study/components/LectureCard.tsx
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/lib/cn';
import { getDday } from '@/features/study/lib/format';
import { DdayBadge } from '@/features/exam/components/DdayBadge';
import type { ProjectSummary } from '@/shared/types/api';
import { Card } from '@/shared/ui/Card';
import { lectureMetaLine } from '@/features/study/lib/format';

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
          {/* 점이 과목과 색을 잇는다 — 사이드바 밖에서 색을 배우는 유일한 자리다 */}
          <span className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden
              className={cn('size-2 shrink-0 rounded-full', dotClass)}
            />
            <span className="text-body-md truncate font-semibold text-gray-800">
              {lecture.title}
            </span>
          </span>

          <span className="text-label truncate text-gray-500">
            {lectureMetaLine(lecture.professor, lecture.chapterCount)}
          </span>
        </span>

        {/* 오른쪽 끝은 꺽쇠 자리였다. 카드 전체가 눌리고 호버가 그걸 말하므로 방향을
            한 번 더 그리는 화살표는 §4가 걷어낸 뒤로가기와 같은 종류의 중복이었다.
            §4: 값이 유한한 집합에서 올 때만 뱃지다 — 교수명은 자유 텍스트, 강의 수는
            숫자라 글자가 됐고, 이 카드에서 집합인 건 시험까지 남은 날 하나뿐이다.
            여기 두면 옆에 글자가 없어서 채움이 무엇과도 크기를 겨루지 않는다.
            줄지 않는 건 min-w가 막는다(DdayBadge). */}
        {dday && <DdayBadge days={dday.days} />}
      </span>
    </Card>
  );
}
