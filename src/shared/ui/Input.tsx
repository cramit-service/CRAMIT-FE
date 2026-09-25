'use client';
// src/shared/ui/Input.tsx
// DESIGN.md §4 "A field has no border until it has something to say".
import { useId } from 'react';
import { cn } from '@/shared/lib/cn';
import { H_CONFIRM, TEXT_CONTROL } from '@/shared/ui/control';

interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'className'
> {
  label?: string;
  /** 틀렸다는 말. 테두리를 빨갛게 만들고 아래에 그대로 적는다. */
  error?: string;
}

export function Input({ label, error, id, disabled, ...props }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <label
          htmlFor={inputId}
          className={cn(TEXT_CONTROL, 'font-medium text-gray-700')}
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        // 채움이 필드다. 테두리는 할 말이 있을 때만 나온다 — 파랑은 여기, 빨강은 틀림.
        // 테두리가 늘 있으면 상태를 말할 채널이 남지 않는다.
        //
        // 테두리는 자리를 차지하므로 쉬는 상태에도 투명한 테두리를 둔다.
        // 없으면 포커스가 들어오는 순간 필드가 1px 커지면서 옆의 것들이 밀린다.
        className={cn(
          H_CONFIRM,
          TEXT_CONTROL,
          'bg-well w-full rounded-md border border-transparent px-4.5',
          'text-gray-700 placeholder:text-gray-500',
          'transition-colors duration-150 ease-out outline-none',
          // 글자 필드는 마우스로 눌러도 테두리가 나와야 한다 — 캐럿이 어디 있는지
          // 찾을 수 있어야 하므로 focus-visible이 아니라 focus다.
          error ? 'border-red-ink' : 'focus:border-sky-ink',
          disabled && 'cursor-not-allowed text-gray-400',
        )}
        {...props}
      />

      {error && (
        <p id={errorId} className={cn(TEXT_CONTROL, 'text-red-ink')}>
          {error}
        </p>
      )}
    </div>
  );
}
