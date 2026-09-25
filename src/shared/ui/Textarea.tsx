'use client';
// src/shared/ui/Textarea.tsx
// §4는 여러 줄 입력을 다루지 않는다. 한 줄 필드(§4 "A field has no border until it has
// something to say")의 규칙을 그대로 가져온다 — 채움이 필드이고 테두리는 상태일 때만.
// 다른 점은 높이뿐이라, 컨트롤 칸을 쓰지 않는다.
import { useId } from 'react';
import { cn } from '@/shared/lib/cn';

interface TextareaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'className'
> {
  label?: string;
  error?: string;
  /** 부모가 준 높이를 꽉 채운다. 폼 안의 메모가 아니라 편집 화면일 때. */
  grow?: boolean;
  /** React 19에서 ref는 평범한 prop이다. 편집 화면이 스크롤 위치를 만지려면 필요하다. */
  ref?: React.Ref<HTMLTextAreaElement>;
}

export function Textarea({
  label,
  error,
  grow = false,
  id,
  disabled,
  ...props
}: TextareaProps) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  const errorId = `${textareaId}-error`;

  return (
    <div className={cn('flex w-full flex-col gap-2', grow && 'h-full min-h-0')}>
      {label && (
        <label
          htmlFor={textareaId}
          className="text-body-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}

      <textarea
        id={textareaId}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'bg-well text-body-sm w-full rounded-md border border-transparent px-4.5 py-3',
          'resize-none text-gray-700 placeholder:text-gray-500',
          'transition-colors duration-150 ease-out outline-none',
          // 글자 필드는 마우스로 눌러도 테두리가 나와야 한다 — 캐럿을 찾을 수 있어야 한다.
          error ? 'border-red-ink' : 'focus:border-sky-ink',
          disabled && 'cursor-not-allowed text-gray-400',
          grow && 'min-h-0 flex-1',
        )}
        {...props}
      />

      {error && (
        <p id={errorId} className="text-body-sm text-red-ink">
          {error}
        </p>
      )}
    </div>
  );
}
