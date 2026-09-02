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

// on/off 쌍이 없는 아이콘(user, 더보기). 디자이너가 한 장만 줬다.
//
// 그냥 <Image>로 깔면 활성일 때 라벨만 연두로 바뀌고 아이콘은 회색으로 남는다 —
// 홈·학습하기는 -on 에셋으로 갈아끼워 연두가 되므로 같은 사이드바 안에서 규칙이 갈렸다.
//
// 에셋을 새로 그리는 대신 준 PNG를 그대로 마스크로 쓴다. 이 파일들은 투명 배경에
// 단색(#cecfd1 = gray-400) 글리프뿐이라, 모양만 마스크로 떼어 내고 색은
// background-color: currentColor로 채우면 글자와 똑같이 색을 상속한다.
// 덕분에 SidebarItem의 아이콘 칸에 이미 있던 text-gray-400 / text-primary-400이
// 비로소 아이콘에도 먹는다(PNG일 때는 붙어만 있고 아무 효과가 없었다).
//
// mask-image는 Safari가 오래 -webkit- 접두사를 요구했으므로 둘 다 준다.
// URL이 name에 따라 달라져 Tailwind 임의값 대신 style로 넣는다.
function StaticNavIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const mask = `url(/sidebar-icons/${name}.png)`;
  return (
    <span
      aria-hidden
      className={cn('size-6 bg-current', className)}
      style={{
        maskImage: mask,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskImage: mask,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
      }}
    />
  );
}

export function UserNavIcon({ className }: { className?: string }) {
  return <StaticNavIcon name="user" className={className} />;
}

export function MoreNavIcon({ className }: { className?: string }) {
  return <StaticNavIcon name="more" className={className} />;
}
