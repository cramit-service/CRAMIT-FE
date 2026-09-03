'use client';
// src/features/study/components/viewer/SummaryTab.tsx
import { useEffect, useRef, useState } from 'react';
import {
  useLectureSummary,
  useUpdateLectureSummary,
} from '@/features/study/hooks/useLectureSummary';
import { PencilIcon } from '@/features/study/components/icons';
import {
  ArrowUpIcon,
  CloudDownloadIcon,
} from '@/features/study/components/viewer/icons';
import { MarkdownContent } from '@/features/study/components/viewer/MarkdownContent';
import { SummaryToolbarButton } from '@/features/study/components/viewer/SummaryToolbarButton';
import { VIEWER_PANEL } from '@/features/study/components/viewer/panel';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';

// PDF 탭·placeholder와 같은 패널 높이. 탭을 바꿔도 화면이 출렁이지 않게 맞춘다.
const PANEL = cn(VIEWER_PANEL, 'flex flex-col');

// AI 강의 요약 탭. 조회(Markdown 렌더) ↔ 편집(textarea) 두 모드를 오간다.
// 편집 중 내용이 원본과 달라지면 "수정취소"가 "수정완료"로 바뀐다 (Figma 3상태).
export function SummaryTab({ chapterId }: { chapterId: string }) {
  const summaryQuery = useLectureSummary(chapterId);
  const updateMutation = useUpdateLectureSummary(chapterId);

  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [draft, setDraft] = useState('');
  // 복사·다운로드 결과를 알리는 짧은 안내문 (2초 뒤 사라짐)
  const [notice, setNotice] = useState<string | null>(null);

  // 조회는 div, 편집은 textarea가 각각 스크롤한다. "맨 위로"는 현재 보이는 쪽을 올린다.
  const viewRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 2000);
    return () => clearTimeout(timer);
  }, [notice]);

  const summary = summaryQuery.data;
  const markdown = summary?.markdown ?? '';
  // 원본과 달라졌는지 — 버튼이 "수정취소"인지 "수정완료"인지를 가르는 기준
  const isDirty = mode === 'edit' && draft !== markdown;

  const handleCopy = async () => {
    // 보안 컨텍스트(https/localhost)가 아니면 clipboard API 자체가 없다.
    if (!navigator.clipboard) {
      setNotice('이 브라우저에서는 복사할 수 없습니다');
      return;
    }
    try {
      await navigator.clipboard.writeText(mode === 'edit' ? draft : markdown);
      setNotice('Markdown을 복사했습니다');
    } catch {
      setNotice('복사에 실패했습니다');
    }
  };

  const handleScrollTop = () => {
    const target = mode === 'edit' ? editRef.current : viewRef.current;
    target?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = () => {
    updateMutation.mutate(draft, {
      onSuccess: () => setMode('view'),
      // 실패를 알리지 않으면 저장된 줄 알고 화면을 떠나게 된다
      onError: () => setNotice('저장에 실패했습니다. 다시 시도해 주세요'),
    });
  };

  // 요약 생성이 아직 진행 중인 경우 (빈 요약과 구분해서 안내한다)
  if (summaryQuery.isProcessing) {
    return (
      <section className={cn(PANEL, 'items-center justify-center')}>
        <p className="text-label text-gray-400">
          AI가 요약을 생성하고 있습니다. 완료되면 자동으로 표시됩니다.
        </p>
      </section>
    );
  }

  if (summaryQuery.isPending) {
    return (
      <section className={cn(PANEL, 'items-center justify-center')}>
        <p className="text-label text-gray-500">
          요약을 불러오는 중…
        </p>
      </section>
    );
  }

  if (summaryQuery.isError || !summary) {
    return (
      <section className={cn(PANEL, 'items-center justify-center gap-4')}>
        <p className="text-label text-gray-400">
          요약을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => summaryQuery.refetch()}
        >
          다시 시도
        </Button>
      </section>
    );
  }

  return (
    <section className={cn(PANEL, 'px-8 pt-5 pb-8')}>
      {/* 상단 바: 좌측 MD 배지 + 파일명, 우측 상태별 버튼.
          이분할 화면에선 패널이 절반 이하로 좁아진다. 버튼을 안 접으면 툴바가 패널을
          넘치고 그대로 문서 폭까지 밀어내 페이지에 가로 스크롤이 생긴다. */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-[22px] shrink-0 items-center justify-center rounded-full border-[0.5px] border-white px-1.5 text-[12px] leading-[22px] font-medium text-white">
            MD
          </span>
          <p className="truncate text-label font-medium text-white">
            {summary.fileName}
          </p>
          <p
            aria-live="polite"
            className="shrink-0 text-[12px] leading-[22px] text-gray-400"
          >
            {notice}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <SummaryToolbarButton tone="ghost" onClick={handleCopy}>
            Markdown 복사하기
          </SummaryToolbarButton>

          {mode === 'view' ? (
            <>
              <SummaryToolbarButton
                tone="gradient"
                // TODO(백엔드/라이브러리): 실제 PDF 생성이 필요해 아직 동작하지 않는다.
                onClick={() => setNotice('PDF 다운로드는 준비 중입니다')}
              >
                PDF로 다운로드
                <CloudDownloadIcon className="h-[11px] w-[17px]" />
              </SummaryToolbarButton>
              <SummaryToolbarButton
                tone="point"
                onClick={() => {
                  setDraft(markdown);
                  setMode('edit');
                }}
              >
                수정하기
                <PencilIcon className="size-[15px]" />
              </SummaryToolbarButton>
            </>
          ) : /* Figma 대조 결과: 변경이 생기면 "수정취소"가 사라지고 "수정완료"로 '교체'된다
                 (두 버튼이 함께 있는 시안은 없음). 그래서 한 번 고치면 되돌릴 버튼이 없는데,
                 시안 그대로 두었다. 취소 경로가 필요하면 디자인 확인 후 추가한다. */
          isDirty ? (
            <SummaryToolbarButton
              tone="point"
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? '저장 중…' : '수정완료'}
            </SummaryToolbarButton>
          ) : (
            <SummaryToolbarButton tone="muted" onClick={() => setMode('view')}>
              수정취소
            </SummaryToolbarButton>
          )}
        </div>
      </div>

      {/* 흰 영역: 조회 시 Markdown 렌더, 편집 시 원문 textarea */}
      <div className="relative mt-5 min-h-0 flex-1 rounded-md bg-white">
        {mode === 'view' ? (
          <div ref={viewRef} className="h-full overflow-y-auto px-8 py-7">
            {markdown ? (
              <MarkdownContent markdown={markdown} />
            ) : (
              // 생성 중(PROCESSING)은 위에서 따로 걸러내므로 여기는 '생성됐지만 비어 있음'이다
              <p className="text-label text-gray-500">
                아직 생성된 요약이 없습니다.
              </p>
            )}
          </div>
        ) : (
          <textarea
            ref={editRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            // 저장 요청 뒤 입력한 내용은 성공과 함께 view로 넘어가며 조용히 사라진다
            readOnly={updateMutation.isPending}
            aria-busy={updateMutation.isPending}
            spellCheck={false}
            aria-label="요약 Markdown 원문 편집"
            // 기본 outline은 지우되 키보드 포커스는 링으로 남긴다 (마우스 클릭 시엔 안 보인다)
            className="focus-visible:ring-secondary-400 h-full w-full resize-none rounded-md px-8 py-7 font-mono text-[13px] leading-[22px] text-gray-800 outline-none focus-visible:ring-2 focus-visible:ring-inset"
          />
        )}

        {/* 맨 위로 (Figma: 흰 영역 우하단 원형 버튼) */}
        <button
          type="button"
          onClick={handleScrollTop}
          aria-label="맨 위로"
          className="absolute right-[22px] bottom-[22px] flex size-9 items-center justify-center rounded-full border-2 border-gray-950 bg-white text-gray-950 transition-colors hover:bg-gray-200"
        >
          <ArrowUpIcon className="h-[17px] w-[14px]" />
        </button>
      </div>
    </section>
  );
}
