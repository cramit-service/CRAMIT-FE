'use client';
// src/shared/ui/Sidebar/sidebarState.ts
// 사이드바 펼침 여부를 localStorage에 담아 두고 구독 가능한 값으로 감싼다.
// useState + useEffect로 복원하면 이펙트 안에서 setState를 하게 되어
// react-hooks/set-state-in-effect에 걸리고, 서버가 그린 값과 어긋나는 것도 직접 다뤄야 한다.
const STORAGE_KEY = 'cramit:sidebar-expanded';

const listeners = new Set<() => void>();
// 저장소가 막힌 환경(사생활 보호 모드 등)에서 이번 세션 동안만 쓰는 값
let fallback = true;

export function subscribeSidebar(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSidebarExpanded() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved !== null) return saved !== '0';
  } catch {
    // 아래 fallback으로 떨어진다
  }
  return fallback;
}

// 서버에는 저장소가 없다. 펼침이 기본이라 그대로 그린다.
export function getSidebarExpandedOnServer() {
  return true;
}

export function setSidebarExpanded(next: boolean) {
  fallback = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
  } catch {
    // 저장에 실패해도 fallback으로 이번 세션 동안은 동작한다
  }
  listeners.forEach((listener) => listener());
}

// 사이드바를 통째로 감추는 상태(학습 뷰어의 집중 모드).
// 접힘/펼침과는 다른 축이다 — 집중 모드를 끄면 원래 폭으로 돌아와야 하므로
// 저장하지 않고, 화면을 떠날 때 호출한 쪽이 되돌린다.
const hiddenListeners = new Set<() => void>();
let hidden = false;

export function subscribeSidebarHidden(listener: () => void) {
  hiddenListeners.add(listener);
  return () => {
    hiddenListeners.delete(listener);
  };
}

export function getSidebarHidden() {
  return hidden;
}

// 서버에는 집중 모드가 없다 — 늘 보이는 상태로 그린다.
export function getSidebarHiddenOnServer() {
  return false;
}

export function setSidebarHidden(next: boolean) {
  if (hidden === next) return;
  hidden = next;
  hiddenListeners.forEach((listener) => listener());
}
