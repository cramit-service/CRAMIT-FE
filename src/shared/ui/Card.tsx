'use client';
// src/shared/ui/Card.tsx
// DESIGN.md §4 "A card takes the press rule unchanged".
import { cn } from '@/shared/lib/cn';

interface CardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'className'
> {
  /** 누를 수 있는 카드. 어디로 가는 카드인지(navigates) 제자리에서 일하는지에 따라
   *  눌림을 그릴지가 갈린다 — 넘어가는 카드의 눌림은 그려지자마자 페이지와 함께 버려진다. */
  press?: 'none' | 'navigates' | 'in-place';
  /** 다른 게 골라질 때까지 상태를 들고 있는 카드. 눌림이 아니라 선택이다. */
  selected?: boolean;
  children: React.ReactNode;
}

export function Card({
  press = 'none',
  selected = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      // §2의 누름 규칙을 그대로 쓴다 — 흰 카드 위에 검정 8%와 16%, 더한 것 없음.
      // 흰색이 천장이라 호버는 내려갈 수밖에 없는데, 커서 아래에서 일어나는 변화라
      // "가라앉았다"가 아니라 "이것"으로 읽힌다.
      // 테두리도 그림자도 안 쓴다 — §2가 목록 위의 카드에 그림자를 금지한다.
      className={cn(
        'bg-surface rounded-lg p-4 transition-colors duration-150 ease-out',
        // 눌린 채로 있는 건 눌림이 아니라 선택이다. §2가 넓은 면의 연두로 pale을 남겼다.
        selected && 'bg-lime-pale',
        press !== 'none' && 'cursor-pointer',
        // TODO: §4의 호버는 "그 카드의 채움 위에 검정 8%"다. 흰 위의 8%는 #ebebeb,
        // lime-pale 위의 8%는 #deeb7e인데 둘 다 토큰이 없다. well로 근사해 뒀다.
        press !== 'none' && !selected && 'hover:bg-well',
        press === 'in-place' && !selected && 'active:bg-gray-100',
      )}
      {...props}
    >
      {children}
    </div>
  );
}
