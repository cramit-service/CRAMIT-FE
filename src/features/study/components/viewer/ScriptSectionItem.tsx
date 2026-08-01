'use client';
// src/features/study/components/viewer/ScriptSectionItem.tsx
import { formatPlayTime } from '@/features/study/lib/format';
import { Icon } from '@/shared/ui/Icon';
import type { ScriptSection } from '@/shared/types/api';

interface ScriptSectionItemProps {
  section: ScriptSection;
  open: boolean;
  onToggle: () => void;
}

// 원문 스크립트의 한 구간(= PDF 한 페이지). 머리글을 누르면 발화 목록이 펼쳐진다.
export function ScriptSectionItem({
  section,
  open,
  onToggle,
}: ScriptSectionItemProps) {
  const panelId = `script-section-${section.page}`;

  return (
    <li className="rounded-md bg-gray-800 px-[17px] py-4">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        // 머리글 전체가 토글 버튼이라 폭을 꽉 채우고, 시프론만 오른쪽 끝으로 민다.
        className="focus-visible:ring-secondary-400 flex w-full items-center gap-1.5 rounded-sm text-left outline-none focus-visible:ring-2"
      >
        <span className="flex h-[22px] w-[55px] shrink-0 items-center justify-center rounded-full border-[0.5px] border-white text-[12px] leading-[22px] font-medium text-white">
          PDF P.{String(section.page).padStart(2, '0')}
        </span>
        <Icon name="time" size={17} className="text-gray-400" />
        <span className="shrink-0 text-[16px] leading-[24px] font-medium tracking-[-0.32px] text-gray-400 tabular-nums">
          {formatPlayTime(section.startSec)} – {formatPlayTime(section.endSec)}
        </span>
        {/* 구간 소제목 — 시안에서 유일하게 연두로 강조되는 부분 */}
        <span className="text-primary-200 min-w-0 truncate text-[16px] leading-[24px] font-medium tracking-[-0.32px]">
          • {section.title}
        </span>
        <Icon
          name={open ? 'arrow-up' : 'arrow-down'}
          size={20}
          className="ml-auto shrink-0 text-gray-300"
        />
      </button>

      {open && (
        <ul id={panelId} className="mt-[18px] flex flex-col gap-[18px]">
          {section.segments.map((segment) => (
            <li
              key={segment.atSec}
              className="bg-primary-200 flex gap-1.5 rounded-sm p-[9px] text-[14px] leading-[22px] tracking-[-0.28px] text-gray-950"
            >
              <span className="shrink-0 tabular-nums">
                {formatPlayTime(segment.atSec)}
              </span>
              <span className="min-w-0 flex-1">{segment.text}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
