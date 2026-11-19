// src/mocks/chat.ts — AI 챗봇 mock
import type {
  ChatBotSessionResponse,
  ChatMessageResponse,
} from '@/shared/types/api';

// 키워드가 걸리면 그에 맞는 답을, 아니면 기본 답을 준다.
const SCRIPTED: { match: RegExp; reply: string }[] = [
  {
    match: /교수|강조/,
    reply:
      '이번 강의에서 교수님이 특히 강조한 건 세 가지예요.\n\n1. 시간 복잡도는 상수와 낮은 차수 항을 버리고 지배항만 본다\n2. 이진 탐색은 정렬이라는 전제 조건이 있어야 쓸 수 있다\n3. 시간과 공간은 대개 트레이드오프 관계다\n\n특히 2번은 전제를 빠뜨리면 답 자체가 틀리므로 시험에 자주 나옵니다.',
  },
  {
    match: /핵심|개념|설명/,
    reply:
      '핵심만 추리면 이렇습니다.\n\n알고리즘의 성능은 "입력이 커질 때 얼마나 빨리 나빠지는가"로 판단합니다. 그래서 n이 작을 때의 차이는 무시하고 증가율만 봅니다.\n\n같은 문제라도 자료가 정렬돼 있는지 같은 전제가 쓸 수 있는 전략을 정합니다. 순차 탐색은 O(n), 이진 탐색은 O(log n)이지만 후자는 정렬을 요구하죠.',
  },
  {
    match: /시험|복습|정리|포인트/,
    reply:
      '시험 대비로는 이 순서를 추천해요.\n\n· 점근 표기법 세 가지(O, Ω, Θ)의 정의 구분\n· 대표 복잡도별 예시 알고리즘 한 개씩 외우기\n· 순차 탐색과 이진 탐색을 비교해 설명할 수 있게 만들기\n· 재귀가 공간을 더 쓰는 이유 말로 설명해 보기\n\n마지막 항목은 서술형으로 나오기 좋습니다.',
  },
  {
    match: /모르겠|무슨 의미|이해가/,
    reply:
      '어떤 내용인지 알려주시면 자세히 확인해 드릴게요. 내용을 여기에 복사해서 붙여넣어 주시거나, 상황을 설명해 주시면 바로 이해하기 쉽게 설명해 드리겠습니다.',
  },
];

const FALLBACK =
  '질문 주신 내용을 강의자료와 요약본에서 찾아봤어요. 조금 더 구체적으로 어느 부분이 궁금한지 알려주시면 그 대목을 짚어서 설명해 드릴게요.';

const sessions: (ChatBotSessionResponse & { weekId: number })[] = [];
const messages = new Map<number, ChatMessageResponse[]>();

// 서버처럼 최신 세션이 앞에 온다.
export function findMockChatSessions(weekId: number): ChatBotSessionResponse[] {
  return sessions
    .filter((s) => s.weekId === weekId)
    .map(({ chatBotSessionId, title }) => ({ chatBotSessionId, title }))
    .reverse();
}

export function addMockChatSession(weekId: number, title: string): number {
  const chatBotSessionId = sessions.length + 1;
  sessions.push({ chatBotSessionId, title, weekId });
  messages.set(chatBotSessionId, []);
  return chatBotSessionId;
}

export function getMockChatMessages(sessionId: number): ChatMessageResponse[] {
  return messages.get(sessionId) ?? [];
}

// 서버처럼 내 질문과 AI 답 두 줄을 저장하고 돌려준다.
export function sendMockChatMessage(
  sessionId: number,
  question: string,
): ChatMessageResponse[] {
  const createdAt = new Date().toISOString();
  const id = Date.now();
  const reply = SCRIPTED.find((s) => s.match.test(question))?.reply ?? FALLBACK;
  const pair: ChatMessageResponse[] = [
    {
      chatMessageId: id,
      senderType: 'USER',
      message: question,
      referencedPage: null,
      createdAt,
    },
    {
      chatMessageId: id + 1,
      senderType: 'AI',
      message: reply,
      referencedPage: null,
      createdAt,
    },
  ];
  messages.set(sessionId, [...getMockChatMessages(sessionId), ...pair]);
  return pair;
}
