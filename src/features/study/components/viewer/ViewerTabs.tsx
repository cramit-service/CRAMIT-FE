'use client';
// src/features/study/components/viewer/ViewerTabs.tsx
import { Toggle } from '@/shared/ui/Toggle';
import type { ViewerTab } from '@/shared/types/api';

// 탭 순서/라벨 (Figma: PDF 강의 자료 / AI 강의 요약 / 원문 스크립트 / TODO)
const TABS: { id: ViewerTab; label: string }[] = [
  { id: 'PDF', label: 'PDF 강의 자료' },
  { id: 'SUMMARY', label: 'AI 강의 요약' },
  { id: 'SCRIPT', label: '원문 스크립트' },
  { id: 'TODO', label: 'TODO' },
];

interface ViewerTabsProps {
  // 켜져 있는 탭. 왼쪽→오른쪽 표시 순서 그대로다. 1개면 단일 화면, 2개면 이분할.
  activeTabs: ViewerTab[];
  onToggle: (tab: ViewerTab) => void;
  // 아직 열 수 있는 탭이 없을 때(새 주차 등록 화면). 모양만 남기고 눌리지 않는다 —
  // 자료가 들어오면 이 자리가 그대로 학습 화면이 된다는 걸 미리 보여준다.
  locked?: boolean;
}

// 학습 뷰어 상단 알약 탭.
// 이분할 화면에선 탭 두 개가 동시에 켜져 있다 — 하나를 고르면 옆이 풀리는 '선택'이 아니라
// 각자 켜고 끄는 토글이라, aria-current가 아니라 aria-pressed다(§4).
// 켜짐이 연두인 것은 §2 그대로다: 누를 수 있는 것은 연두이고, 켜진 탭은 눌러서 켠 것이다.
export function ViewerTabs({
  activeTabs,
  onToggle,
  locked = false,
}: ViewerTabsProps) {
  return (
    <nav className="flex flex-wrap items-center gap-2">
      {TABS.map((tab) => {
        const active = activeTabs.includes(tab.id);
        // 켜진 게 이것 하나뿐이면 꺼도 보여줄 화면이 없어 눌러도 그대로다.
        // 이건 disabled가 아니다 — 이미 원하는 상태(켜짐)라 회색으로 만들면 오해를 부른다.
        // 켜진 모양은 그대로 두고, 눌러도 변화가 없다는 것만 aria-disabled로 알린다.
        const pinned = active && activeTabs.length === 1;
        return (
          <Toggle
            key={tab.id}
            pressed={active}
            size="sm"
            // locked는 열 수 있는 탭이 아직 하나도 없는 화면이다. 순회할 것이 없으므로
            // 여기서는 disabled가 맞다 — pinned와 달리 진짜로 못 누른다.
            disabled={locked}
            onClick={() => onToggle(tab.id)}
            aria-disabled={pinned || undefined}
          >
            {tab.label}
          </Toggle>
        );
      })}
    </nav>
  );
}
