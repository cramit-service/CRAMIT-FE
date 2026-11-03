'use client';
// src/features/chat/hooks/useChat.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createChatSession,
  getChatThread,
  sendChatMessage,
  type ChatThread,
} from '@/features/chat/api';
import type { ChatMessage } from '@/shared/types/api';

// 조회와 전송이 같은 캐시를 만지므로 키를 한 곳에서 만든다.
const chatKey = (chapterId: number) => ['chat', chapterId];

// 주차별 대화 조회 훅. 패널이 닫혀 있는 동안에는 부르지 않는다(enabled).
export function useChatThread(chapterId: number, enabled: boolean) {
  return useQuery({
    queryKey: chatKey(chapterId),
    // TanStack Query가 주는 signal을 fetcher까지 전달해 취소된 요청을 끊는다.
    queryFn: ({ signal }) => getChatThread(chapterId, signal),
    enabled,
    // 대화는 전송 훅이 캐시를 직접 고친다. 답을 기다리는 사이(최대 70초) 낡았다고 다시 불러오면
    // 방금 넣은 내 말풍선이 덮여 사라진다.
    staleTime: Infinity,
  });
}

// 질문 전송 훅.
// 보낸 즉시 내 말풍선을 캐시에 넣고(낙관적 반영), 답이 오면 서버가 준 두 줄로 바꾼다.
export function useSendChatMessage(chapterId: number) {
  const queryClient = useQueryClient();
  const key = chatKey(chapterId);

  // 낙관적으로 넣은 내 말풍선만 뺀다. 그사이 만든 세션 id는 남겨야 한다.
  const dropPending = (pendingId: number, add: ChatMessage[] = []) =>
    queryClient.setQueryData<ChatThread>(
      key,
      (prev) =>
        prev && {
          ...prev,
          messages: [
            ...prev.messages.filter((m) => m.messageId !== pendingId),
            ...add,
          ],
        },
    );

  return useMutation({
    mutationFn: async (content: string) => {
      let sessionId =
        queryClient.getQueryData<ChatThread>(key)?.sessionId ?? null;
      if (sessionId === null) {
        sessionId = await createChatSession(chapterId, content);
        // 질문이 실패해도 세션은 서버에 남는다. 다시 보낼 때 또 만들지 않게 바로 적어 둔다.
        queryClient.setQueryData<ChatThread>(key, (prev) => ({
          messages: prev?.messages ?? [],
          sessionId,
        }));
      }
      return sendChatMessage(sessionId, content);
    },
    onMutate: async (content) => {
      // 조회가 날아가 있는 중이면 그 응답이 뒤늦게 도착해 방금 넣은 내 말풍선을
      // 덮어쓴다(보낸 메시지가 사라진다). 낙관적 반영 전에 먼저 끊는다.
      await queryClient.cancelQueries({ queryKey: key });
      const pendingId = Date.now();
      queryClient.setQueryData<ChatThread>(key, (prev) => ({
        sessionId: prev?.sessionId ?? null,
        messages: [
          ...(prev?.messages ?? []),
          {
            messageId: pendingId,
            role: 'USER',
            content,
            createdAt: new Date().toISOString(),
          },
        ],
      }));
      return { pendingId };
    },
    onError: (_error, _content, pending) => {
      if (pending) dropPending(pending.pendingId);
      // 화면이 먼저 포기해도 서버는 질문·답을 저장했을 수 있다. 서버가 가진 대로 다시 그린다.
      queryClient.invalidateQueries({ queryKey: key });
    },
    onSuccess: (saved, _content, pending) => {
      dropPending(pending.pendingId, saved);
    },
  });
}
