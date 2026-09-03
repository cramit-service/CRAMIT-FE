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
    // 이분할에서 패널이 좁아지면 이 행이 먼저 무너진다. 창이 아니라 이 행 자체의
    // 폭을 기준으로 접어야 해서 @container를 건다(미디어 쿼리는 분할 폭을 모른다).
    <li className="@container rounded-md bg-gray-800 px-[17px] py-4">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        // 머리글 전체가 토글 버튼이라 폭을 꽉 채운다.
        className="focus-visible:ring-secondary-400 flex w-full items-center gap-1.5 rounded-sm text-left outline-none focus-visible:ring-2"
      >
        <span className="text-button-sm flex h-[22px] w-[55px] shrink-0 items-center justify-center rounded-full border-[0.5px] border-white font-medium text-white">
          PDF P.{String(section.page).padStart(2, '0')}
        </span>
        {/* 폭이 모자라면 시간부터 버린다. 제목이 먼저 잘리면 무슨 구간인지 알 수 없는데,
            시간은 펼치면 세그먼트마다 다시 나오므로 여기서 빠져도 잃는 게 없다. */}
        <span className="flex shrink-0 items-center gap-1.5 @max-[340px]:hidden">
          <Icon name="time" size={17} className="text-gray-400" />
          <span className="text-body-sm font-medium text-gray-400 tabular-nums">
            {formatPlayTime(section.startSec)} –{' '}
            {formatPlayTime(section.endSec)}
          </span>
        </span>
        {/* 구간 소제목 — 시안에서 유일하게 연두로 강조되는 부분.
            남는 폭을 이쪽이 가져가고, 줄어들 때도 마지막까지 버틴다. */}
        <span className="text-primary-200 text-body-sm min-w-0 flex-1 truncate font-medium">
          • {section.title}
        </span>
        <Icon
          name={open ? 'arrow-up' : 'arrow-down'}
          size={20}
          className="shrink-0 text-gray-300"
        />
      </button>

      {open && (
        <ul id={panelId} className="mt-[18px] flex flex-col gap-[18px]">
          {section.segments.map((segment) => (
            <li
              key={segment.atSec}
              className="bg-primary-200 text-label flex gap-1.5 rounded-sm p-[9px] text-gray-950"
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
