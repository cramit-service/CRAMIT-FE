'use client';
// src/shared/ui/Input.tsx
// DESIGN.md §4 "A field has no border until it has something to say" /
// "An icon in a field stands in front of it".
import { useId } from 'react';
import { cn } from '@/shared/lib/cn';
import {
  FIELD_BOX,
  FIELD_ICON,
  FIELD_ICON_SIZE,
  FIELD_ERROR,
  FIELD_INVALID,
} from '@/shared/ui/fieldStyle';
import { FieldLabel } from '@/shared/ui/FieldLabel';
import { Icon, type IconName } from '@/shared/ui/Icon';

// 라벨과 앞아이콘은 같은 일을 한다 — 이 칸이 무엇을 받는지 말하는 것. 둘을 함께 주면
// 같은 말을 두 번 하므로 타입으로 막는다. §4는 검사하지 않는 규칙을 주석이라고 부른다.
type Naming =
  { label?: string; icon?: never } | { label?: never; icon?: IconName };

type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'className'
> & {
  /** 틀렸다는 말. 테두리를 빨갛게 만들고 아래에 그대로 적는다. */
  error?: string;
} & Naming;

export function Input({
  label,
  icon,
  error,
  id,
  disabled,
  // 라벨의 별표와 <input required>를 하나가 몬다. 꺼내 쓰되 input에도 그대로 넘긴다.
  required,
  ...props
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <FieldLabel htmlFor={inputId} required={required}>
          {label}
        </FieldLabel>
      )}

      {/* 채움과 테두리는 칸이 갖고 input은 그 안에서 투명하다. 아이콘이 칸 안에 서려면
          둘이 같은 줄에 있어야 하는데, 아이콘을 absolute로 띄우면 글자의 왼쪽 여백을
          18+16+8로 계산해 박아야 한다 — §2 간격 목록에 없는 42가 생긴다.
          flex로 두면 그 자리가 gap-2(8)이 되어 목록 안에 남는다.
          테두리가 focus가 아니라 focus-within을 보는 것도 이 구조 때문이다.

          div가 아니라 label이다. 여백과 아이콘이 input 바깥으로 나오면서 칸 안에
          커서가 안 들어오는 자리가 생겼다 — 돋보기도, 양끝 18px도 눌러도 아무 일이
          없었다(아이콘의 pointer-events-none은 삼키는 것만 막지 전달하지 않는다).
          label은 그걸 브라우저가 이미 한다. 글자가 없어서(아이콘은 aria-hidden)
          접근성 이름에는 아무것도 보태지 않는다. */}
      <label
        htmlFor={inputId}
        className={cn(
          FIELD_BOX,
          // 채움이 필드다. 테두리는 할 말이 있을 때만 나온다 — 파랑은 포커스, 빨강은 틀림.
          error && FIELD_INVALID,
          disabled && 'cursor-not-allowed',
        )}
      >
        {icon && (
          <span aria-hidden className={FIELD_ICON}>
            <Icon name={icon} size={FIELD_ICON_SIZE} />
          </span>
        )}

        <input
          id={inputId}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            // min-w-0 없으면 input의 기본 너비(size 속성 20자)가 최소폭이 되어
            // 좁은 칸에서 아이콘을 밀어낸다.
            'min-w-0 flex-1 bg-transparent outline-none',
            'placeholder:text-gray-500',
            disabled ? 'cursor-not-allowed text-gray-400' : 'text-gray-700',
          )}
          {...props}
        />
      </label>

      {error && (
        <p id={errorId} className={FIELD_ERROR}>
          {error}
        </p>
      )}
    </div>
  );
}
