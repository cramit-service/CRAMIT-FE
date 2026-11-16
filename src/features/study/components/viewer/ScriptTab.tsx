'use client';
// src/features/study/components/viewer/ScriptTab.tsx
import { useState } from 'react';
import { useLectureScript } from '@/features/study/hooks/useLectureScript';
import { AskAboutSelection } from '@/features/study/components/viewer/AskAboutSelection';
import { formatPlayTime } from '@/features/study/lib/format';
import { ScriptSectionItem } from '@/features/study/components/viewer/ScriptSectionItem';
import { VIEWER_PANEL } from '@/features/study/components/viewer/panel';
import { cn } from '@/shared/lib/cn';
import { ScrollArea } from '@/shared/ui/ScrollArea';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';

const PANEL = cn(VIEWER_PANEL, 'flex flex-col');

interface ScriptTabProps {
  chapterId: number;
  // 재생 컨트롤은 PDF 탭에만 있다. 여기선 위치를 보여주고, 문장을 누르면 그 시각부터 재생한다.
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onPlayFrom: (seconds: number) => void;
  canPlay: boolean; // 녹음이 없거나 불러오지 못했으면 문장을 눌러도 재생할 것이 없다
}

// 원문 스크립트 탭. 녹음 STT를 PDF 페이지 단위 구간으로 묶어 아코디언으로 보여준다.
export function ScriptTab({
  chapterId,
  currentTime,
  duration,
  isPlaying,
  onPlayFrom,
  canPlay,
}: ScriptTabProps) {
  const scriptQuery = useLectureScript(chapterId);
  // 펼친 구간의 id. 시안처럼 여러 구간을 동시에 펼칠 수 있다.
  const [openIds, setOpenIds] = useState<number[]>([]);

  const toggle = (id: number) =>
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );

  // STT 변환이 아직 안 끝난 경우 (조회 실패와 구분해서 안내한다)
  if (scriptQuery.isProcessing) {
    return (
      <section className={cn(PANEL, 'items-center justify-center')}>
        <p className="text-label text-gray-400">
          녹음을 텍스트로 변환하고 있어요. 완료되면 자동으로 표시돼요.
        </p>
      </section>
    );
  }

  if (
    scriptQuery.processStatus === 'NOT_STARTED' ||
    scriptQuery.processStatus === 'FAILED'
  ) {
    return (
      <section className={cn(PANEL, 'items-center justify-center')}>
        <p className="text-label text-gray-400">
          {scriptQuery.processStatus === 'FAILED'
            ? '녹음을 텍스트로 변환하지 못했어요.'
            : '이 주차에는 녹음이 없어요.'}
        </p>
      </section>
    );
  }

  // 상태 조회가 실패하면 본문 조회가 열리지 않아 isPending에 머문다. 먼저 걸러낸다.
  if (!scriptQuery.statusError && scriptQuery.isPending) {
    return (
      <section className={cn(PANEL, 'items-center justify-center')}>
        <p className="text-label text-gray-500">원문 스크립트를 불러오는 중…</p>
      </section>
    );
  }

  if (scriptQuery.isError || !scriptQuery.data) {
    return (
      <section className={cn(PANEL, 'items-center justify-center gap-4')}>
        <p className="text-label text-gray-400">
          원문 스크립트를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
        <Button rank="secondary" onClick={scriptQuery.retry}>
          다시 시도
        </Button>
      </section>
    );
  }

  const { sections } = scriptQuery.data;
  // 지금 재생 위치의 문장 = 시작 시각이 재생 위치 이하인 마지막 문장. 한 번도 틀지 않았으면 표시하지 않는다.
  const playingAtSec =
    isPlaying || currentTime > 0
      ? sections
          .flatMap((s) => s.segments.map((seg) => seg.atSec))
          .filter((at) => at <= currentTime)
          .reduce<number | null>(
            (max, at) => (max === null || at > max ? at : max),
            null,
          )
      : null;

  return (
    <section className={cn(PANEL, 'px-6 pt-5')}>
      {/* 상단: 안내문 + 재생 위치 (재생 컨트롤은 PDF 탭에만 둔다) */}
      <div className="flex shrink-0 items-start justify-between gap-4">
        <p className="text-label font-medium text-gray-700">
          녹음본을 텍스트화해서 PPT 페이지별로 정리했어요. 문장을 누르면 그
          부분부터 재생되고, 멈춤은 ‘PDF 강의 자료’에서 할 수 있어요.
        </p>
        <div className="flex shrink-0 items-center gap-2 text-gray-500">
          <Icon name="time" size={17} />
          <p className="text-label font-medium tabular-nums">
            {formatPlayTime(currentTime)} / {formatPlayTime(duration)}
          </p>
        </div>
      </div>

      {sections.length === 0 ? (
        <p className="text-label flex flex-1 items-center justify-center text-gray-500">
          아직 생성된 스크립트가 없어요.
        </p>
      ) : (
        // 목록은 패널 안에서만 스크롤한다. 하단 페이드와 막대는 ScrollArea가 갖는다 —
        // 전에는 73px짜리 그라디언트 div를 손으로 얹고 목록에 같은 크기의 아래 여백을 줬다.
        <div className="mt-6 flex min-h-0 flex-1 flex-col">
          <ScrollArea>
            <AskAboutSelection>
              <ul className="flex flex-col gap-1 pr-3">
                {sections.map((section) => (
                  <ScriptSectionItem
                    key={section.id}
                    section={section}
                    open={openIds.includes(section.id)}
                    onToggle={() => toggle(section.id)}
                    playingAtSec={playingAtSec}
                    onPlayFrom={canPlay ? onPlayFrom : null}
                  />
                ))}
              </ul>
            </AskAboutSelection>
          </ScrollArea>
        </div>
      )}
    </section>
  );
}
