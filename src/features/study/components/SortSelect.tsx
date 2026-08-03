'use client';
// src/features/study/components/SortSelect.tsx
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { ChevronDownIcon } from './icons';
import { SORT_LABEL, type SortKey } from '../lib/lectureList';

const OPTIONS: SortKey[] = ['REGISTERED', 'NAME'];

interface SortSelectProps {
  value: SortKey;
  onChange: (value: SortKey) => void;
  // 같은 화면에 드롭다운이 둘(내 강의/공유 강의)이라 라벨을 구분해 준다.
  label: string;
}

// 강의 목록 정렬 드롭다운. 시안엔 닫힌 상태만 있어 열린 메뉴는 이 화면 규칙으로 만든다.
export function SortSelect({ value, onChange, label }: SortSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // 열려 있을 때만 리스너를 건다.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    // 메뉴가 absolute라 위치 기준을 여기서 잡는다.
    // relative가 없으면 기준이 문서 최상위가 돼 섹션 스크롤 컨테이너를 탈출한다 (CLAUDE.md §4-5).
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        // 버튼 글자가 "등록순"뿐이라 두 섹션의 드롭다운이 구분되지 않는다
        aria-label={`${label}, 현재 ${SORT_LABEL[value]}`}
        className="flex h-7 items-center gap-1 rounded-md border-[0.5px] border-gray-500 pr-2 pl-2.5 text-[14px] leading-5 font-medium tracking-[-0.28px] text-gray-600 transition-colors hover:border-gray-600 hover:text-gray-800"
      >
        {SORT_LABEL[value]}
        <ChevronDownIcon className="size-3.5" />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute top-full right-0 z-10 mt-1 min-w-full overflow-hidden rounded-md border-[0.5px] border-gray-500 bg-white shadow-md"
        >
          {OPTIONS.map((option) => (
            <li key={option}>
              <button
                type="button"
                role="option"
                aria-selected={option === value}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={cn(
                  'w-full px-2.5 py-1 text-left text-[14px] leading-5 font-medium tracking-[-0.28px] whitespace-nowrap transition-colors hover:bg-gray-200',
                  option === value ? 'text-gray-800' : 'text-gray-600',
                )}
              >
                {SORT_LABEL[option]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
