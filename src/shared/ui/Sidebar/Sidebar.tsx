'use client';
// src/shared/ui/Sidebar/Sidebar.tsx
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/shared/ui/Logo';
import { cn } from '@/shared/lib/cn';
import { Tooltip } from '@/shared/ui/Tooltip';
import { SidebarItem } from './SidebarItem';
import { CourseNav } from './CourseNav';
import type { NavData } from './types';
import { Icon } from '@/shared/ui/Icon';

// 접은 직후 chevron을 잠깐 보여 주는 시간. "어디로 갔는지" 한 번 알려 주는 용도다.
const PEEK_MS = 1500;
const NAV_ID = 'sidebar-nav';
// 구독할 게 없는 클라이언트 전용 값을 useSyncExternalStore로 읽을 때 쓰는 빈 구독.
// 렌더마다 새 함수를 넘기면 매번 재구독하므로 모듈 밖에 둔다.
const noopSubscribe = () => () => {};

interface SidebarProps {
  // 폭 상태는 MainShell이 갖는다 — main의 좌패딩이 같은 값을 따라가야 해서다.
  expanded: boolean;
  onToggle: () => void;
  /** 강의 목록과 프로필. 가져오는 일은 features가 한다 (CLAUDE.md 3절). */
  nav: NavData;
}

// 로그인 후 모든 화면이 공유하는 좌측 사이드바 골격.
// 접힘(아이콘만) / 펼침(아이콘+라벨+과목 목록) 두 상태를 토글로 전환한다.
export function Sidebar({ expanded, onToggle, nav }: SidebarProps) {
  const pathname = usePathname();
  const { profile } = nav;
  // 접힘에서 chevron을 띄우는 조건 — 엣지/헤더 hover, 그리고 접은 직후 잠깐
  const [hovering, setHovering] = useState(false);
  const [justCollapsed, setJustCollapsed] = useState(false);
  const peekTimer = useRef<number | null>(null);
  // 서버에서는 알 수 없는 값이라 서버 스냅샷은 Ctrl로 둔다
  const isMac = useSyncExternalStore(
    noopSubscribe,
    () => /Mac|iPhone|iPad/.test(window.navigator.userAgent),
    () => false,
  );

  useEffect(
    () => () => {
      if (peekTimer.current) window.clearTimeout(peekTimer.current);
    },
    [],
  );

  // 접기는 이 경로로만 일어난다 — 새로고침 복원은 여기를 안 지나므로
  // 저장된 접힘으로 들어온 사용자에게는 chevron이 저절로 뜨지 않는다.
  const handleToggle = useCallback(() => {
    if (peekTimer.current) window.clearTimeout(peekTimer.current);
    if (expanded) {
      setJustCollapsed(true);
      peekTimer.current = window.setTimeout(
        () => setJustCollapsed(false),
        PEEK_MS,
      );
    } else {
      setJustCollapsed(false);
    }
    onToggle();
  }, [expanded, onToggle]);

  // Ctrl/⌘ + B. 글자를 치는 중에는 가로채지 않는다.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'b') return;
      const el = document.activeElement;
      if (
        el instanceof HTMLElement &&
        el.closest('input, textarea, [contenteditable]')
      ) {
        return;
      }
      e.preventDefault();
      handleToggle();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [handleToggle]);

  // 현재 경로가 해당 메뉴에 속하면 활성 (href '#'는 라우트 미정이라 제외)
  const isActive = (href: string) =>
    href !== '#' && (pathname === href || pathname.startsWith(`${href}/`));

  const profileActive = isActive('/settings/profile');
  const profileName = profile?.name ?? '내 프로필';
  const chord = isMac ? '⌘B' : 'Ctrl+B';
  const toggleLabel = expanded
    ? `사이드바 접기 (${chord})`
    : `사이드바 펼치기 (${chord})`;

  // 라벨은 접힘에서 opacity로만 지운다. 조건부 렌더로 빼면 폭이 줄어드는 200ms 동안
  // 라벨이 먼저 사라져 아이콘이 제자리에 있다는 느낌이 깨진다.
  const labelClass = cn(
    'transition-opacity duration-150 ease-out',
    expanded ? 'opacity-100' : 'pointer-events-none opacity-0',
  );

  return (
    <aside
      // fixed로 흐름에서 빼고, 밀어내는 몫은 main의 좌패딩이 맡는다.
      // 폭은 --sidebar-w 하나만 본다 — 사이드바·main 좌패딩·content-col이 같은 값을
      // 봐야 펼칠 때 셋이 따로 놀지 않는다(MainShell이 정한다).
      // 엣지 스트립과 chevron이 우측 경계 밖으로 나가야 해서 여기서는 자르지 않는다.
      // 라벨을 자르는 건 헤더·nav·하단 세 칸이 각자 맡는다.
      className="z-nav bg-frame fixed top-0 left-0 flex h-screen w-[var(--sidebar-w)] flex-col text-gray-700 transition-[width] duration-200 ease-out"
    >
      {/* 헤더 — 높이(92)는 두 상태가 같아야 한다. 접힘에서 토글을 로고 아래 한 줄로 두면
          그 줄이 아래 항목 전부를 밀어 내려 전환이 점프처럼 보인다(그래서 엣지로 뺐다).
          로고 심볼은 메뉴 아이콘과 같은 폭 90px 칸에 담아 세로 정렬을 맞추고,
          워드마크는 메뉴 라벨과 같은 열에서 시작한다.
          심볼 크기는 시안 노드(24:9634의 icon, 27×37)가 아니라 보이는 마크를 기준으로 맞췄다.
          그 노드는 투명 여백을 2~3px 물고 있어 실제 마크는 23×33이고, 우리 PNG는 여백이 더
          적어서 박스를 37로 주면 마크만 35px로 커진다. 35px일 때 마크가 시안과 같은 33px가 된다.
          위치도 같은 이유로 보이는 마크 기준이다 — 마크 위쪽 여백이 1px이라 pt를 33으로 줘야
          마크가 시안과 같은 y=34에 선다.
          pr-2는 활성 pill의 좌우 여백(inset 8)과 같은 값이다. 다만 pill은 스크롤바가 6px을
          먹는 nav 안에 있어, 헤더도 같은 자리를 비워 둬야 우측 끝이 한 줄에 선다. */}
      <div
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className="flex h-23 shrink-0 items-center overflow-hidden pt-[33px] pr-2 pb-6"
      >
        <span className="flex w-[var(--sidebar-rail)] shrink-0 justify-center">
          {/* 높이는 호출처가 정한다 — Logo는 기본 크기를 갖지 않는다 */}
          <Logo variant="symbol" className="h-[35px]" />
        </span>
        <Logo className={cn('h-[19px] shrink-0 text-gray-800', labelClass)} />
        {expanded && (
          <Tooltip label={toggleLabel}>
            <button
              type="button"
              onClick={handleToggle}
              aria-label={toggleLabel}
              aria-expanded={expanded}
              aria-controls={NAV_ID}
              className="focus-visible:ring-sky-ink ml-auto flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 focus-visible:ring-2 focus-visible:outline-none"
            >
              <Icon name="arrow-left" size={20} />
            </button>
          </Tooltip>
        )}
      </div>

      {/* 접힘 전용 — 우측 경계를 통째로 클릭 영역으로 쓴다. 상시 버튼을 두지 않는 대신이다. */}
      {!expanded && (
        <>
          <div
            aria-hidden
            tabIndex={-1}
            onClick={handleToggle}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            className="group/edge absolute inset-y-0 -right-1 w-2 cursor-pointer"
          >
            <span className="absolute inset-y-0 left-1 w-px bg-gray-300 opacity-0 transition-opacity duration-150 ease-out group-hover/edge:opacity-100" />
          </div>
          <Tooltip label={toggleLabel}>
            <button
              type="button"
              onClick={handleToggle}
              aria-label={toggleLabel}
              aria-expanded={expanded}
              aria-controls={NAV_ID}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              // 세로 중심은 로고 행 중앙(헤더 92의 절반=46). 가로는 경계에 걸친다.
              className={cn(
                'focus-visible:ring-sky-ink bg-surface shadow-near absolute top-11.5 right-0 flex size-6 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gray-100 text-gray-700 transition-opacity duration-150 ease-out hover:bg-gray-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:outline-none',
                // hover가 없는 입력(터치)에서는 hover 상태를 만들 수 없다. 그러면 8px 엣지
                // 스트립만으로 펼쳐야 해서 사실상 못 편다 — 그 환경에서는 상시로 띄운다.
                '[@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100',
                hovering || justCollapsed
                  ? 'opacity-100'
                  : 'pointer-events-none opacity-0',
              )}
            >
              <Icon name="arrow-right" size={16} />
            </button>
          </Tooltip>
        </>
      )}

      {/* 메인 메뉴 — 홈과 "내 강의" 제목은 제자리에 고정이고, 스크롤은 그 아래
          과목 목록 안에서만 일어난다. nav 전체를 스크롤러로 두면 홈까지 같이 밀린다. */}
      <nav id={NAV_ID} className="flex min-h-0 flex-1 flex-col gap-1">
        <SidebarItem
          icon={<Icon name="house" size={24} />}
          label="홈"
          href="/home"
          active={isActive('/home')}
          expanded={expanded}
        />
        <CourseNav
          expanded={expanded}
          mine={nav.mine}
          pending={nav.pending}
          error={nav.error}
        />
      </nav>

      {/* 하단 메뉴 — 과목 수와 무관하게 늘 같은 자리에 있어야 하는 것들 */}
      <div className="flex shrink-0 flex-col gap-1 overflow-hidden pt-2 pb-6">
        {/* "설정" 라벨을 프로필이 대신한다 — 목적지가 프로필 화면이라 아바타와 이름이
            어디로 가는지를 라벨보다 잘 말한다. 아바타 칸은 과목 배지와 같은 열이다. */}
        <Tooltip label={profileName} disabled={expanded}>
          <Link
            href="/settings/profile"
            aria-label={expanded ? undefined : profileName}
            className={cn(
              'focus-visible:ring-sky-ink relative flex items-center py-3 transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
              profileActive
                ? 'text-gray-800'
                : 'text-gray-700 hover:text-gray-800',
            )}
          >
            {profileActive && (
              <span className="bg-lime-action absolute inset-y-0 right-2 left-2 rounded-lg" />
            )}
            <span className="relative flex w-[var(--sidebar-rail)] shrink-0 justify-center">
              <span
                className={cn(
                  'text-label flex size-8 items-center justify-center overflow-hidden rounded-full font-medium',
                  profileActive
                    ? 'bg-surface text-gray-800'
                    : 'border border-gray-200 text-gray-500',
                )}
              >
                {profile?.imageUrl ? (
                  <Image
                    src={profile.imageUrl}
                    alt=""
                    width={32}
                    height={32}
                    className="size-full object-cover"
                  />
                ) : (
                  (profile?.name?.trim().charAt(0) ?? '')
                )}
              </span>
            </span>
            <span
              className={cn(
                'text-label relative truncate pr-5 font-normal',
                labelClass,
              )}
            >
              {profileName}
            </span>
          </Link>
        </Tooltip>
      </div>
    </aside>
  );
}
