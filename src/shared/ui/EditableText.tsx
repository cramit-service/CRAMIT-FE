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
import { IconButton } from '@/shared/ui/IconButton';

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
  // 제출한 값. 열자마자 draft === value이므로, 이것 없이 "값이 같아졌다"만 보면
  // 편집이 열리는 순간 닫혀 버린다.
  const [submitted, setSubmitted] = useState<string | null>(null);

  const start = () => {
    setDraft(value);
    setSubmitted(null);
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
    setSubmitted(next);
    onCommit(next);
  };

  // 저장이 끝나야 닫는다. 성공은 value가 방금 친 값으로 바뀌는 것으로 안다.
  // 먼저 닫으면 실패했을 때 친 글자가 사라지고 예전 제목이 아무 말 없이 돌아온다.
  // 효과로 닫지 않고 파생값으로 둔다 — 효과 안에서 setState를 하면 렌더가 한 번 더 돈다.
  const saved = submitted !== null && !saving && !error && value === submitted;
  const isEditing = editing && !saved;

  const cancel = () => {
    setSubmitted(null);
    onCancel?.();
    setDraft(value);
    setEditing(false);
  };

  if (!isEditing) {
    return (
      <>
        {/* 글자 자체는 누르는 것이 아니다. 읽는 자리를 누르면 고쳐지는 화면은
            무엇이 눌리는지 알 수 없다 — 고치는 일은 옆의 아이콘이 맡는다. */}
        <span
          className={cn('min-w-0 truncate', value === '' && 'text-gray-500')}
        >
          {value === '' ? placeholder : value}
        </span>
        <span className="shrink-0">
          <IconButton
            name="edit"
            glyph={16}
            aria-label={label}
            onClick={start}
          />
        </span>
      </>
    );
  }

  return (
    <>
      {/* 폭이 글자를 따라간다. input은 제 내용 길이를 모르므로, 같은 글자를 숨겨 깐
          span이 폭을 정하고 input이 그 위에 겹쳐 눕는다. 한 칸에 둘을 넣는 grid라
          둘의 폭이 언제나 같다.
          (field-sizing: content가 같은 일을 하지만 크롬에만 있다.) */}
      <span className="grid min-w-0">
        <span
          aria-hidden
          className="invisible col-start-1 row-start-1 min-w-8 whitespace-pre"
        >
          {draft}
        </span>
        <input
          autoFocus
          // size가 없으면 input이 기본 20글자만큼의 고유 폭을 주장해서, 그게 숨은 글자보다
          // 항상 커진다(제목 크기에서는 270px쯤). 1로 낮춰 폭을 숨은 글자에 넘긴다.
          size={1}
          value={draft}
          disabled={saving}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onFocus={(e) => e.currentTarget.select()}
          onKeyDown={(e) => {
            // 감싼 화면이 Esc·방향키를 단축키로 쓸 수 있다. 글자를 치는 동안은 넘기지 않는다.
            e.stopPropagation();
            if (e.key === 'Enter') {
              e.preventDefault();
              commit();
            }
            if (e.key === 'Escape') cancel();
          }}
          aria-label={label}
          aria-invalid={error ? true : undefined}
          // 크기·굵기·색은 감싼 쪽에서 물려받는다. 여기서 정하면 제목이 아니게 된다.
          className={cn(
            'col-start-1 row-start-1 w-full border-b bg-transparent outline-none',
            error
              ? 'border-red-ink'
              : 'focus-visible:border-sky-ink border-gray-100',
            saving && 'text-gray-500',
          )}
        />
      </span>
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
