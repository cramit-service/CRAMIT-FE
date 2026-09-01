'use client';
// src/shared/ui/Checkbox.tsx
import { cn } from '@/shared/lib/cn';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  // 라벨을 주면 글자를 눌러도 토글된다(약관 동의처럼 줄 전체가 체크 대상일 때).
  // 상자만 토글해야 하는 화면은 라벨을 넘기지 말고 글자를 바깥에서 직접 그린 뒤
  // aria-label로 이름만 준다. (예: 투두 체크리스트 — 글자를 누르면 상세보기가 열린다)
  label?: React.ReactNode;
  'aria-label'?: string;
  className?: string;
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

// 체크박스의 "네모" 표시만 떼어낸 것. 상태를 받아 그리기만 하고 아무것도 토글하지 않는다.
// button 안에는 input을 넣을 수 없어서(중첩 인터랙티브 요소), 행 전체가 하나의 버튼인 화면은
// Checkbox 본체를 못 쓴다(예: 홈 TODO 체크리스트 — 행을 눌러 완료한다).
// 그런 곳이 네모를 직접 그리면 모양이 갈라지므로 여기 한 곳에서만 정의한다.
export function CheckboxBox({
  checked,
  className,
}: {
  checked: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border transition-colors',
        // 체크 시 색을 채우고, 아니면 아이콘을 투명하게 두어 크기 변화를 막는다
        checked
          ? 'border-secondary-400 bg-secondary-400 text-gray-100'
          : 'border-gray-400 bg-gray-100 text-transparent',
        className,
      )}
    >
      <CheckIcon className="h-3.5 w-3.5" />
    </span>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  'aria-label': ariaLabel,
  className,
}: CheckboxProps) {
  return (
    <label
      className={cn(
        // relative 필수 — sr-only input이 position:absolute라, 위치 기준이 없으면
        // 컨테이닝 블록이 문서 최상위가 되어 조상의 overflow에 잘리지 않고
        // 스크롤 컨테이너를 탈출해 문서 높이를 밀어낸다.
        'relative inline-flex cursor-pointer items-center gap-3 select-none',
        className,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={ariaLabel}
        className="peer sr-only"
      />
      {/* 포커스 링은 여기 남긴다 — peer-*는 형제인 input이 있어야 동작하므로 CheckboxBox로 못 옮긴다 */}
      <CheckboxBox
        checked={checked}
        className="peer-focus-visible:ring-secondary-400 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1"
      />
      {/* 라벨이 없으면 span 자체를 그리지 않는다 — 빈 span이 남으면 gap만큼 클릭 영역이 넓어진다 */}
      {label !== undefined && <span className="text-gray-900">{label}</span>}
    </label>
  );
}
