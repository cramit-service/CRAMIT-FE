'use client';
// src/features/study/components/viewer/ScriptSectionItem.tsx
import { formatPlayTime } from '@/features/study/lib/format';
import { Card } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';
import { cn } from '@/shared/lib/cn';
import type { ScriptSection } from '@/shared/types/api';

interface ScriptSectionItemProps {
  section: ScriptSection;
  open: boolean;
  onToggle: () => void;
  playingAtSec: number | null;
  onPlayFrom: ((seconds: number) => void) | null; // 재생할 녹음이 없으면 null
}

// 원문 스크립트의 한 구간(= PDF 한 페이지). 머리글을 누르면 발화 목록이 펼쳐진다.
export function ScriptSectionItem({
  section,
  open,
  onToggle,
  playingAtSec,
  onPlayFrom,
}: ScriptSectionItemProps) {
  const panelId = `script-section-${section.id}`;

  return (
    // 이분할에서 패널이 좁아지면 이 행이 먼저 무너진다. 창이 아니라 이 행 자체의
    // 폭을 기준으로 접어야 해서 @container를 건다(미디어 쿼리는 분할 폭을 모른다).
    // 이 줄은 펼침이다. 머리글 전체가 눌리므로 Card가 button으로 그린다 (§4).
    <li className="@container">
      <Card
        dense
        sunken
        press="in-place"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
      >
        {/* 머리글은 고르는 글이 아니다 — 드래그가 걸쳐도 [AI에게 질문] 인용에 섞이지 않게 뺀다. */}
        <span className="flex items-center gap-2 select-none">
          <span className="text-label flex shrink-0 items-center justify-center rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
            PDF P.{String(section.page).padStart(2, '0')}
          </span>
          {/* 폭이 모자라면 시간부터 버린다. 제목이 먼저 잘리면 무슨 구간인지 알 수 없는데,
            시간은 펼치면 세그먼트마다 다시 나오므로 여기서 빠져도 잃는 게 없다. */}
          <span className="flex shrink-0 items-center gap-2 @max-[340px]:hidden">
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
          그래서 평소에는 면 없이 글자 색으로만 구분하고, 재생 중인 한 줄에만 하늘 면을 깐다. */}
      {open && (
        <ul id={panelId} className="mt-1 mb-2 flex flex-col gap-1 pl-3">
          {section.segments.map((segment) => {
            // 재생 중인 문장은 줄 전체에 옅은 하늘 면을 깐다. §2의 sky-pale은 글자를 올리지 않는 면이지만,
            // 하늘 글자(sky-ink)만으로는 재생 중인 줄이 거의 보이지 않아 면을 골랐다. 면만 바꿔 줄 폭은 그대로다.
            const playing = segment.atSec === playingAtSec;
            const play = onPlayFrom && (() => onPlayFrom(segment.atSec));
            return (
              // 문장을 누르면 그 시각부터 재생한다. 드래그로 글을 고른 끝의 클릭은 [AI에게 질문]에 맡긴다.
              <li
                key={segment.atSec}
                aria-current={playing ? 'true' : undefined}
                className={cn(
                  'text-label -mx-1.5 flex gap-2 rounded-md px-1.5',
                  play &&
                    'focus-visible:ring-sky-ink cursor-pointer focus-visible:ring-2 focus-visible:outline-none hover:[&>span:last-child]:text-gray-800',
                  playing && 'bg-sky-pale',
                )}
                {...(play && {
                  role: 'button',
                  tabIndex: 0,
                  'aria-label': `${formatPlayTime(segment.atSec)}부터 재생: ${segment.text}`,
                  // 더블클릭은 재생과 단어 고르기가 함께 일어난다. 다른 STT 서비스도 그렇게 둔다.
                  onClick: () => {
                    if (window.getSelection()?.isCollapsed === false) return;
                    play();
                  },
                  onKeyDown: (e: React.KeyboardEvent) => {
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                    play();
                  },
                })}
              >
                <span className="shrink-0 text-gray-500 tabular-nums select-none">
                  {formatPlayTime(segment.atSec)}
                </span>
                <span
                  className={cn(
                    'min-w-0 flex-1',
                    playing ? 'text-gray-800' : 'text-gray-700',
                  )}
                >
                  {segment.text}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}
