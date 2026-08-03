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
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border transition-colors',
          'peer-focus-visible:ring-secondary-400 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1',
          // 체크 시 색을 채우고, 아니면 아이콘을 투명하게 두어 크기 변화를 막는다
          checked
            ? 'border-secondary-400 bg-secondary-400 text-gray-100'
            : 'border-gray-400 bg-gray-100 text-transparent',
        )}
      >
        <CheckIcon className="h-3.5 w-3.5" />
      </span>
      {/* 라벨이 없으면 span 자체를 그리지 않는다 — 빈 span이 남으면 gap만큼 클릭 영역이 넓어진다 */}
      {label !== undefined && <span className="text-gray-900">{label}</span>}
    </label>
  );
}
