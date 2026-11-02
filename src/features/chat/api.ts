// src/features/chat/api.ts
import type {
  ChatBotSessionCreateResponse,
  ChatBotSessionResponse,
  ChatMessage,
  ChatMessageResponse,
} from '@/shared/types/api';
import { ApiRequestError, apiClient } from '@/shared/lib/apiClient';
import {
  addMockChatSession,
  findMockChatSessions,
  getMockChatMessages,
  sendMockChatMessage,
} from '@/mocks/chat';

// Mock 사용 여부 스위치 — study/api.ts와 동일 패턴
const USE_MOCK = false;

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

// 서버가 세션 제목을 1~255자로 받는다.
const SESSION_TITLE_MAX = 255;

// 주차 하나의 대화. 첫 질문 전에는 세션이 없다 — 질문을 보낼 때 만든다.
export interface ChatThread {
  sessionId: number | null;
  messages: ChatMessage[];
}

const invalid = () =>
  new ApiRequestError('INVALID_RESPONSE', '대화 내용을 해석할 수 없어요.', 0);

// 요약본이 없는 주차에는 서버가 답하지 않는다. 다시 보내도 결과가 같다.
export const isNoContextError = (error: unknown) =>
  error instanceof ApiRequestError && error.code === 'NO_CONTEXT';

function toChatMessage(r: ChatMessageResponse): ChatMessage {
  if (
    typeof r?.chatMessageId !== 'number' ||
    (r.senderType !== 'USER' && r.senderType !== 'AI') ||
    typeof r.message !== 'string' ||
    typeof r.createdAt !== 'string'
  ) {
    throw invalid();
  }
  return {
    messageId: r.chatMessageId,
    role: r.senderType,
    content: r.message,
    createdAt: r.createdAt,
  };
}

function toChatMessages(list: ChatMessageResponse[]): ChatMessage[] {
  if (!Array.isArray(list)) throw invalid();
  return list.map(toChatMessage);
}

function toSessionId(r: { chatBotSessionId: number }): number {
  if (typeof r?.chatBotSessionId !== 'number') throw invalid();
  return r.chatBotSessionId;
}

// 화면에 세션 목록이 없어 가장 최근 세션 하나만 이어 쓴다.
async function getLatestSessionId(
  chapterId: number,
  signal?: AbortSignal,
): Promise<number | null> {
  let sessions: ChatBotSessionResponse[];
  if (USE_MOCK) {
    await delay(300, signal);
    sessions = findMockChatSessions(chapterId);
  } else {
    sessions = await apiClient.get<ChatBotSessionResponse[]>(
      `/weeks/${chapterId}/chat-bot-sessions`,
      { signal },
    );
  }
  if (!Array.isArray(sessions)) throw invalid();
  // 서버가 최신순으로 준다.
  return sessions.length > 0 ? toSessionId(sessions[0]) : null;
}

async function getMessages(
  sessionId: number,
  signal?: AbortSignal,
): Promise<ChatMessage[]> {
  if (USE_MOCK) {
    await delay(200, signal);
    return toChatMessages(getMockChatMessages(sessionId));
  }
  return toChatMessages(
    await apiClient.get<ChatMessageResponse[]>(
      `/chat-bot-sessions/${sessionId}/messages`,
      { signal },
    ),
  );
}

// 주차의 대화 조회.
export async function getChatThread(
  chapterId: number,
  signal?: AbortSignal,
): Promise<ChatThread> {
  const sessionId = await getLatestSessionId(chapterId, signal);
  if (sessionId === null) return { sessionId: null, messages: [] };
  return { sessionId, messages: await getMessages(sessionId, signal) };
}

// 첫 질문을 보낼 때 세션을 만든다. 제목은 그 질문이다.
export async function createChatSession(
  chapterId: number,
  firstQuestion: string,
): Promise<number> {
  const title = firstQuestion.slice(0, SESSION_TITLE_MAX);
  if (USE_MOCK) {
    await delay(200);
    return addMockChatSession(chapterId, title);
  }
  return toSessionId(
    await apiClient.post<ChatBotSessionCreateResponse>('/chat-bot-sessions', {
      weekId: chapterId,
      title,
    }),
  );
}

// 질문 전송. 서버는 저장한 내 질문과 AI 답 두 줄을 돌려준다.
export async function sendChatMessage(
  sessionId: number,
  content: string,
): Promise<ChatMessage[]> {
  if (USE_MOCK) {
    // 답변이 즉시 튀어나오면 "생각 중" 상태를 확인할 수 없어 조금 길게 준다.
    await delay(900);
    return toChatMessages(sendMockChatMessage(sessionId, content));
  }
  return toChatMessages(
    await apiClient.post<ChatMessageResponse[]>(
      `/chat-bot-sessions/${sessionId}/messages`,
      { message: content },
    ),
  );
}
