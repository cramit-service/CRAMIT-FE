'use client';
// src/features/study/components/ChapterCard.tsx
// DESIGN.md §4 "A chapter row has one slot, and no button".
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/lib/cn';
import { formatChapterDate } from '@/features/study/lib/format';
import type { Chapter } from '@/shared/types/api';
import { Card } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';

// 학습은 세는 것이고 단계를 밟는 게 아니다. 0은 낱말, 나머지는 수 —
// 제품이 D-day에서 이미 그렇게 센다(D-1 다음이 D-DAY이고 D-0이 아니다).
// 두 라벨이 같은 세 글자라서 D-day처럼 폭을 고정할 필요가 없다.
function reviewLabel(count: number): string {
  return count <= 0 ? '학습 전' : `${count}회독`;
}

export function ChapterCard({ chapter }: { chapter: Chapter }) {
  const router = useRouter();

  return (
    // 행 자체가 타깃이다. 여기 있던 버튼 셋(학습하기·이어서 학습·복습하기)은 각각
    // 하늘·노랑·회색 채움이었는데 §2가 연두를 누를 수 있는 것에, 주황을 줄어드는 것에
    // 주고 §4가 회색 채움을 비활성에 묶어 놔서 셋 다 이미 정해진 것과 부딪혔다.
    // 노랑은 §2가 아예 없앤 색이었다(level-02, "Nothing replaces them").
    // 버튼을 걷으면 세 충돌이 한 번에 사라지고, Card가 이미 누름 규칙을 갖고 있어
    // 행이 타깃이 되는 대가가 없다.
    <Card
      press="navigates"
      onClick={() =>
        router.push(
          `/projects/${chapter.projectId}/chapters/${chapter.chapterId}`,
        )
      }
    >
      <span className="flex items-center gap-3">
        <span className="flex min-w-0 flex-1 flex-col gap-2">
          {/* 주차를 부르는 이름은 제목이다. Chapter 번호는 정렬에만 쓰고 적지 않는다.
              제목은 등록 때 받지 않아서 빈 값이 올 수 있다 — 그때는 필드의
              placeholder와 같은 gray-500으로 "아직 안 붙었다"를 말한다. */}
          <span
            className={cn(
              'text-body-md truncate font-semibold',
              chapter.title === '' ? 'text-gray-500' : 'text-gray-800',
            )}
          >
            {chapter.title === '' ? '제목 없음' : chapter.title}
          </span>

          <span className="text-label flex items-center gap-1 text-gray-500">
            <Icon name="calendar" size={16} />
            {formatChapterDate(chapter.createdAt)}
          </span>
        </span>

        {/* 버튼이 있던 자리에 한 마디. 처리 중·실패도 여기 서는데(§4) 지금은 못 만든다 —
            ProcessStatus가 READY|PROCESSING뿐이고 그 값이 Chapter에 실려 오지 않는다. */}
        <span className="text-label shrink-0 font-medium text-gray-700">
          {reviewLabel(chapter.reviewCount)}
        </span>
      </span>
    </Card>
  );
}
