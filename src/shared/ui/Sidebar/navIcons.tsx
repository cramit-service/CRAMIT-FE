// src/shared/ui/Sidebar/navIcons.tsx
// 사이드바 메뉴 아이콘 — 실제 에셋(public/sidebar-icons/*)을 그대로 사용한다.
// 디자이너가 active(연두)/inactive(회색) 두 버전을 제공하므로 상태별로 이미지를 교체한다.
// (학사모=홈, 책=학습하기, 시계=최근학습. 그 외 user/더보기/chevron은 icons.tsx의 SVG 사용)
import Image from 'next/image';
import { cn } from '@/shared/lib/cn';

interface NavIconProps {
  active?: boolean;
  className?: string;
}

// 60x60 정사각 캔버스 에셋 → size-6 박스에 맞춰 렌더 (왜곡 없음)
function NavIcon({
  base,
  active = false,
  className,
}: NavIconProps & { base: string }) {
  return (
    <Image
      src={`/sidebar-icons/${base}-${active ? 'on' : 'off'}.png`}
      alt=""
      width={60}
      height={60}
      className={cn('size-6 object-contain', className)}
    />
  );
}

export function HomeNavIcon({ active, className }: NavIconProps) {
  return <NavIcon base="home" active={active} className={className} />;
}

export function BookNavIcon({ active, className }: NavIconProps) {
  return <NavIcon base="book" active={active} className={className} />;
}

export function HistoryNavIcon({ active, className }: NavIconProps) {
  return <NavIcon base="history" active={active} className={className} />;
}

// active/inactive 구분 없이 단색(회색)으로 제공된 아이콘 (user, 더보기 등)
function StaticNavIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <Image
      src={`/sidebar-icons/${name}.png`}
      alt=""
      width={60}
      height={60}
      className={cn('size-6 object-contain', className)}
    />
  );
}

export function UserNavIcon({ className }: { className?: string }) {
  return <StaticNavIcon name="user" className={className} />;
}

export function MoreNavIcon({ className }: { className?: string }) {
  return <StaticNavIcon name="more" className={className} />;
}
