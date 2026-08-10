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
// Figma 시안 그대로 트랙 56×32, 손잡이 26에 좌우 3px 여백 → 이동 거리 24px.
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
        'relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors',
        'focus-visible:ring-secondary-400 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 focus-visible:outline-none',
        checked ? 'bg-secondary-400' : 'bg-gray-500',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      )}
    >
      {/* 손잡이. left를 애니메이션하면 매 프레임 레이아웃이 다시 계산된다 — transform만 움직인다. */}
      <span
        aria-hidden
        className={cn(
          'absolute left-[3px] size-[26px] rounded-full bg-white transition-transform duration-150',
          checked ? 'translate-x-6' : 'translate-x-0',
        )}
      />
    </button>
  );
}
