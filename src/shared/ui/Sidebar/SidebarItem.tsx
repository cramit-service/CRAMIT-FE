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
    'relative flex items-center py-3 transition-colors',
    // 펼침: 좌측 정렬 + 라벨 간격 / 접힘: 아이콘만 가운데 (충돌 클래스 → 삼항 분기)
    expanded ? 'gap-4 px-5' : 'justify-center px-0',
    // 활성: 연두 강조 / 비활성: 라벨은 밝게 (덮어쓰기 금지 → 삼항 분기)
    active ? 'text-primary-400' : 'text-gray-200 hover:text-white',
  );

  const inner = (
    <>
      {/* 활성 표시용 좌측 연두 탭 (활성일 때만, 사이드바 좌측 경계에 붙음) */}
      {active && (
        <span className="bg-primary-400 absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full" />
      )}
      {/* 비활성 아이콘은 라벨보다 살짝 어둡게 (활성이면 연두 상속) */}
      <span className={cn('shrink-0', !active && 'text-gray-400')}>{icon}</span>
      {expanded && (
        <span className="truncate text-[15px] font-normal">{label}</span>
      )}
    </>
  );

  // 접힘 상태에선 라벨이 안 보이므로 접근성용 title/aria-label 제공
  const a11y = expanded ? {} : { title: label, 'aria-label': label };

  if (href) {
    return (
      <Link href={href} className={className} onClick={onClick} {...a11y}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={cn('w-full', className)}
      onClick={onClick}
      {...a11y}
    >
      {inner}
    </button>
  );
}
