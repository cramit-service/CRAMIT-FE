'use client';
// src/features/study/components/SortSelect.tsx
import { useEffect, useId, useRef, useState } from 'react';
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
//
// role="listbox"/"option"을 쓰지 않는다. 그 롤을 붙이면 스크린리더가 화살표 키 탐색을
// 기대하는데, 옵션이 <button>이라 실제로는 Tab으로만 이동한다. 지키지 못할 계약을
// 선언하는 것보다 롤 없는 열림/닫힘(disclosure)으로 두는 편이 정확하다.
export function SortSelect({ value, onChange, label }: SortSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstOptionRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  // 열려 있을 때만 리스너를 건다.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // 열리면 첫 옵션으로 포커스를 옮긴다. 키보드 사용자가 메뉴 안으로 못 들어가면
  // 열어도 소용이 없다.
  useEffect(() => {
    if (open) firstOptionRef.current?.focus();
  }, [open]);

  return (
    // 메뉴가 absolute라 위치 기준을 여기서 잡는다.
    // relative가 없으면 기준이 문서 최상위가 돼 섹션 스크롤 컨테이너를 탈출한다 (CLAUDE.md §4-5).
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        // 닫혀 있을 땐 ul이 렌더되지 않으므로 없는 id를 가리키지 않게 뺀다
        aria-controls={open ? listId : undefined}
        // 버튼 글자가 "등록순"뿐이라 두 섹션의 드롭다운이 구분되지 않는다
        aria-label={`${label}, 현재 ${SORT_LABEL[value]}`}
        className="flex h-7 items-center gap-1 rounded-md border-[0.5px] border-gray-500 pr-2 pl-2.5 text-[14px] leading-5 font-medium tracking-[-0.28px] text-gray-600 transition-colors hover:border-gray-600 hover:text-gray-800"
      >
        {SORT_LABEL[value]}
        <ChevronDownIcon className="size-3.5" />
      </button>

      {open && (
        <ul
          id={listId}
          className="absolute top-full right-0 z-10 mt-1 min-w-full overflow-hidden rounded-md border-[0.5px] border-gray-500 bg-white shadow-md"
        >
          {OPTIONS.map((option, index) => (
            <li key={option}>
              <button
                ref={index === 0 ? firstOptionRef : undefined}
                type="button"
                aria-current={option === value}
                // 메뉴가 사라지면 포커스가 갈 곳을 잃으므로 트리거로 돌려준다.
                // (바깥 클릭으로 닫힐 땐 클릭한 곳에 포커스가 가 있으니 뺏지 않는다)
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                  triggerRef.current?.focus();
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
