'use client';
// src/shared/ui/Button.tsx
// DESIGN.md §4 "A second action is a border, not a fill" / "Two heights, and the
// field shares one" / "A button is as wide as its label".
import Link from 'next/link';
import { cn } from '@/shared/lib/cn';
import { control, type ControlSize } from '@/shared/ui/control';

// 이름은 색이 아니라 순위다. §2가 순위에 쓸 색을 하나만 남겼기 때문에,
// 2순위는 색을 바꾸는 대신 채움을 포기하고 테두리를 가져간다.
// 회색 채움은 비활성의 것이고, 비활성 말고는 아무것도 안 가진다.
type Rank = 'primary' | 'secondary' | 'danger';

// 크기는 §2 컨트롤 높이의 단계 이름을 그대로 받는다. 높이와 글자가 control.ts에
// 짝으로 묶여 있어서, 한쪽만 고르는 일은 애초에 불가능하다.

// href를 받으면 <a>가 된다. §4가 "목적지가 있으면 링크"라고 정했는데, 그러면서도
// 생김새는 버튼과 같아야 하는 자리가 있다(새 주차 업로드). 클래스 문자열을 따로
// 내보내는 건 §4가 막는다 — "A shared class string is a component's appearance with
// none of its behavior": 부르는 쪽마다 type·disabled·포커스를 다시 쓰고, 이미 서로 어긋났다.
// 한 부품이 두 요소를 내는 쪽이 그 규칙을 지키면서 같은 생김새를 보장하는 유일한 길이다.
// disabled는 링크 쪽에 없다 — <a>는 못 끄고, 끄고 싶으면 그건 버튼이다.
interface CommonProps {
  rank?: Rank;
  size?: ControlSize;
  children: React.ReactNode;
}

type ButtonProps = CommonProps &
  (
    | (Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
        href?: never;
      })
    | (Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'className'> & {
        href: string;
      })
  );

const rankStyles: Record<Rank, string> = {
  primary:
    'bg-lime-action text-gray-800 hover:bg-lime-hover active:bg-lime-pressed',
  secondary:
    'bg-surface border border-gray-100 text-gray-700 hover:bg-gray-100',
  danger: 'bg-red-danger text-gray-800 hover:brightness-95',
};

export function Button({
  rank = 'primary',
  size,
  children,
  ...rest
}: ButtonProps) {
  // 너비는 라벨이 정한다 — 고정폭도 최소폭도 없다. 순위는 채움과 위치가
  // 이미 말하고 있고, 너비가 그걸 한 번 더 말하면 다른 뜻으로는 못 쓰게 된다.
  const className = cn(
    'inline-flex items-center justify-center gap-1 rounded-md px-4.5',
    'font-medium whitespace-nowrap transition-colors duration-150 ease-out',
    'focus-visible:ring-sky-ink focus-visible:ring-2 focus-visible:outline-none',
    control(size),
    'disabled' in rest && rest.disabled
      ? 'cursor-not-allowed bg-gray-100 text-gray-400'
      : rankStyles[rank],
  );

  if (rest.href !== undefined) {
    const { href, ...anchorProps } = rest;
    return (
      <Link href={href} className={className} {...anchorProps}>
        {children}
      </Link>
    );
  }

  const {
    // 기본은 'button'. HTML 기본값 'submit'이면 form 안에서 의도치 않게 제출된다.
    type = 'button',
    disabled,
    ...buttonProps
  } = rest;

  return (
    <button
      type={type}
      disabled={disabled}
      className={className}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
