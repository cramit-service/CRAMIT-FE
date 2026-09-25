'use client';
// src/shared/ui/Card.tsx
// DESIGN.md §4 "A card takes the press rule unchanged".
import { cn } from '@/shared/lib/cn';

// 누르는 카드는 button으로, 아닌 카드는 div로 그린다.
// div에 onClick만 붙이면 커서 모양만 바뀐다 — Tab이 안 닿고, Enter·Space가 안 먹고,
// 보조기기가 버튼이라 읽지 않고, aria-expanded 같은 상태도 못 든다.
// press가 이미 "이게 눌리는가"를 알고 있으니, 그 앎을 CSS에만 쓰지 않고 태그에도 쓴다.
interface CardProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'type'
> {
  /** 누를 수 있는 카드. 어디로 가는 카드인지(navigates) 제자리에서 일하는지에 따라
   *  눌림을 그릴지가 갈린다 — 넘어가는 카드의 눌림은 그려지자마자 페이지와 함께 버려진다. */
  press?: 'none' | 'navigates' | 'in-place';
  /** 다른 게 골라질 때까지 상태를 들고 있는 카드. 눌림이 아니라 선택이다. */
  selected?: boolean;
  /** 무엇 위에 서는지. §2의 표면이 셋뿐이라 카드가 자기 채움을 혼자 정할 수 없다 —
   *  canvas 위면 surface로 떠오르고, surface(패널) 위면 well로 파인다.
   *  흰 판 위에 흰 카드를 올리면 대비가 1:1이라 카드가 없는 것과 같다. */
  on?: 'canvas' | 'surface';
  children: React.ReactNode;
}

export function Card({
  press = 'none',
  selected = false,
  on = 'canvas',
  children,
  ...props
}: CardProps) {
  const pressable = press !== 'none';
  const onPanel = on === 'surface';

  // §2의 누름 규칙을 그대로 쓴다 — 흰 카드 위에 검정 8%와 16%, 더한 것 없음.
  // 흰색이 천장이라 호버는 내려갈 수밖에 없는데, 커서 아래에서 일어나는 변화라
  // "가라앉았다"가 아니라 "이것"으로 읽힌다.
  // 테두리도 그림자도 안 쓴다 — §2가 목록 위의 카드에 그림자를 금지한다.
  const className = cn(
    'rounded-lg p-4 transition-colors duration-150 ease-out',
    onPanel ? 'bg-well' : 'bg-surface',
    // 눌린 채로 있는 건 눌림이 아니라 선택이다. §2가 넓은 면의 연두로 pale을 남겼다.
    selected && 'bg-lime-pale',
    pressable && 'w-full cursor-pointer text-left',
    // TODO: §4의 호버는 "그 카드의 채움 위에 검정 8%"다. 흰 위의 8%는 #ebebeb,
    // lime-pale 위의 8%는 #deeb7e인데 둘 다 토큰이 없다. well로 근사해 뒀다.
    pressable && !selected && (onPanel ? 'hover:bg-gray-100' : 'hover:bg-well'),
    // 눌림은 화면이 그대로 남을 때만 그린다. 넘어가는 카드의 눌림은
    // 그려지자마자 페이지와 함께 버려진다.
    press === 'in-place' && !selected && 'active:bg-gray-100',
  );

  if (!pressable) {
    return (
      <div
        className={className}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
      >
        {children}
      </div>
    );
  }

  return (
    <button type="button" className={className} {...props}>
      {children}
    </button>
  );
}
