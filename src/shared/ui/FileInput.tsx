'use client';
// src/shared/ui/FileInput.tsx

interface FileInputProps {
  /** 이 input을 가리키는 <label htmlFor>가 보이는 자리를 만든다. */
  id: string;
  accept: string;
  onPick: (file: File | undefined) => void;
  disabled?: boolean;
  /** 감싼 label의 글자가 이름이 되면 파일명·안내문까지 다 읽힌다. 이름은 여기서 준다. */
  'aria-label': string;
  'aria-describedby'?: string;
}

// 파일 고르는 칸. 보이는 것이 없다 — 누르는 자리는 이 input을 가리키는 <label>이 만들고,
// 그래서 칸 전체가 눌리면서 키보드 포커스와 이름은 네이티브 input이 그대로 갖는다.
//
// hidden이 아니라 sr-only다. display:none이면 포커스를 받지 못해 Tab으로 닿을 수 없다.
// sr-only에는 position:absolute가 들어 있으므로 감싼 쪽에 relative가 있어야 한다
// (CLAUDE.md 4-6) — 없으면 문서 최상위 기준으로 자리를 잡아 페이지 높이를 밀어낸다.
export function FileInput({
  id,
  accept,
  onPick,
  disabled,
  'aria-label': label,
  'aria-describedby': describedBy,
}: FileInputProps) {
  return (
    <input
      id={id}
      type="file"
      accept={accept}
      disabled={disabled}
      aria-label={label}
      aria-describedby={describedBy}
      className="sr-only"
      onChange={(e) => {
        onPick(e.target.files?.[0]);
        // 같은 파일을 지웠다가 다시 고르면 change가 안 뜬다. 매번 뜨게 비운다.
        e.target.value = '';
      }}
    />
  );
}
