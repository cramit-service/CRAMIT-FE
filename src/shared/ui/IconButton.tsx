'use client';
// src/shared/ui/IconButton.tsx
// DESIGN.md §4 "An icon button is twice its glyph".
import { cn } from '@/shared/lib/cn';
import { Icon, type IconName } from '@/shared/ui/Icon';

// 여백은 글리프의 절반이라, 버튼은 언제나 글리프의 두 배다.
// 사다리는 고른 게 아니라 만들어진 것이다 — §3의 아이콘 램프가 16·20·24이므로
// 이 규칙이 만들 수 있는 버튼은 이 셋뿐이고, 셋 다 §2의 컨트롤 높이에 이미 있다.
type Glyph = 16 | 20 | 24;

interface IconButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'children'
> {
  name: IconName;
  /** 글자가 없으니 이름은 여기서 준다. 없으면 보조기술이 못 읽는다. */
  'aria-label': string;
  glyph?: Glyph;
}

const sizeStyles: Record<Glyph, string> = {
  16: 'size-8 p-2',
  20: 'size-10 p-2.5',
  24: 'size-12 p-3',
};

export function IconButton({
  name,
  glyph = 16,
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
          ? 'cursor-not-allowed text-gray-400'
          : 'hover:bg-well text-gray-700',
      )}
      {...props}
    >
      <Icon name={name} size={glyph} />
    </button>
  );
}
