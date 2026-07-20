'use client';
// src/features/chat/components/ChatDock.tsx
import { useState } from 'react';
import { cn } from '@/shared/lib/cn';

// 프로젝트 하위 레이아웃에서만 노출되는 채팅 도크.
// 우측 화면 경계의 세로 탭을 누르면 채팅 패널이 오버레이로 열린다.
// 패널 내용(챗봇 UI)은 chat 기능(태현 2차)에서 채운다. 이번엔 빈 패널 + TODO.
export function ChatDock() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 우측 경계 세로 탭. 패널이 열리면 패널 왼쪽으로 붙는다.
          Figma: 폭 32 / 높이 107, top 264, #55585e(gray-700) 테두리·글자, 14px.
          배경은 위(하늘)→아래(연두)로 흐르는 옅은 그라데이션이라
          흰 바탕 위에 반투명 토큰 색을 얹어 만든다. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? '채팅 닫기' : '채팅 열기'}
        aria-expanded={open}
        className={cn(
          'from-secondary-200/60 to-primary-300/30 fixed top-[180px] z-40 flex h-[80px] w-7 flex-col items-center justify-center gap-1 rounded-l-md border-y border-l border-gray-700 bg-white bg-linear-to-b text-xs text-gray-700 transition-[right]',
          open ? 'right-[320px]' : 'right-0',
        )}
      >
        <span className="tracking-tight [writing-mode:vertical-rl]">
          {open ? '채팅닫기' : '채팅열기'}
        </span>
        <span aria-hidden className="text-xs leading-none">
          {open ? '›' : '‹'}
        </span>
      </button>

      {/* 채팅 패널 (오버레이). 열림/닫힘을 transform으로 전환한다. */}
      <aside
        aria-hidden={!open}
        className={cn(
          'fixed top-0 right-0 z-30 flex h-screen w-[320px] flex-col border-l border-gray-300 bg-white shadow-xl transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <header className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="font-bold text-gray-900">AI 채팅</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="채팅 닫기"
            className="text-gray-400 transition-colors hover:text-gray-700"
          >
            ✕
          </button>
        </header>

        {/* TODO(chat): 챗봇 UI(대화 목록·입력창)는 chat 기능(태현 2차)에서 구현 예정 */}
        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-gray-400">
          AI 챗봇은 채팅 기능에서 구현됩니다.
        </div>
      </aside>
    </>
  );
}
