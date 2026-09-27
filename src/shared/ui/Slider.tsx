'use client';
// src/shared/ui/Slider.tsx
import { cn } from '@/shared/lib/cn';

interface SliderProps {
  /** 현재 값 (0 ~ max) */
  value: number;
  max: number;
  onChange: (value: number) => void;
  step?: number;
  /** 글자를 안 가진 컨트롤이라 이름은 여기서 받는다. */
  'aria-label': string;
  /** 보조기기가 읽을 값. 초 같은 원시값 대신 사람이 말하는 형식을 준다. */
  'aria-valuetext'?: string;
  disabled?: boolean;
}

// 값을 가진 막대. 손으로 그린 <button>에 클릭 좌표를 계산해 넣던 자리를 대신한다 —
// §4가 "이건 버튼이 아니라 값을 받는 것(input type=range)"이라고 정한 항목이다.
// 네이티브로 오면 드래그·화살표키·Home/End·보조기기 값 읽기가 전부 딸려 온다.
//
// 지난 구간은 트랙 배경의 그라디언트로 그린다. WebKit은 채워진 쪽을 따로 주지 않아
// 요소 하나로는 그 방법밖에 없고, 색은 @theme이 낸 변수를 그대로 읽어 토큰 밖으로 안 나간다.
export function Slider({
  value,
  max,
  onChange,
  step = 1,
  disabled,
  'aria-label': label,
  'aria-valuetext': valueText,
}: SliderProps) {
  const percent = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;

  return (
    <input
      type="range"
      min={0}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      aria-label={label}
      aria-valuetext={valueText}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{
        background: `linear-gradient(to right, var(--color-lime-action) ${percent}%, var(--color-gray-200) ${percent}%)`,
      }}
      className={cn(
        // 두께 6은 어느 램프에도 없다 — §2가 과목 색 막대에 인정한 것과 같은 자리다.
        'h-1.5 w-full cursor-pointer appearance-none rounded-full',
        'focus-visible:ring-sky-ink focus-visible:ring-offset-surface outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        disabled && 'cursor-not-allowed',
        // 잡는 점. 연두 채움과 회색 트랙의 경계에 서므로 절반은 항상 회색 위에 있다.
        '[&::-webkit-slider-thumb]:bg-lime-action [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full',
        '[&::-moz-range-thumb]:bg-lime-action [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0',
      )}
    />
  );
}
