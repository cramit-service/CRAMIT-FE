'use client';
// src/shared/ui/Sidebar/Sidebar.tsx
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Logo } from '@/shared/ui/Logo';
import { cn } from '@/shared/lib/cn';
import { SidebarItem } from './SidebarItem';
import { RecentList } from './RecentList';
import { HomeNavIcon, BookNavIcon, UserNavIcon, MoreNavIcon } from './navIcons';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

// 로그인 후 모든 화면이 공유하는 좌측 사이드바 골격.
// 접힘(아이콘만) / 펼침(아이콘+라벨) 두 상태를 토글로 전환한다.
export function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const pathname = usePathname();

  // 현재 경로가 해당 메뉴에 속하면 활성 (href '#'는 라우트 미정이라 제외)
  const isActive = (href: string) =>
    href !== '#' && (pathname === href || pathname.startsWith(`${href}/`));

  // 접힘 상태에선 목록이 안 보이므로, 최근학습 아이콘을 누르면 사이드바를 펼쳐 준다.

  return (
    <aside
      className={cn(
        // z-30은 접기 토글 때문이다. 토글은 폭의 절반이 사이드바 바깥(main 위)으로 걸쳐 있는데,
        // sticky가 만드는 쌓임 맥락 안에서는 토글의 z-20이 main 안의 요소와 겨루지 못한다.
        // main 쪽에 relative 요소가 생기면 트리 순서상 그게 위로 올라와 걸친 절반이 클릭을 못 받는다.
        'sticky top-0 z-30 flex h-screen shrink-0 flex-col bg-gray-950 text-gray-300 transition-[width] duration-200 ease-in-out',
        // 접힘 90px은 시안값 그대로다 — 홈 시안(24:9523)이 접힌 레일 기준으로 그려져 있어,
        // 이 폭이 어긋나면 콘텐츠 전체가 그만큼 밀린다.
        // SidebarItem·RecentList의 아이콘 칸 폭도 같은 값이어야 한다.
        // 어긋나면 접을 때 아이콘이 가운데를 벗어나거나 좌우로 움직인다.
        // 펼침 256px은 메뉴 라벨이 들어가야 해서 시안에 대응하는 값이 없다.
        expanded ? 'w-64' : 'w-22.5',
      )}
    >
      {/* 접기/펴기 토글 — 우측 경계에 떠 있는 둥근 사각 버튼 */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-label={expanded ? '사이드바 접기' : '사이드바 펼치기'}
        className="absolute top-16 -right-4 z-20 flex size-8 items-center justify-center rounded-lg border border-gray-800 bg-gray-900 text-gray-300 shadow-lg transition-colors hover:text-gray-100"
      >
        {expanded ? (
          <ChevronLeftIcon className="size-5" />
        ) : (
          <ChevronRightIcon className="size-5" />
        )}
      </button>

      {/* 로고 (심볼) — 접힘/펼침 모두 표시.
          메뉴 아이콘과 같은 폭 90px 칸에 담아 세로로 정렬을 맞추고, 접을 때 자리가 안 움직이게 한다. */}
      <div className="flex items-center py-6">
        <span className="flex w-22.5 shrink-0 justify-center">
          {/* 높이는 호출처가 정한다 — Logo는 기본 크기를 갖지 않는다 */}
          <Logo variant="symbol" className="h-11" />
        </span>
      </div>

      {/* 메인 메뉴 */}
      <nav className="flex flex-1 flex-col gap-1">
        <SidebarItem
          icon={<HomeNavIcon active={isActive('/home')} />}
          label="홈"
          href="/home"
          active={isActive('/home')}
          expanded={expanded}
        />
        {/* isActive는 prefix 매칭이라 강의 상세(/projects/1)에서도 활성으로 남는다 */}
        <SidebarItem
          icon={<BookNavIcon active={isActive('/projects')} />}
          label="학습 하기"
          href="/projects"
          active={isActive('/projects')}
          expanded={expanded}
        />
        <RecentList expanded={expanded} onExpand={() => setExpanded(true)} />
      </nav>

      {/* 하단 메뉴 */}
      <div className="flex flex-col gap-1 pt-2 pb-6">
        <SidebarItem
          icon={<UserNavIcon />}
          label="내 정보 수정"
          href="/settings/profile"
          active={isActive('/settings/profile')}
          expanded={expanded}
        />
        {/* TODO(기능): 더보기 — 로그아웃/설정 등 세부 동작 미정. 자리만. */}
        <SidebarItem
          icon={<MoreNavIcon />}
          label="더보기"
          expanded={expanded}
          onClick={() => {}}
        />
      </div>
    </aside>
  );
}
