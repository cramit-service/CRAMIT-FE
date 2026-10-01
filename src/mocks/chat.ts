// src/mocks/chat.ts — AI 챗봇 mock
import type { ChatMessage } from '@/shared/types/api';

// 패널을 처음 열었을 때 이미 놓여 있는 인사말 (시안 문구 그대로).
export const mockChatGreeting: ChatMessage = {
  messageId: 'm0',
  projectId: '1',
  role: 'AI',
  content:
    '해석이 필요한 내용이나 문서를 여기에 올려주시면, 제가 바로 분석해서 아주 쉽게 풀어서 설명해 드릴게요. 무엇을 도와드릴까요?',
  createdAt: '2026-07-14T16:00:00',
};

// 입력창 위에 뜨는 추천 질문 (시안 3종).
export const mockSuggestedQuestions = [
  '교수님이 강조한 내용을 알려줘',
  '이 강의의 핵심 개념을 다시 설명해줘',
  '시험 대비 복습 포인트를 정리해줘',
] as const;

// 키워드가 걸리면 그에 맞는 답을, 아니면 기본 답을 준다.
// TODO(백엔드): 실제 AI 응답으로 교체. 지금은 화면 흐름만 확인하기 위한 고정 답변이다.
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

// 파일이 붙은 질문의 답변. mock은 파일 내용을 실제로 읽지 않으므로
// 받았다는 사실만 파일명으로 확인시켜 주고, 질문이 함께 왔으면 그 답을 이어 붙인다.
// TODO(백엔드): 실제 AI가 파일을 해석하면 이 분기는 사라진다.
export function mockChatReply(question: string, fileName?: string): string {
  const answer =
    SCRIPTED.find((s) => s.match.test(question))?.reply ?? FALLBACK;
  if (!fileName) return answer;

  const received = `'${fileName}' 파일을 받았어요. 내용을 살펴볼게요.`;
  // 파일만 보낸 경우엔 이어 붙일 답이 없다(문구가 겉돈다).
  return question.trim()
    ? `${received}\n\n${answer}`
    : `${received}\n\n어떤 점이 궁금한지 알려주시면 그 부분을 짚어서 설명해 드릴게요.`;
}
