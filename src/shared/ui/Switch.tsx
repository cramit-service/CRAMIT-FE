'use client';
// src/shared/ui/Switch.tsx
import { cn } from '@/shared/lib/cn';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** 켜고 끄는 대상이 무엇인지. 옆 글자를 labelledBy로 묶었다면 생략한다. */
  label?: string;
  /** 옆에 놓인 설명 글자의 id. 스크린리더가 이 스위치를 그 글자로 읽는다. */
  labelledBy?: string;
  disabled?: boolean;
}

// 알림 설정 같은 즉시 반영 토글. 체크박스와 달리 "저장"을 누르지 않아도 값이 바뀐다.
// 트랙 40×23, 손잡이 19에 좌우 2px 여백 → 이동 거리 17px.
export function Switch({
  checked,
  onChange,
  label,
  labelledBy,
  disabled,
}: SwitchProps) {
  return (
    <button
      type="button"
      // checkbox가 아니라 switch다 — 보조기술이 "켜짐/꺼짐"으로 읽는다.
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-labelledby={labelledBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-[23px] w-10 shrink-0 items-center rounded-full transition-colors',
        'focus-visible:ring-sky-ink focus-visible:ring-2 focus-visible:outline-none',
        checked ? 'bg-lime-action' : 'bg-gray-400',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      )}
    >
      {/* 손잡이. left를 애니메이션하면 매 프레임 레이아웃이 다시 계산된다 — transform만 움직인다.

          bg-white였다. §2가 프레임워크 팔레트를 지우면서 white도 같이 사라져 손잡이가
          투명하게 렌더되고 있었다 — 알약만 보이고 원이 없었다. surface가 §2에서 흰 표면의
          이름이다.

          켜짐에서 흰 손잡이는 연두 위 1.13:1이라 WCAG 1.4.11(3:1)을 못 넘는다. 알고
          그대로 둔다 — 손잡이에 gray-400 테두리를 두르거나(3.26:1) 켜짐 손잡이를
          gray-800으로 바꾸면(14.74:1) 넘지만, 시안의 흰 원을 지키기로 했다.
          켜짐 트랙(lime-action)도 흰 카드 위에서 1.13:1이라 알약의 윤곽 자체가 흐리다.
          §4는 Toggle만 정하고 Switch를 정한 적이 없다 — Toggle은 안에 든 라벨(연두 위
          gray-800, 14.74:1)이 상태와 폭을 둘 다 말해 주는데 스위치에는 그 라벨이 없다. */}
      <span
        aria-hidden
        className={cn(
          'bg-surface absolute left-[2px] size-[19px] rounded-full transition-transform duration-150',
          checked ? 'translate-x-[17px]' : 'translate-x-0',
        )}
      />
    </button>
  );
}
