'use client';
// src/shared/ui/Sidebar/SidebarItem.tsx
import Link from 'next/link';
import { cn } from '@/shared/lib/cn';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  // 이동 경로. 없으면 button으로 렌더(더보기 등 동작 미정 항목).
  href?: string;
  active?: boolean;
  // 사이드바 펼침 여부. 접힘이면 아이콘만 가운데 정렬.
  expanded: boolean;
  onClick?: () => void;
  // 동작이 아직 정해지지 않은 항목. 눌리지 않고 흐리게 그린다.
  // href가 있는 항목에는 쓰지 않는다 — Link는 비활성화할 수 없다.
  disabled?: boolean;
}

// 사이드바 단일 메뉴 항목. 홈/학습하기/내 정보 수정/더보기에 공용으로 쓴다.
export function SidebarItem({
  icon,
  label,
  href,
  active = false,
  expanded,
  onClick,
  disabled = false,
}: SidebarItemProps) {
  // 준비 중 항목은 아이콘까지 함께 흐려야 하는데, 사이드바 아이콘은 PNG <Image>라
  // text-* 색이 먹지 않는다. 그래서 색이 아니라 항목 전체의 opacity로 낮춘다.
  // 낮춘 대비(약 4:1)는 WCAG 1.4.3의 비활성 컨트롤 예외에 해당해 문제가 되지 않는다.
  const className = cn(
    'relative flex items-center py-3 transition-colors',
    // 활성: 연두 강조 / 비활성: 라벨은 밝게 (덮어쓰기 금지 → 삼항 분기)
    disabled
      ? 'cursor-not-allowed text-gray-200 opacity-50'
      : active
        ? 'text-primary-400'
        : 'text-gray-200 hover:text-white',
  );

  const inner = (
    <>
      {/* 활성 표시용 좌측 연두 탭 (활성일 때만, 사이드바 좌측 경계에 붙음) */}
      {active && (
        <span className="bg-primary-400 absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full" />
      )}
      {/* 아이콘 칸 폭은 사이드바 접힘 폭(Sidebar의 w-22.5)과 같다. 그래서 아이콘 중심이
          펼침·접힘 모두 같은 x에 있고, 폭이 줄어드는 동안에도 제자리에 머문다.
          (justify-center로 분기하면 "가운데"가 애니메이션 중인 부모 폭을 따라 같이 움직인다)
          비활성 아이콘은 라벨보다 살짝 어둡게 — 활성이면 연두를 상속한다. */}
      <span
        className={cn(
          'flex w-22.5 shrink-0 justify-center',
          !active && 'text-gray-400',
        )}
      >
        {icon}
      </span>
      {expanded && (
        <span className="truncate pr-5 text-[15px] font-normal">{label}</span>
      )}
    </>
  );

  // 접힘 상태에선 라벨이 안 보이므로 접근성용 이름을 따로 준다.
  const a11y = expanded ? {} : { 'aria-label': label };
  // 툴팁 — 접힘이면 무슨 항목인지, 준비 중이면 왜 안 눌리는지. 둘 다면 함께 보여준다.
  // 흐린 색만으로는 "고장인지 준비 중인지"를 알 수 없다.
  const tooltip = [expanded ? null : label, disabled ? '준비 중이에요' : null]
    .filter(Boolean)
    .join(' — ');

  if (href) {
    return (
      <Link
        href={href}
        className={className}
        onClick={onClick}
        title={tooltip || undefined}
        {...a11y}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={cn('w-full', className)}
      onClick={onClick}
      disabled={disabled}
      title={tooltip || undefined}
      {...a11y}
    >
      {inner}
    </button>
  );
}
