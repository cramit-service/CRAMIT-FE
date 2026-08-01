'use client';
// src/features/study/components/viewer/ViewerTabs.tsx
import { cn } from '@/shared/lib/cn';
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
}

// 학습 뷰어 상단 pill 탭.
// Figma: 활성 = secondary-400 채움 + 흰 글자 / 비활성 = 0.5px gray-500 테두리 + gray-600 글자.
// 시안의 이분할 화면에선 탭 두 개가 동시에 활성이라, 하나만 고르는 게 아니라
// 켜고 끄는(toggle) 버튼이다. 그래서 aria-current가 아니라 aria-pressed를 쓴다.
// cn은 merge가 없으므로 활성/비활성 클래스 세트를 삼항으로 통째로 분기한다.
export function ViewerTabs({ activeTabs, onToggle }: ViewerTabsProps) {
  return (
    <nav className="flex flex-wrap items-center gap-2">
      {TABS.map((tab) => {
        const active = activeTabs.includes(tab.id);
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onToggle(tab.id)}
            aria-pressed={active}
            className={cn(
              'flex h-8 items-center justify-center rounded-full px-4 text-[14px] leading-[20px] font-medium tracking-[-0.28px] whitespace-nowrap transition-colors',
              active
                ? 'bg-secondary-400 text-white'
                : 'border-[0.5px] border-gray-500 text-gray-600 hover:border-gray-600 hover:text-gray-700',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
