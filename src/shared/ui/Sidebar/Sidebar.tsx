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
  const [recentOpen, setRecentOpen] = useState(true);
  const pathname = usePathname();

  // 현재 경로가 해당 메뉴에 속하면 활성 (href '#'는 라우트 미정이라 제외)
  const isActive = (href: string) =>
    href !== '#' && (pathname === href || pathname.startsWith(`${href}/`));

  // 접힘 상태에서 최근학습 아이콘을 누르면 사이드바를 펼치면서 리스트도 연다.
  const handleRecentToggle = () => {
    if (!expanded) {
      setExpanded(true);
      setRecentOpen(true);
      return;
    }
    setRecentOpen((v) => !v);
  };

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen shrink-0 flex-col bg-gray-950 text-gray-300 transition-[width] duration-200 ease-in-out',
        expanded ? 'w-64' : 'w-20',
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

      {/* 로고 (심볼) — 접힘/펼침 모두 표시 */}
      <div
        className={cn(
          'flex items-center py-6',
          expanded ? 'px-5' : 'justify-center px-0',
        )}
      >
        <Logo variant="symbol" />
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
        {/* TODO(라우팅): 학습 하기 라우트 확정되면 href·active 교체 */}
        <SidebarItem
          icon={<BookNavIcon active={false} />}
          label="학습 하기"
          href="#"
          expanded={expanded}
        />
        <RecentList
          expanded={expanded}
          open={recentOpen}
          onToggle={handleRecentToggle}
        />
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
