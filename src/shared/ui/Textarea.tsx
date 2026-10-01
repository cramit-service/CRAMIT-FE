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
  /** 채움·테두리·여백을 감싼 쪽이 갖는다. 여러 줄 입력이 다른 컨트롤과 한 상자에
   *  들어갈 때 쓴다 — 상자가 곧 필드이고 이건 그 안에 투명하게 깔린다.
   *  fieldStyle의 FIELD_BOX와 같은 구조이고, 포커스 테두리도 감싼 쪽이 focus-within으로 받는다. */
  bare?: boolean;
  /** 내용을 따라 늘어나되 이 줄 수에서 멈추고 스크롤한다.
   *  높이를 JS로 재지 않는다 — field-sizing:content가 브라우저 몫으로 처리한다. */
  maxRows?: number;
  /** React 19에서 ref는 평범한 prop이다. 편집 화면이 스크롤 위치를 만지려면 필요하다. */
  ref?: React.Ref<HTMLTextAreaElement>;
}

// text-body-sm의 줄상자(§3). maxRows를 픽셀 상한으로 옮길 때 쓴다.
const LINE_HEIGHT = 24;

export function Textarea({
  label,
  error,
  grow = false,
  bare = false,
  maxRows,
  id,
  disabled,
  ...props
}: TextareaProps) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  const errorId = `${textareaId}-error`;

  return (
    <div
      className={cn(
        'flex w-full flex-col gap-2',
        grow && 'h-full min-h-0',
        // 감싼 상자가 필드일 때는 이 래퍼가 자리를 차지하지 않는다.
        bare && 'gap-0',
      )}
    >
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
        rows={maxRows ? 1 : props.rows}
        style={maxRows ? { maxHeight: maxRows * LINE_HEIGHT } : undefined}
        className={cn(
          'text-body-sm w-full resize-none text-gray-700 placeholder:text-gray-500',
          'outline-none',
          bare
            ? 'bg-transparent'
            : cn(
                'bg-well rounded-md border border-transparent px-4.5 py-3',
                'transition-colors duration-150 ease-out',
                // 글자 필드는 마우스로 눌러도 테두리가 나와야 한다 — 캐럿을 찾을 수 있어야 한다.
                error ? 'border-red-ink' : 'focus:border-sky-ink',
              ),
          // 내용을 따라 늘어난다. 높이를 재는 JS가 필요 없다.
          maxRows && 'field-sizing-content',
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
