'use client';
// src/features/study/components/viewer/ScriptTab.tsx
import { useState } from 'react';
import { useLectureScript } from '@/features/study/hooks/useLectureScript';
import { formatPlayTime } from '@/features/study/lib/format';
import { ScriptSectionItem } from '@/features/study/components/viewer/ScriptSectionItem';
import { VIEWER_PANEL } from '@/features/study/components/viewer/panel';
import { cn } from '@/shared/lib/cn';
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
        <p className="text-[14px] leading-[22px] text-gray-400">
          녹음을 텍스트로 변환하고 있습니다. 완료되면 자동으로 표시됩니다.
        </p>
      </section>
    );
  }

  if (scriptQuery.isPending) {
    return (
      <section className={cn(PANEL, 'items-center justify-center')}>
        <p className="text-[14px] leading-[22px] text-gray-500">
          원문 스크립트를 불러오는 중…
        </p>
      </section>
    );
  }

  if (scriptQuery.isError || !scriptQuery.data) {
    return (
      <section className={cn(PANEL, 'items-center justify-center gap-4')}>
        <p className="text-[14px] leading-[22px] text-gray-400">
          원문 스크립트를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
        {/* 재시도 중에 버튼이 그대로면 눌린 줄 모르고 계속 누르게 된다 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => scriptQuery.refetch()}
          disabled={scriptQuery.isFetching}
        >
          {scriptQuery.isFetching ? '다시 시도 중…' : '다시 시도'}
        </Button>
      </section>
    );
  }

  const { sections } = scriptQuery.data;

  return (
    <section className={cn(PANEL, 'px-8 pt-5')}>
      {/* 상단: 안내문 + 재생 위치 (재생 컨트롤은 PDF 탭에만 둔다) */}
      <div className="flex shrink-0 items-start justify-between gap-4">
        <p className="text-[14px] leading-[22px] font-medium tracking-[-0.28px] text-white">
          녹음본을 텍스트화해서 PPT 페이지별로 정리했습니다. 녹음본 재생은 ‘PDF
          강의 자료’를 이용해 주세요.
        </p>
        <div className="text-primary-400 flex shrink-0 items-center gap-1.5">
          <Icon name="time" size={17} />
          <p className="text-[14px] leading-[22px] font-medium tracking-[-0.28px] tabular-nums">
            {formatPlayTime(currentTime)} / {formatPlayTime(duration)}
          </p>
        </div>
      </div>

      {sections.length === 0 ? (
        <p className="flex flex-1 items-center justify-center text-[14px] leading-[22px] text-gray-500">
          아직 생성된 스크립트가 없습니다.
        </p>
      ) : (
        // 목록은 패널 안에서만 스크롤한다. 아래 끝은 시안대로 배경색으로 흐려지게 덮는다.
        <div className="relative mt-6 min-h-0 flex-1">
          {/* 아래 여백은 페이드 높이와 같게 준다 — 끝까지 내렸을 때 마지막 구간이
              페이드에 덮여 흐려지지 않도록 밀어 올린다 */}
          <ul className="flex h-full [scrollbar-width:none] flex-col gap-7 overflow-y-auto overscroll-contain pb-[73px] [&::-webkit-scrollbar]:hidden">
            {sections.map((section) => (
              <ScriptSectionItem
                key={section.page}
                section={section}
                open={openPages.includes(section.page)}
                onToggle={() => toggle(section.page)}
              />
            ))}
          </ul>
          {/* 스크롤이 남았음을 알리는 하단 페이드. 클릭을 막지 않도록 pointer-events 해제 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[73px] bg-linear-to-b from-transparent to-gray-900 to-55%" />
        </div>
      )}
    </section>
  );
}
