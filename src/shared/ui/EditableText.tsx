'use client';
// src/shared/ui/EditableText.tsx
// 제자리에서 고치는 글자. §4는 이 행동을 정하면서("주차에서 바뀌는 건 제목뿐이고
// 뷰어가 제자리에서 고친다") 부품은 주지 않는다.
//
// Input을 쓰지 않는 이유는 생김새가 정반대라서다. Input은 라벨이 붙고 채움이 있는 폼 칸인데,
// 이건 평소엔 글자 그대로 보이다가 눌렸을 때만 고칠 수 있는 것이 돼야 한다.
// 그래서 크기·굵기·색을 자기가 정하지 않고 감싼 쪽(제목이면 제목)에서 물려받는다.
import { useState } from 'react';
import { cn } from '@/shared/lib/cn';

interface EditableTextProps {
  value: string;
  /** 고친 값을 넘긴다. 저장이 끝날 때까지 편집 상태는 열려 있다. */
  onCommit: (next: string) => void;
  /** 아직 비어 있을 때 대신 보여 줄 말. 눌러야 할 자리라는 걸 알린다. */
  placeholder: string;
  /** 무엇을 고치는 것인지. 옆에 라벨이 없으므로 여기서 준다. */
  label: string;
  saving?: boolean;
  /** 저장이 실패했을 때의 말. 줄을 밀어내지 않게 아래에 띄운다. */
  error?: string;
  /** 편집을 그만둘 때. 실패 상태를 지우는 등 호출처가 할 일이 있으면 쓴다. */
  onCancel?: () => void;
}

export function EditableText({
  value,
  onCommit,
  placeholder,
  label,
  saving = false,
  error,
  onCancel,
}: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const start = () => {
    setDraft(value);
    onCancel?.();
    setEditing(true);
  };

  const commit = () => {
    if (saving) return;
    const next = draft.trim();
    if (next === value) {
      setEditing(false);
      return;
    }
    onCommit(next);
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={start}
        title={label}
        className={cn(
          'focus-visible:ring-sky-ink min-w-0 truncate rounded-sm border-b border-transparent text-left transition-colors',
          'hover:border-gray-100 focus-visible:ring-2 focus-visible:outline-none',
          // 아직 이름이 없으면 눌러야 할 자리라는 걸 드러낸다
          value === '' && 'font-normal text-gray-500',
        )}
      >
        {value === '' ? placeholder : value}
      </button>
    );
  }

  return (
    <>
      <input
        autoFocus
        value={draft}
        disabled={saving}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onFocus={(e) => e.currentTarget.select()}
        onKeyDown={(e) => {
          // 감싼 화면이 Esc·방향키를 단축키로 쓸 수 있다. 글자를 치는 동안은 넘기지 않는다.
          e.stopPropagation();
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'Escape') {
            onCancel?.();
            setDraft(value);
            setEditing(false);
          }
        }}
        aria-label={label}
        aria-invalid={error ? true : undefined}
        // 크기·굵기·색은 감싼 쪽에서 물려받는다. 여기서 정하면 제목이 아니게 된다.
        className={cn(
          'min-w-0 flex-1 border-b bg-transparent font-[inherit] outline-none',
          error
            ? 'border-red-ink'
            : 'focus-visible:border-sky-ink border-gray-100',
          saving && 'text-gray-500',
        )}
      />
      {/* 줄을 밀어내지 않도록 아래에 띄운다 */}
      {error && (
        <p
          role="alert"
          className="text-label text-red-ink absolute top-full left-0 mt-1 font-normal"
        >
          {error}
        </p>
      )}
    </>
  );
}
