'use client';
// src/features/chat/hooks/useChat.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getChatMessages, sendChatMessage } from '@/features/chat/api';
import type { ChatMessage } from '@/shared/types/api';

// 조회와 전송이 같은 캐시를 만지므로 키를 한 곳에서 만든다.
const chatKey = (projectId: string) => ['chat', projectId];

// 프로젝트별 대화 조회 훅. 패널이 닫혀 있는 동안에는 부르지 않는다(enabled).
export function useChatMessages(projectId: string, enabled: boolean) {
  return useQuery({
    queryKey: chatKey(projectId),
    // TanStack Query가 주는 signal을 fetcher까지 전달해 취소된 요청을 끊는다.
    queryFn: ({ signal }) => getChatMessages(projectId, signal),
    enabled,
  });
}

// 질문 전송 훅.
// 보낸 즉시 내 말풍선을 캐시에 넣고(낙관적 반영), 답이 오면 뒤에 이어 붙인다.
// 서버 응답을 기다렸다 한 번에 그리면 내가 뭘 보냈는지도 그동안 안 보인다.
export function useSendChatMessage(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => sendChatMessage(projectId, content),
    onMutate: (content) => {
      const key = chatKey(projectId);
      const previous = queryClient.getQueryData<ChatMessage[]>(key) ?? [];
      const mine: ChatMessage = {
        messageId: `m-user-${Date.now()}`,
        projectId,
        role: 'USER',
        content,
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueryData<ChatMessage[]>(key, [...previous, mine]);
      // 실패하면 방금 넣은 내 말풍선을 되돌린다
      return { previous };
    },
    onError: (_error, _content, context) => {
      if (context)
        queryClient.setQueryData(chatKey(projectId), context.previous);
    },
    onSuccess: (answer) => {
      queryClient.setQueryData<ChatMessage[]>(chatKey(projectId), (prev) => [
        ...(prev ?? []),
        answer,
      ]);
    },
  });
}
