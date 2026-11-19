// src/shared/lib/quote.ts

// 인용은 질문의 맥락이지 본문이 아니다. 길게 고르면 앞부분만 싣는다.
const QUOTE_MAX = 500;

// 고른 글을 한 줄로 펴고 길이를 자른다. 글자(코드 포인트) 단위로 잘라 이모지가 반쪽 나지 않게 한다.
export function toQuote(selected: string): string {
  const chars = Array.from(selected.replace(/\s+/g, ' ').trim());
  return chars.length > QUOTE_MAX
    ? `${chars.slice(0, QUOTE_MAX).join('')}…`
    : chars.join('');
}

// 서버는 글(message) 하나만 받는다. 인용을 질문 앞에 붙여 함께 보낸다.
export function withQuote(quote: string, question: string): string {
  return `> ${quote}\n\n${question}`;
}

// 저장된 질문을 다시 인용과 질문으로 나눈다. withQuote가 만든 모양만 알아본다.
export function splitQuote(message: string): {
  quote: string | null;
  question: string;
} {
  const match = /^> (.+)\n\n([\s\S]+)$/.exec(message);
  return match
    ? { quote: match[1], question: match[2] }
    : { quote: null, question: message };
}
