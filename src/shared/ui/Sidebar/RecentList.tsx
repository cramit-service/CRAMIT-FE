'use client';
// src/shared/ui/Sidebar/RecentList.tsx
import { ChevronUpIcon, ChevronDownIcon, ChevronRightIcon } from './icons';
import { HistoryNavIcon } from './navIcons';

// TODO(API): 실제 최근 학습 내역 조회 API로 교체. 지금은 mock 3건 하드코딩.
const MOCK_RECENT = [
  { id: '1', title: '선형대수 9주차', sub: '동적 계획법 · 어제' },
  { id: '2', title: '알고리즘 5주차', sub: '동적 계획법 · 어제' },
  { id: '3', title: '운영체제론 11주차', sub: 'CPU · 3일 전' },
];

interface RecentListProps {
  // 사이드바 펼침 여부. 접힘이면 아이콘만 보이고 하위 리스트는 숨긴다.
  expanded: boolean;
  // 하위 리스트 열림 여부
  open: boolean;
  onToggle: () => void;
}

// 최근 학습 내역 — 헤더 클릭으로 하위 리스트를 접고 펴는 확장형 항목.
export function RecentList({ expanded, open, onToggle }: RecentListProps) {
  // 접힘 상태: 아이콘만 (하위 리스트 숨김)
  if (!expanded) {
    return (
      <button
        type="button"
        onClick={onToggle}
        title="최근 학습 내역"
        aria-label="최근 학습 내역"
        className="flex w-full items-center justify-center py-3 transition-colors"
      >
        <HistoryNavIcon />
      </button>
    );
  }

  // 펼침 상태: 헤더 + (open이면) 하위 리스트
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-5 py-3 text-gray-200 transition-colors hover:text-white"
      >
        <HistoryNavIcon className="shrink-0" />
        <span className="flex-1 text-left text-[15px] font-normal">
          최근 학습 내역
        </span>
        {open ? (
          <ChevronUpIcon className="size-4 shrink-0 text-gray-400" />
        ) : (
          <ChevronDownIcon className="size-4 shrink-0 text-gray-400" />
        )}
      </button>

      {open && (
        <ul className="pr-4 pl-[3.75rem]">
          {MOCK_RECENT.map((item) => (
            <li key={item.id}>
              {/* TODO(라우팅): 클릭 시 해당 학습 화면으로 이동 */}
              <button
                type="button"
                onClick={() => {}}
                className="flex w-full items-center gap-2 border-t border-gray-800/70 py-2.5 text-left transition-colors hover:bg-gray-900/50"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-gray-100">
                    {item.title}
                  </span>
                  <span className="block truncate text-xs text-gray-500">
                    {item.sub}
                  </span>
                </span>
                <ChevronRightIcon className="size-4 shrink-0 text-gray-500" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
