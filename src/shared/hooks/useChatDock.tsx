'use client';
// src/shared/hooks/useChatDock.tsx
import { createContext, useContext, useState } from 'react';
import { toQuote } from '@/shared/lib/quote';

// 학습 뷰어(드래그한 글)와 챗독이 함께 쓰는 상태. 두 기능이 같이 써서 shared에 둔다.
interface ChatDockState {
  open: boolean;
  setOpen: (open: boolean) => void;
  quote: string | null;
  setQuote: (quote: string | null) => void;
}

const ChatDockContext = createContext<ChatDockState | null>(null);

export function ChatDockProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [quote, setQuote] = useState<string | null>(null);

  return (
    <ChatDockContext value={{ open, setOpen, quote, setQuote }}>
      {children}
    </ChatDockContext>
  );
}

export function useChatDock() {
  const state = useContext(ChatDockContext);
  if (!state) throw new Error('ChatDockProvider 안에서만 쓸 수 있어요.');
  return state;
}

// 고른 글을 인용으로 붙이고 챗독을 연다. 챗독이 없는 화면(프로바이더 밖)이면 null이다.
export function useAskAI() {
  const state = useContext(ChatDockContext);
  if (!state) return null;
  return (selected: string) => {
    state.setQuote(toQuote(selected));
    state.setOpen(true);
  };
}
