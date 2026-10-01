// src/shared/ui/FieldLabel.tsx
// DESIGN.md §4 "A required field is marked, an optional one is not".
import { FIELD_LABEL } from '@/shared/ui/fieldStyle';

interface FieldLabelProps {
  /** 칸 하나를 가리킬 때. 라벨이 <label>이 된다. */
  htmlFor?: string;
  /** 칸 여럿이 이 이름을 물려받을 때 (FieldGroup). 라벨이 <span>이 된다. */
  id?: string;
  required?: boolean;
  children: React.ReactNode;
}

// 칸 위에 붙는 이름. 별표가 여기 하나에만 있다 — 라벨을 그리는 부품이 넷이라
// (Input·Combobox·DateField·FieldGroup) 각자 그리면 값이 네 군데가 된다.
//
// 별표는 aria-hidden이다. 보조기기에 필수를 알리는 건 칸 자신의 required이고,
// 별표까지 읽히면 이름이 "제목 별표"가 된다.
export function FieldLabel({
  htmlFor,
  id,
  required = false,
  children,
}: FieldLabelProps) {
  const content = (
    <>
      {children}
      {required && (
        <span aria-hidden className="text-red-ink">
          *
        </span>
      )}
    </>
  );

  // htmlFor가 없으면 <label>로 둘 수 없다 — 가리킬 칸이 하나가 아니다.
  return htmlFor ? (
    <label htmlFor={htmlFor} className={FIELD_LABEL}>
      {content}
    </label>
  ) : (
    <span id={id} className={FIELD_LABEL}>
      {content}
    </span>
  );
}
