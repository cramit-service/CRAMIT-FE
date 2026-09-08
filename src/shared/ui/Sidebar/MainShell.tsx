'use client';
// src/shared/ui/Sidebar/MainShell.tsx
import { useCallback, useSyncExternalStore } from 'react';
import { Sidebar } from './Sidebar';
import {
  getSidebarExpanded,
  getSidebarExpandedOnServer,
  getSidebarHidden,
  getSidebarHiddenOnServer,
  setSidebarExpanded,
  subscribeSidebar,
  subscribeSidebarHidden,
} from './sidebarState';

// 사이드바 + 콘텐츠 골격. 폭 상태가 여기 있는 이유는 사이드바가 콘텐츠를 밀어내기
// 때문이다 — 사이드바 폭과 main의 좌패딩이 같은 값을 봐야 한다.
// --sidebar-w 하나로 내려보내 사이드바 폭·좌패딩·content-col이 모두 그것만 보게 한다.
//
// 펼침이 기본이다. 과목 목록이 주 동선이라 늘 보여야 한다 — 시안이 접힌 레일(90) 기준으로
// 그려진 건 그대로여서, 접으면 콘텐츠 열·여백이 시안과 정확히 같아진다.
export function MainShell({ children }: { children: React.ReactNode }) {
  const expanded = useSyncExternalStore(
    subscribeSidebar,
    getSidebarExpanded,
    getSidebarExpandedOnServer,
  );

  // 학습 뷰어의 집중 모드가 켜지면 사이드바를 통째로 비운다.
  const hidden = useSyncExternalStore(
    subscribeSidebarHidden,
    getSidebarHidden,
    getSidebarHiddenOnServer,
  );

  const toggle = useCallback(() => {
    setSidebarExpanded(!getSidebarExpanded());
  }, []);

  const railWidth = hidden ? '0px' : expanded ? '256px' : '90px';

  return (
    <div
      className="bg-primary-100 group/shell min-h-screen"
      // 콘텐츠 열 바깥에 거는 요소(outdent-left)가 여백이 남는지 알아야 한다
      data-sidebar={hidden ? 'hidden' : expanded ? 'wide' : 'rail'}
      style={{ '--sidebar-w': railWidth } as React.CSSProperties}
    >
      {!hidden && <Sidebar expanded={expanded} onToggle={toggle} />}
      {/* 사이드바 폭 전환과 같은 200ms로 밀려야 둘이 따로 놀지 않는다 */}
      <main className="pl-[var(--sidebar-w)] transition-[padding] duration-200 ease-out">
        {children}
      </main>
    </div>
  );
}
