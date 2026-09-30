'use client';
// src/shared/ui/Sidebar/SidebarItem.tsx
import Link from 'next/link';
import { cn } from '@/shared/lib/cn';
import { Tooltip } from '@/shared/ui/Tooltip';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  // 이동 경로. 없으면 button으로 렌더(더보기 등 동작 미정 항목).
  href?: string;
  active?: boolean;
  // 사이드바 펼침 여부. 접힘이면 아이콘만 가운데 정렬.
  expanded: boolean;
  onClick?: () => void;
}

// 사이드바 단일 메뉴 항목. 홈/학습하기/내 정보 수정/더보기에 공용으로 쓴다.
export function SidebarItem({
  icon,
  label,
  href,
  active = false,
  expanded,
  onClick,
}: SidebarItemProps) {
  const className = cn(
    'focus-visible:ring-sky-ink group focus-visible:ring-2 focus-visible:ring-inset focus-visible:outline-none relative flex items-center py-4.5 text-gray-800',
  );

  const inner = (
    <>
      {/* 활성 배경. 접힘·펼침이 같은 언어를 쓰도록 좌측 탭 대신 항목 자체를 칠한다.
          레일 안쪽으로 8px 들여 양끝을 살린다 — 꽉 채우면 잘린 것처럼 보인다.
          hover도 같은 자리를 쓴다. 글자가 이미 잉크의 맨 끝(gray-800)이라 색으로는
          더 진해질 데가 없어서, 커서가 왔다는 건 채움이 말한다. */}
      <span
        className={cn(
          'absolute inset-y-0 right-2 left-2 rounded-md transition-colors',
          active ? 'bg-lime-action' : 'group-hover:bg-gray-100',
        )}
      />
      {/* 아이콘 칸 폭은 접힘 레일과 같은 --sidebar-rail이다. 그래서 아이콘 중심이
          펼침·접힘 모두 같은 x에 있고, 폭이 줄어드는 동안에도 제자리에 머문다.
          (justify-center로 분기하면 "가운데"가 애니메이션 중인 부모 폭을 따라 같이 움직인다)
          아이콘과 라벨은 같은 것을 가리키므로 같은 단(gray-800)에 선다. */}
      <span
        className={cn(
          'relative flex w-[var(--sidebar-rail)] shrink-0 justify-center',
        )}
      >
        {icon}
      </span>
      {/* 접힘에서도 DOM에 남기고 opacity로만 지운다 — 조건부 렌더로 빼면 폭이 줄어드는
          200ms 동안 라벨이 먼저 사라져 아이콘이 제자리에 있다는 느낌이 깨진다. */}
      <span
        className={cn(
          'text-label relative truncate pr-5 font-normal',
          'transition-opacity duration-150 ease-out',
          expanded ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        {label}
      </span>
    </>
  );

  // 접힘 상태에선 라벨이 안 보이므로 접근성용 이름을 따로 준다.
  const a11y = expanded ? {} : { 'aria-label': label };
  // 툴팁 — 접힘이면 무슨 항목인지, 준비 중이면 왜 안 눌리는지. 둘 다면 함께 보여준다.
  if (href) {
    return (
      <Tooltip label={label} disabled={expanded}>
        <Link href={href} className={className} onClick={onClick} {...a11y}>
          {inner}
        </Link>
      </Tooltip>
    );
  }

  return (
    <Tooltip label={label} disabled={expanded}>
      <button
        type="button"
        className={cn('w-full', className)}
        onClick={onClick}
        {...a11y}
      >
        {inner}
      </button>
    </Tooltip>
  );
}
