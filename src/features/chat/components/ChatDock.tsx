'use client';
// src/features/chat/components/ChatDock.tsx
import { useState } from 'react';
import { ChatPanel } from '@/features/chat/components/ChatPanel';
import { cn } from '@/shared/lib/cn';

// 시안 패널 폭 707px(×0.72 ≈ 509). 세로 탭은 이 폭 바깥 왼쪽에 붙는다.
const PANEL_WIDTH = 509;

// 프로젝트 하위 레이아웃에서만 노출되는 채팅 도크.
// 우측 화면 경계의 세로 탭을 누르면 챗봇 패널이 오버레이로 열린다(시안: 뒤 화면을 밀지 않는다).
export function ChatDock({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 우측 경계 세로 탭. 패널이 열리면 패널 왼쪽으로 붙는다.
          Figma: 폭 32 / 높이 107, #55585e(gray-700) 테두리·글자, 14px.
          배경은 위(하늘)→아래(연두)로 흐르는 옅은 그라데이션이라
          흰 바탕 위에 반투명 토큰 색을 얹어 만든다. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? '챗봇 닫기' : '챗봇 열기'}
        aria-expanded={open}
        className="from-secondary-200/60 to-primary-300/30 fixed top-[180px] z-40 flex h-[80px] w-7 flex-col items-center justify-center gap-1 rounded-l-md border-y border-l border-gray-700 bg-white bg-linear-to-b text-xs text-gray-700 transition-[right]"
        // 패널 폭이 상수라 Tailwind가 클래스를 미리 만들 수 없다. 위치는 인라인으로 준다.
        style={{ right: open ? PANEL_WIDTH : 0 }}
      >
        <span className="tracking-tight [writing-mode:vertical-rl]">
          {open ? '챗봇닫기' : '챗봇열기'}
        </span>
        <span aria-hidden className="text-xs leading-none">
          {open ? '›' : '‹'}
        </span>
      </button>

      {/* 챗봇 패널 (오버레이). 열림/닫힘을 transform으로 전환한다.
          닫혀 있어도 화면 밖에 남아 있어 aria-hidden만으로는 내부 버튼에 탭 포커스가 들어간다.
          inert로 포커스·클릭 대상에서 함께 제외한다. */}
      <aside
        aria-hidden={!open}
        inert={!open}
        aria-label="AI 챗봇"
        style={{ width: PANEL_WIDTH }}
        className={cn(
          'fixed top-0 right-0 z-30 flex h-screen flex-col border-l border-gray-700 bg-white shadow-xl transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* 시안 배경 — 흰 바탕 위로 옅은 연두가 아래에서 번진다.
            장식이라 포인터 이벤트를 받지 않게 두고, 내용은 그 위에 얹는다. */}
        <span
          aria-hidden
          className="from-primary-200/25 pointer-events-none absolute inset-0 bg-linear-to-t to-transparent to-60%"
        />
        <div className="relative flex min-h-0 flex-1 flex-col">
          <ChatPanel projectId={projectId} open={open} />
        </div>
      </aside>
    </>
  );
}
