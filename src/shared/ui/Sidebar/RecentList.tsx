'use client';
// src/shared/ui/Sidebar/RecentList.tsx
import Link from 'next/link';
import { ChevronRightIcon } from './icons';
import { HistoryNavIcon } from './navIcons';

// TODO(API): 실제 최근 학습 내역 조회 API로 교체. 지금은 mock 3건 하드코딩.
// 링크를 눌러 실제로 화면이 열려야 하므로 mocks/study.ts에 있는 프로젝트·주차를 가리킨다.
const MOCK_RECENT = [
  {
    projectId: '1',
    chapterId: 'c4',
    title: '알고리즘 4주차',
    sub: '알고리즘 기초 알아보기 · 어제',
  },
  {
    projectId: '1',
    chapterId: 'c2',
    title: '알고리즘 2주차',
    sub: '정렬 알고리즘 · 3일 전',
  },
  {
    projectId: '1',
    chapterId: 'c1',
    title: '알고리즘 1주차',
    sub: '알고리즘과 복잡도 개요 · 지난주',
  },
];

interface RecentListProps {
  // 사이드바 펼침 여부. 접힘이면 아이콘만 보이고 하위 리스트는 숨긴다.
  expanded: boolean;
  // 접힘 상태에서 아이콘을 누르면 사이드바를 펼쳐 목록을 보여준다.
  onExpand: () => void;
}

// 최근 학습 내역 — 최근에 본 주차로 바로 이동하는 목록.
export function RecentList({ expanded, onExpand }: RecentListProps) {
  // 접힘 상태: 아이콘만 (하위 리스트 숨김)
  if (!expanded) {
    return (
      <button
        type="button"
        onClick={onExpand}
        title="최근 학습 내역"
        aria-label="최근 학습 내역"
        className="flex w-full items-center py-3 transition-colors"
      >
        {/* 아이콘 칸 폭은 SidebarItem과 같은 80px — 펼침·접힘 사이에서 아이콘이 움직이지 않는다 */}
        <span className="flex w-22.5 shrink-0 justify-center">
          <HistoryNavIcon />
        </span>
      </button>
    );
  }

  // 펼침 상태: 제목 + 목록. 목록은 항상 보인다(접을 이유가 없어 토글을 두지 않는다).
  return (
    <div>
      <div className="flex w-full items-center py-3 pr-5 text-gray-200">
        <span className="flex w-22.5 shrink-0 justify-center">
          <HistoryNavIcon />
        </span>
        {/* truncate로 줄바꿈을 막는다. 펼치는 200ms 동안 사이드바가 아직 좁아서
            라벨이 두 줄로 접혔다 펴지고, 그만큼 높이가 늘었다 줄어 아이콘이 아래위로 튄다. */}
        <span className="flex-1 truncate text-left text-[15px] font-normal">
          최근 학습 내역
        </span>
      </div>

      {/* 하위 리스트는 아이콘 칸(80px) 만큼 들여써 상위 라벨과 왼쪽을 맞춘다 */}
      <ul className="pr-4 pl-20">
        {MOCK_RECENT.map((item) => (
          <li key={`${item.projectId}-${item.chapterId}`}>
            <Link
              href={`/projects/${item.projectId}/chapters/${item.chapterId}`}
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
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
