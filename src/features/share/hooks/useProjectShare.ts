'use client';
// src/features/share/hooks/useProjectShare.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ShareMember } from '@/shared/types/api';
import {
  getProjectShare,
  inviteShareMember,
  removeShareMember,
} from '@/features/share/api';

const shareKey = (projectId: string) => ['project-share', projectId];

export function useProjectShare(projectId: string) {
  return useQuery({
    queryKey: shareKey(projectId),
    queryFn: ({ signal }) => getProjectShare(projectId, signal),
  });
}

// 초대·제거 모두 같은 목록을 바꾸므로 무효화 대상이 같다.
// 공유 강의 목록(상대방 화면)은 내 목록이 아니라 갱신 대상이 아니다.
function useInvalidateShare(projectId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: shareKey(projectId) });
  };
}

export function useInviteShareMember(projectId: string) {
  const invalidate = useInvalidateShare(projectId);
  return useMutation<ShareMember, Error, string>({
    mutationFn: (identifier) => inviteShareMember(projectId, identifier),
    onSuccess: invalidate,
  });
}

export function useRemoveShareMember(projectId: string) {
  const invalidate = useInvalidateShare(projectId);
  return useMutation<void, Error, string>({
    mutationFn: (userId) => removeShareMember(projectId, userId),
    onSuccess: invalidate,
  });
}
