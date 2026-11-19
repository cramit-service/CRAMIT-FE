// src/features/chat/lib/starter.ts
import type { ChatMessage } from '@/shared/types/api';

// 대화 맨 위에 늘 놓이는 인사말. 서버에 저장되지 않는다.
export const CHAT_GREETING: Pick<ChatMessage, 'role' | 'content'> = {
  role: 'AI',
  content:
    '궁금한 내용을 물어보시면, 이번 주차 강의 내용을 바탕으로 아주 쉽게 풀어서 설명해 드릴게요. 무엇을 도와드릴까요?',
};

// 첫 질문 전에 뜨는 추천 질문 (시안 3종).
export const SUGGESTED_QUESTIONS = [
  '교수님이 강조한 내용을 알려줘',
  '이 강의의 핵심 개념을 다시 설명해줘',
  '시험 대비 복습 포인트를 정리해줘',
] as const;

// 인용이 붙었을 때의 추천 질문 (프리뷰 보드 H).
export const QUOTE_QUESTIONS = [
  '이 부분 쉽게 설명해줘',
  '예시를 들어줘',
  '시험에 나올 포인트는?',
] as const;
