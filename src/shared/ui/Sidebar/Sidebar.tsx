'use client';
// src/shared/ui/Sidebar/Sidebar.tsx
import { useEffect, useRef, useState } from 'react';
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
  // 오버레이라 펼치면 콘텐츠를 덮는다. 홈 시안이 접힌 레일(90) 기준으로 그려져 있어
  // 접힘이 기본 상태고, 펼침은 필요할 때 잠깐 여는 상태다.
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const asideRef = useRef<HTMLElement>(null);

  // 현재 경로가 해당 메뉴에 속하면 활성 (href '#'는 라우트 미정이라 제외)
  const isActive = (href: string) =>
    href !== '#' && (pathname === href || pathname.startsWith(`${href}/`));

  // 접힘 상태에선 목록이 안 보이므로, 최근학습 아이콘을 누르면 사이드바를 펼쳐 준다.

  // 펼친 채로 바깥을 누르면 접는다. 딤이 아니라 document에서 듣는 이유는, 딤(z-dim)보다
  // 위에 있는 것(챗독 z-nav·z-float)을 눌렀을 때도 접혀야 하기 때문이다.
  // 딤이 덮은 영역의 클릭은 딤이 먹으므로 콘텐츠에는 닿지 않는다.
  // Escape로도 접는다. aside에 달면 포커스가 콘텐츠로 넘어간 뒤에는 keydown이 aside를
  // 거치지 않아 안 먹으므로 document에서 듣는다.
  // 단, 모달이 열려 있으면 Escape는 모달 것이다 — Modal도 window 버블 단계에서 듣고 전파를
  // 막지 않아서, 걸러내지 않으면 Escape 한 번에 모달과 사이드바가 같이 닫힌다.
  // aria-modal은 Modal이 실제로 붙이는 표준 속성이라 내부 구현에 기대는 게 아니다.
  useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (document.querySelector('[aria-modal="true"]')) return;
      setExpanded(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const onMouseDown = (e: MouseEvent) => {
      if (asideRef.current?.contains(e.target as Node)) return;
      setExpanded(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [expanded]);

  return (
    <>
      {/* 펼침 딤. 콘텐츠만 덮고 사이드바(z-nav)·모달(z-modal)은 건드리지 않는다.
          챗독(z-nav·z-float)은 이 위라 딤이 걸리지 않는다 — 딤을 챗독 위로 올릴지는 미정.
          조건부 렌더가 아니라 opacity를 토글한다. 사이드바 폭 전환과 같은 200ms로
          페이드해야 둘이 따로 놀지 않고, 접힐 때도 사라지는 게 보인다.
          접힘일 때 pointer-events를 끄지 않으면 딤이 안 보이는 채로 화면 전체를 막는다. */}
      <div
        aria-hidden
        className={cn(
          'z-dim fixed inset-0 bg-black/40 transition-opacity duration-200',
          expanded ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />
      <aside
        ref={asideRef}
        // 사이드바 링크로 화면을 옮기면 접는다. 사이드바는 (main) 레이아웃에 있어
        // 라우트가 바뀌어도 언마운트되지 않으므로, 없으면 펼친 채로 다음 화면까지 따라온다.
        // pathname을 useEffect로 지켜보지 않고 이동을 일으킨 클릭에서 바꾼다
        // (effect 안에서 setState 하면 react-hooks 규칙에도 걸린다).
        // 링크만 골라내는 이유 — 토글·최근학습 펼치기는 이동이 아니라 사이드바 자체 조작이다.
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('a')) setExpanded(false);
        }}
        className={cn(
          // fixed로 흐름에서 빼 콘텐츠 위를 덮는다. 폭이 바뀌어도 main은 좌패딩이 고정이라
          // 따라 움직이지 않는다(app/(main)/layout.tsx).
          // z-nav는 접기 토글 때문이다. 토글은 폭의 절반이 사이드바 바깥(main 위)으로 걸쳐 있는데,
          // fixed + z-index가 만드는 쌓임 맥락 안에서는 토글의 지역 z-20이 main 안의 요소와
          // 직접 겨루지 못한다. 걸친 절반이 클릭을 받으려면 사이드바 자체가 main 위에 있어야 한다.
          'z-nav fixed top-0 left-0 flex h-screen flex-col bg-gray-950 text-gray-300 transition-[width] duration-200 ease-in-out',
          // 접힘 90px은 시안값 그대로다 — 홈 시안(24:9523)이 접힌 레일 기준으로 그려져 있다.
          // 오버레이라 콘텐츠가 이 폭을 따라 움직이지는 않지만, main의 좌패딩(pl-22.5)이
          // 이 값에 맞춰 고정돼 있으므로 한쪽을 바꾸면 다른 쪽도 같이 바꿔야 한다.
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
          메뉴 아이콘과 같은 폭 90px 칸에 담아 세로로 정렬을 맞추고, 접을 때 자리가 안 움직이게 한다.
          크기는 시안 노드(24:9634의 icon, 27×37)가 아니라 보이는 마크를 기준으로 맞췄다.
          그 노드는 투명 여백을 2~3px 물고 있어 실제 마크는 23×33이고, 우리 PNG는 여백이 더
          적어서 박스를 37로 주면 마크만 35px로 커진다. 35px일 때 마크가 시안과 같은 33px가 된다.
          위치도 같은 이유로 보이는 마크 기준이다 — 마크 위쪽 여백이 1px이라 pt를 33으로 줘야
          마크가 시안과 같은 y=34에 선다.
          홈이 시안 1:1 스케일이라(home/page.tsx) 이 레일도 0.72배 없이 px를 그대로 옮긴다. */}
        <div className="flex items-center pt-[33px] pb-6">
          <span className="flex w-22.5 shrink-0 justify-center">
            {/* 높이는 호출처가 정한다 — Logo는 기본 크기를 갖지 않는다 */}
            <Logo variant="symbol" className="h-[35px]" />
          </span>
        </div>

        {/* 메인 메뉴 */}
        {/* 짧은 화면에서는 이 칸만 스크롤해 하단 메뉴(내 정보 수정·더보기)를 항상 남긴다.
            aside가 h-screen이라 콘텐츠 합(펼침 547px)이 뷰포트보다 크면 하단이 화면 밖으로
            밀려 닿을 수 없었다 — 오버레이 전환 이전부터 있던 문제다.
            min-h-0이 없으면 세로 flex 자식의 min-height: auto가 콘텐츠 높이 아래로 줄어드는 걸
            막아 overflow-y-auto가 걸릴 일이 없다. 주축이 세로라 여기선 min-h-0이 필요하다.
            overflow-x-hidden은 세로 스크롤바가 생겼을 때 90px 아이콘 칸이 6px 넘치며
            가로 스크롤이 따라 생기는 걸 막는다(한 축이 visible이 아니면 다른 축은 auto가 된다). */}
        <nav className="scrollbar-dark flex min-h-0 flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto overscroll-contain">
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
          {/* 라벨이 "내 정보 수정"이었는데 열리는 건 알림 설정·요금제·계정 설정이 있는
              설정 페이지다. 게다가 그 페이지 안에 진짜 프로필 편집으로 가는
              "내 정보 수정" 버튼이 또 있어, 같은 이름이 두 계층에서 다른 것을 가리켰다.
              여기를 "설정"으로 바꿔 이름과 목적지를 맞춘다(페이지 안 버튼은 그대로 둔다). */}
          <SidebarItem
            icon={<UserNavIcon />}
            label="설정"
            href="/settings/profile"
            active={isActive('/settings/profile')}
            expanded={expanded}
          />
          {/* TODO(기능): 더보기 — 담을 내용이 아직 없다. 로그아웃·회원탈퇴·알림·요금제는
              모두 위의 설정 페이지에 이미 있어서, 지금 넣을 만한 것이 남아 있지 않다.
              예전에는 onClick={() => {}}이라 눌러도 아무 일이 없었다 — 고장난 것처럼 보인다.
              동작이 정해질 때까지 비활성으로 두어 "지금은 쓸 수 없다"를 드러낸다. */}
          <SidebarItem
            icon={<MoreNavIcon />}
            label="더보기"
            expanded={expanded}
            disabled
          />
        </div>
      </aside>
    </>
  );
}
