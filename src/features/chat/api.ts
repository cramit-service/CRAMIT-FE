// src/features/chat/api.ts
import type { ChatMessage } from '@/shared/types/api';
import { apiClient } from '@/shared/lib/apiClient';
import { mockChatGreeting, mockChatReply } from '@/mocks/chat';

// Mock 사용 여부 스위치 (백엔드 준비되면 false로) — study/api.ts와 동일 패턴
const USE_MOCK = true;

// 가짜 지연을 흉내내는 헬퍼. 쿼리가 취소되면 실제 fetch처럼 즉시 중단되도록
// AbortSignal을 받는다. (study/api.ts와 동일)
const delay = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });

// 프로젝트의 대화 내역 조회.
// TODO: 백엔드 엔드포인트 확정 시 경로 재확인 필요.
export async function getChatMessages(
  projectId: string,
  signal?: AbortSignal,
): Promise<ChatMessage[]> {
  if (USE_MOCK) {
    await delay(300, signal);
    // mock은 인사말만 놓인 새 대화를 가정한다. 주고받은 내용은 쿼리 캐시에만 쌓이므로
    // 새로고침하면 여기로 돌아온다.
    return [{ ...mockChatGreeting, projectId }];
  }
  return apiClient.get<ChatMessage[]>(`/projects/${projectId}/chat`, {
    signal,
  });
}

// 질문 전송 → AI 답변 한 줄을 돌려받는다. 파일 1개를 함께 보낼 수 있다.
// TODO: 백엔드가 붙으면 스트리밍 여부에 따라 반환 형태를 다시 정한다.
export async function sendChatMessage(
  projectId: string,
  content: string,
  file?: File | null,
  signal?: AbortSignal,
): Promise<ChatMessage> {
  if (USE_MOCK) {
    // 답변이 즉시 튀어나오면 "생각 중" 상태를 확인할 수 없어 조금 길게 준다.
    await delay(900, signal);
    return {
      messageId: `m-ai-${Date.now()}`,
      projectId,
      role: 'AI',
      content: mockChatReply(content, file?.name),
      createdAt: new Date().toISOString(),
    };
  }

  // 파일이 있으면 multipart로 보낸다. apiClient가 FormData를 알아보고
  // Content-Type을 비워 브라우저가 boundary를 붙이게 둔다.
  // TODO: 백엔드가 필드명을 확정하면(content/file) 여기를 맞춘다.
  const body = file ? new FormData() : { content };
  if (file && body instanceof FormData) {
    body.append('content', content);
    body.append('file', file);
  }

  return apiClient.post<ChatMessage>(`/projects/${projectId}/chat`, body, {
    signal,
  });
}
