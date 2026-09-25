'use client';
// src/shared/ui/Toggle.tsx
// DESIGN.md §4 "A toggle is a pill, and it borrows its height".
import { cn } from '@/shared/lib/cn';

interface ToggleProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'children'
> {
  /** 눌린 상태는 이 컨트롤 자신의 것이다. 하나를 누르면 옆이 풀리는 건 '선택'이고,
   *  그건 무리를 아는 쪽(달력·페이지네이션)이 그린다. */
  pressed: boolean;
  children: React.ReactNode;
}

export function Toggle({
  pressed,
  type = 'button',
  disabled,
  children,
  ...props
}: ToggleProps) {
  return (
    <button
      type={type}
      // 눌린 채로 있는 컨트롤은 이게 없으면 상태가 아예 안 읽힌다.
      aria-pressed={pressed}
      disabled={disabled}
      // 높이가 없다. 줄이 정한다 — 옆에 선 컨트롤과 같아야 하는 값이라
      // 자기 단계를 가지면 이유를 댈 수 없는 차이가 생긴다.
      // 모서리가 버튼과 가른다. 알약은 상태를 들고, 6px 모서리는 일을 한다.
      className={cn(
        'inline-flex items-center justify-center gap-1 rounded-full px-4.5',
        'text-body-sm font-medium whitespace-nowrap',
        'transition-colors duration-150 ease-out',
        'focus-visible:ring-sky-ink focus-visible:ring-2 focus-visible:outline-none',
        disabled
          ? 'cursor-not-allowed bg-gray-100 text-gray-400'
          : pressed
            ? 'bg-lime-action hover:bg-lime-hover text-gray-800'
            : 'bg-surface hover:bg-well border border-gray-100 text-gray-700',
      )}
      {...props}
    >
      {children}
    </button>
  );
}
