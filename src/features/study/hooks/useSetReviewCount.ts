'use client';
// src/features/study/hooks/useSetReviewCount.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Chapter } from '@/shared/types/api';
import { setChapterReviewCount } from '@/features/study/api';

// 회독 수 세팅 훅.
// 이 컨트롤은 제품에서 유일하게 같은 화면에서 반복해 눌린다(DESIGN.md §4). 그래서
// 누를 때마다 서버를 기다리면 숫자가 손가락보다 늦게 따라온다 — 낙관적으로 먼저 올리고,
// 실패하면 되돌린다.
export function useSetReviewCount(projectId: number, chapterId: number) {
  const queryClient = useQueryClient();
  const key = ['chapter', projectId, chapterId];

  return useMutation<Chapter, Error, number, { previous?: Chapter }>({
    mutationFn: (reviewCount) => setChapterReviewCount(chapterId, reviewCount),
    onMutate: async (reviewCount) => {
      // 진행 중인 조회가 끝나면서 낙관적 값을 덮어쓰지 않게 먼저 멈춘다.
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Chapter>(key);
      if (previous) {
        queryClient.setQueryData<Chapter>(key, { ...previous, reviewCount });
      }
      return { previous };
    },
    onError: (_err, _count, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
      // 주차 목록도 같은 숫자를 보여준다.
      queryClient.invalidateQueries({ queryKey: ['chapters', projectId] });
    },
  });
}
