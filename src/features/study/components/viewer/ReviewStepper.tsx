'use client';
// src/features/study/components/viewer/ReviewStepper.tsx
// DESIGN.md §4 "A 회독 is raised by a stepper, and lowered by the same one".
import { useSetReviewCount } from '@/features/study/hooks/useSetReviewCount';
import { IconButton } from '@/shared/ui/IconButton';

// 되돌릴 수 있다는 것이 이 컨트롤의 요점이다. 올라가기만 하는 수는 고칠 수 없는 기록이고,
// 한 번 잘못 누른 것이 학기 내내 남는다. 오른쪽이 +1, 왼쪽이 −1 — 배울 것도 발견할 것도 없다.
//
// 확정 버튼의 크기를 쓰지 않는 이유는 4절에 있다. 이건 제품에서 유일하게 같은 화면에서
// 반복해 눌리는 컨트롤이고, "표시는 그것이 기록하는 것만큼만 크고 그보다 크지 않다".
export function ReviewStepper({
  projectId,
  chapterId,
  reviewCount,
}: {
  projectId: number;
  chapterId: number;
  reviewCount: number;
}) {
  const setCount = useSetReviewCount(projectId, chapterId);
  const busy = setCount.isPending;

  return (
    <div className="flex shrink-0 items-center gap-1">
      {/* 올리는 것이 주 동작이고 내리는 것은 정정이라, Button의 순위 구분을 그대로 쓴다.
          누르는 자리·크기·횟수는 같으니 §4가 말한 "돌아가는 길이 대칭"은 그대로다. */}
      <IconButton
        name="minus"
        glyph={16}
        rank="secondary"
        aria-label="회독 수 줄이기"
        // 0 아래로는 내려가지 않는다. 눌러도 안 되는 것은 눌러 보기 전에 알려준다.
        disabled={busy || reviewCount <= 0}
        onClick={() => setCount.mutate(reviewCount - 1)}
      />
      {/* 숫자가 바뀌어도 양옆 버튼이 흔들리지 않게 폭을 잡는다.
          tabular-nums가 없으면 1과 3의 폭이 달라 누를 때마다 미세하게 밀린다. */}
      <span
        aria-live="polite"
        className="text-label w-14 text-center font-medium text-gray-700 tabular-nums"
      >
        {reviewCount}회독
      </span>
      <IconButton
        name="plus"
        glyph={16}
        rank="primary"
        aria-label="회독 수 늘리기"
        disabled={busy}
        onClick={() => setCount.mutate(reviewCount + 1)}
      />
    </div>
  );
}
