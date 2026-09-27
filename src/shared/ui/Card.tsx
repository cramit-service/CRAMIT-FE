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
  /** 긴 목록의 한 줄. 여백과 모서리를 줄인다 — 16px 여백은 격자 위의 카드에 맞는 값이고,
   *  예순 줄짜리 전사문에서는 내용보다 여백이 화면을 더 쓴다. */
  dense?: boolean;
  /** surface 판 위에 놓일 때. §2에 표면이 셋뿐이라 더 올라갈 데가 없어 well로 내려간다 —
   *  흰 판 위의 흰 카드는 ΔE 0이고, 실제로 뷰어에서 그렇게 사라진 적이 있다. */
  sunken?: boolean;
  children: React.ReactNode;
}

export function Card({
  press = 'none',
  selected = false,
  dense = false,
  sunken = false,
  children,
  ...props
}: CardProps) {
  const pressable = press !== 'none';

  // §2의 누름 규칙을 그대로 쓴다 — 흰 카드 위에 검정 8%와 16%, 더한 것 없음.
  // 흰색이 천장이라 호버는 내려갈 수밖에 없는데, 커서 아래에서 일어나는 변화라
  // "가라앉았다"가 아니라 "이것"으로 읽힌다.
  // 그림자는 안 쓴다 — §2가 목록 위의 카드에 금지한다. 테두리는 쉬는 상태의 가장자리
  // 때문에 필요하다: surface(#ffffff)와 canvas(#fcfaf7)는 ΔE 2.35로, 차이가 인지되기
  // 시작하는 문턱 바로 그 값이다. 여유가 0이라 안티에일리어싱 한 겹이면 가장자리가 없다.
  // sunken이 이미 그 판단을 들고 있어서 prop을 새로 만들지 않는다 — 가라앉은 카드는
  // surface 판 위의 well이라 ΔE 7.65고, 자기 채움만으로 이미 가장자리를 갖는다.
  const className = cn(
    'transition-[background-color,filter] duration-150 ease-out',
    sunken ? 'bg-well' : 'bg-surface border border-gray-100',
    dense ? 'rounded-md px-3 py-2' : 'rounded-lg p-4',
    // 눌린 채로 있는 건 눌림이 아니라 선택이다. §2가 넓은 면의 연두로 pale을 남겼다.
    selected && 'bg-lime-pale',
    pressable && 'w-full cursor-pointer text-left',
    // §4의 8%·16%를 채움을 갈아 끼우지 않고 그대로 곱한다. 고정 토큰으로 근사하면
    // 카드가 어떤 판 위에 있느냐에 따라 그 판과 같은 색이 되는 순간이 생긴다 —
    // well 판 위의 hover가 실제로 그랬다. 곱셈은 제 채움을 기준으로 하니 바닥을 안 탄다.
    // (brightness-92는 흰 위에서 #ebebeb, lime-pale 위에서 #deeb7e — §4가 적은 두 값과 같다)
    pressable && 'hover:brightness-92',
    // 눌림은 화면이 그대로 남을 때만 그린다. 넘어가는 카드의 눌림은
    // 그려지자마자 페이지와 함께 버려진다.
    press === 'in-place' && 'active:brightness-84',
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
