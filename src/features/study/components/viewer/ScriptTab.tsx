'use client';
// src/features/study/components/viewer/ScriptTab.tsx
import { useState } from 'react';
import { useLectureScript } from '@/features/study/hooks/useLectureScript';
import { formatPlayTime } from '@/features/study/lib/format';
import { ScriptSectionItem } from '@/features/study/components/viewer/ScriptSectionItem';
import { VIEWER_PANEL } from '@/features/study/components/viewer/panel';
import { cn } from '@/shared/lib/cn';
import { ScrollArea } from '@/shared/ui/ScrollArea';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';

const PANEL = cn(VIEWER_PANEL, 'flex flex-col');

interface ScriptTabProps {
  chapterId: string;
  // 재생 상태는 PDF 탭이 쥐고 있다. 여기선 위치를 보여주기만 한다(시안 안내문 그대로).
  currentTime: number;
  duration: number;
}

// 원문 스크립트 탭. 녹음 STT를 PDF 페이지 단위 구간으로 묶어 아코디언으로 보여준다.
export function ScriptTab({
  chapterId,
  currentTime,
  duration,
}: ScriptTabProps) {
  const scriptQuery = useLectureScript(chapterId);
  // 펼친 구간의 페이지 번호. 시안처럼 여러 구간을 동시에 펼칠 수 있다.
  const [openPages, setOpenPages] = useState<number[]>([]);

  const toggle = (page: number) =>
    setOpenPages((prev) =>
      prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page],
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

  if (scriptQuery.isPending) {
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
        <Button rank="secondary" onClick={() => scriptQuery.refetch()}>
          다시 시도
        </Button>
      </section>
    );
  }

  const { sections } = scriptQuery.data;

  return (
    <section className={cn(PANEL, 'px-6 pt-5')}>
      {/* 상단: 안내문 + 재생 위치 (재생 컨트롤은 PDF 탭에만 둔다) */}
      <div className="flex shrink-0 items-start justify-between gap-4">
        <p className="text-label font-medium text-gray-700">
          녹음본을 텍스트화해서 PPT 페이지별로 정리했어요. 녹음본 재생은 ‘PDF
          강의 자료’를 이용해 주세요.
        </p>
        <div className="flex shrink-0 items-center gap-1.5 text-gray-500">
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
            <ul className="flex flex-col gap-1 pr-3">
              {sections.map((section) => (
                <ScriptSectionItem
                  key={section.page}
                  section={section}
                  open={openPages.includes(section.page)}
                  onToggle={() => toggle(section.page)}
                />
              ))}
            </ul>
          </ScrollArea>
        </div>
      )}
    </section>
  );
}
