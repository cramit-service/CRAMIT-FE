'use client';
// src/features/study/components/viewer/ScriptSectionItem.tsx
import { formatPlayTime } from '@/features/study/lib/format';
import { Card } from '@/shared/ui/Card';
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
    // 이 줄은 펼침이다. 머리글 전체가 눌리므로 Card가 button으로 그린다 (§4).
    <li className="@container">
      <Card
        dense
        press="in-place"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="flex items-center gap-1.5">
          <span className="text-label flex shrink-0 items-center justify-center rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
            PDF P.{String(section.page).padStart(2, '0')}
          </span>
          {/* 폭이 모자라면 시간부터 버린다. 제목이 먼저 잘리면 무슨 구간인지 알 수 없는데,
            시간은 펼치면 세그먼트마다 다시 나오므로 여기서 빠져도 잃는 게 없다. */}
          <span className="flex shrink-0 items-center gap-1.5 @max-[340px]:hidden">
            <span className="text-gray-400">
              <Icon name="time" size={16} />
            </span>
            <span className="text-body-sm font-medium text-gray-500 tabular-nums">
              {formatPlayTime(section.startSec)} –{' '}
              {formatPlayTime(section.endSec)}
            </span>
          </span>
          {/* 구간 소제목. 연두 글자는 §2가 금지한다 — 강조는 굵기와 잉크 단계가 맡는다.
              남는 폭을 이쪽이 가져가고, 줄어들 때도 마지막까지 버틴다. */}
          <span className="text-body-sm min-w-0 flex-1 truncate font-medium text-gray-800">
            • {section.title}
          </span>
          <span className="shrink-0 text-gray-400">
            <Icon name={open ? 'arrow-up' : 'arrow-down'} size={16} />
          </span>
        </span>
      </Card>

      {/* 발화는 읽는 글이다. 줄마다 채움을 깔면 예순 줄이 예순 개의 상자가 되고,
          §2는 연한 연두를 "넓은 면의 연두 — 학습 하이라이트"에 이미 배정해 뒀다.
          나중에 진짜 하이라이트가 붙으면 자리가 겹친다. 구분은 글자 색이 맡는다. */}
      {open && (
        <ul id={panelId} className="mt-1 mb-2 flex flex-col gap-1 pl-3">
          {section.segments.map((segment) => (
            <li key={segment.atSec} className="text-label flex gap-2">
              <span className="shrink-0 text-gray-500 tabular-nums">
                {formatPlayTime(segment.atSec)}
              </span>
              <span className="min-w-0 flex-1 text-gray-700">
                {segment.text}
              </span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
