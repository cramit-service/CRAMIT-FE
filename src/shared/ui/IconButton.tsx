'use client';
// src/shared/ui/IconButton.tsx
// DESIGN.md §4 "An icon button is twice its glyph".
import { cn } from '@/shared/lib/cn';
import { Icon, type IconName } from '@/shared/ui/Icon';

// 여백은 글리프의 절반이라, 버튼은 언제나 글리프의 두 배다.
// 사다리는 고른 게 아니라 만들어진 것이다 — §3의 아이콘 램프가 16·20·24이므로
// 이 규칙이 만들 수 있는 버튼은 이 셋뿐이고, 셋 다 §2의 컨트롤 높이에 이미 있다.
type Glyph = 16 | 20 | 24;

// §4는 아이콘 버튼의 크기만 정하고 색은 정하지 않는다. Button이 이미 가진 순위를
// 그대로 쓴다 — 연두가 필요한 자리(재생 같은 것)에서 글리프만 연두로 칠하면 §2 위반이다.
// 연두는 채움이지 글자도 아이콘도 아니고, 캔버스 위에서 1.09:1이라 사실상 안 보인다.
type Rank = 'primary' | 'secondary' | 'plain';

const rankStyles: Record<Rank, string> = {
  primary:
    'bg-lime-action text-gray-800 hover:bg-lime-hover active:bg-lime-pressed',
  secondary:
    'bg-surface border border-gray-100 text-gray-700 hover:bg-gray-100',
  // 채움도 테두리도 없는 것. 줄 안에 묻혀 있다가 커서가 오면 자리를 드러낸다.
  plain: 'text-gray-700 hover:bg-gray-100',
};

interface IconButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'children'
> {
  name: IconName;
  /** 글자가 없으니 이름은 여기서 준다. 없으면 보조기술이 못 읽는다. */
  'aria-label': string;
  glyph?: Glyph;
  rank?: Rank;
}

const sizeStyles: Record<Glyph, string> = {
  16: 'size-8 p-2',
  20: 'size-10 p-2.5',
  24: 'size-12 p-3',
};

export function IconButton({
  name,
  glyph = 16,
  rank = 'plain',
  type = 'button',
  disabled,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-md transition-colors duration-150 ease-out',
        'focus-visible:ring-sky-ink focus-visible:ring-2 focus-visible:outline-none',
        sizeStyles[glyph],
        disabled
          ? 'cursor-not-allowed bg-gray-100 text-gray-400'
          : rankStyles[rank],
      )}
      {...props}
    >
      <Icon name={name} size={glyph} />
    </button>
  );
}
