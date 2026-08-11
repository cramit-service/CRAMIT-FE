'use client';
// src/features/settings/hooks/useMyProfile.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MyProfile, NotificationSettings } from '@/shared/types/api';
import {
  getMyProfile,
  updateNickname,
  updateNotifications,
} from '@/features/settings/api';

const PROFILE_KEY = ['my-profile'];

export function useMyProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: ({ signal }) => getMyProfile(signal),
  });
}

export function useUpdateNickname() {
  const queryClient = useQueryClient();
  return useMutation<MyProfile, Error, string>({
    mutationFn: updateNickname,
    onSuccess: (profile) => {
      // 수정 화면은 저장 직후 프로필 화면으로 돌아간다. 응답을 캐시에 바로 심어
      // 다시 조회할 때까지 예전 닉네임이 한 번 스쳐 지나가지 않게 한다.
      queryClient.setQueryData(PROFILE_KEY, profile);
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
    },
  });
}

export function useUpdateNotifications() {
  const queryClient = useQueryClient();

  return useMutation<NotificationSettings, Error, NotificationSettings>({
    mutationFn: updateNotifications,
    // 토글은 누르는 즉시 움직여야 한다. 응답을 기다리면 손가락을 떼고도 한참 그대로라
    // 안 눌린 것처럼 보인다. 먼저 바꿔 놓고 실패하면 되돌린다.
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: PROFILE_KEY });
      const previous = queryClient.getQueryData<MyProfile>(PROFILE_KEY);
      if (previous) {
        queryClient.setQueryData<MyProfile>(PROFILE_KEY, {
          ...previous,
          notifications: next,
        });
      }
      return { previous };
    },
    onError: (_error, _next, context) => {
      const previous = (context as { previous?: MyProfile } | undefined)
        ?.previous;
      if (previous) queryClient.setQueryData(PROFILE_KEY, previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
    },
  });
}
