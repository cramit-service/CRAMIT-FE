'use client';
// src/features/study/components/viewer/SummaryTab.tsx
import { useEffect, useRef, useState } from 'react';
import {
  useLectureSummary,
  useUpdateLectureSummary,
} from '@/features/study/hooks/useLectureSummary';
import { MarkdownContent } from '@/features/study/components/viewer/MarkdownContent';
import { VIEWER_PANEL } from '@/features/study/components/viewer/panel';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { IconButton } from '@/shared/ui/IconButton';
import { ScrollArea } from '@/shared/ui/ScrollArea';
import { Textarea } from '@/shared/ui/Textarea';

// PDF 탭·placeholder와 같은 패널 높이. 탭을 바꿔도 화면이 출렁이지 않게 맞춘다.
const PANEL = cn(VIEWER_PANEL, 'flex flex-col');

// AI 강의 요약 탭. 조회(Markdown 렌더) ↔ 편집(textarea) 두 모드를 오간다.
// 편집 모드에서는 취소·수정하기가 나란히 서고, 고친 것이 없으면 수정하기가 잠긴다.
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
  // 원본과 달라졌는지 — 저장 버튼이 눌리는지를 가르는 기준
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
        <p className="text-label text-gray-500">요약을 불러오는 중…</p>
      </section>
    );
  }

  if (summaryQuery.isError || !summary) {
    return (
      <section className={cn(PANEL, 'items-center justify-center gap-4')}>
        <p className="text-label text-gray-400">
          요약을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
        <Button rank="secondary" onClick={() => summaryQuery.refetch()}>
          다시 시도
        </Button>
      </section>
    );
  }

  return (
    <section className={cn(PANEL, 'px-6 pt-5 pb-8')}>
      {/* 상단 바: 좌측 MD 배지 + 파일명, 우측 상태별 버튼.
          이분할 화면에선 패널이 절반 이하로 좁아진다. 버튼을 안 접으면 툴바가 패널을
          넘치고 그대로 문서 폭까지 밀어내 페이지에 가로 스크롤이 생긴다. */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-body-sm flex h-[22px] shrink-0 items-center justify-center rounded-full border-[0.5px] border-gray-300 px-1.5 font-medium text-gray-700">
            MD
          </span>
          <p className="text-label truncate font-medium text-gray-700">
            {summary.fileName}
          </p>
          <p aria-live="polite" className="text-body-sm shrink-0 text-gray-400">
            {notice}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Button rank="secondary" size="sm" onClick={handleCopy}>
            Markdown 복사하기
          </Button>

          {mode === 'view' ? (
            <>
              <Button
                rank="secondary"
                size="sm"
                // TODO(백엔드/라이브러리): 실제 PDF 생성이 필요해 아직 동작하지 않는다.
                onClick={() => setNotice('PDF 다운로드는 준비 중입니다')}
              >
                PDF로 다운로드
              </Button>
              {/* 글자가 아니라 글리프다. §6이 확정 버튼을 전부 `~하기`로 모으면서
                  «편집기를 여는 것»과 «고친 것을 저장하는 것»이 같은 자리에서 같은
                  말을 하게 됐다. 여는 쪽을 아이콘으로 내리면 겹침이 사라지고,
                  보기 모드에는 확정할 것이 없으니 연두도 없어진다 — 이 줄은 셋 다
                  도구고, 진짜 확정은 편집 모드의 `수정하기` 하나뿐이다.
                  glyph 16은 size-8이라 옆 size="sm"(h-8)과 높이가 맞는다. */}
              <IconButton
                name="edit"
                glyph={16}
                rank="secondary"
                aria-label="요약 수정하기"
                onClick={() => {
                  setDraft(markdown);
                  setMode('edit');
                }}
              />
            </>
          ) : (
            /* 시안은 셋을 한 자리에서 갈아 끼웠다(수정하기 → 수정취소 → 수정완료).
               그래서 한 글자라도 고치면 되돌릴 버튼이 사라졌다. 둘을 나란히 세워
               나가는 길이 늘 남아 있게 한다 — FormModal 푸터와 같은 취소·확정 순이다. */
            <>
              <Button
                rank="secondary"
                size="sm"
                disabled={updateMutation.isPending}
                onClick={() => setMode('view')}
              >
                취소
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!isDirty || updateMutation.isPending}
              >
                {updateMutation.isPending ? '수정 중…' : '수정하기'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 조회는 Markdown 렌더, 편집은 원문 textarea. 바탕은 감싼 패널의 surface를
          그대로 쓴다 — bg-white가 있었지만 토큰에서 흰색이 지워져 아무 일도 안 했다. */}
      <div className="relative mt-5 flex min-h-0 flex-1 flex-col rounded-md">
        {mode === 'view' ? (
          <ScrollArea ref={viewRef}>
            <div className="px-6 py-7">
              {markdown ? (
                <MarkdownContent markdown={markdown} />
              ) : (
                // 생성 중(PROCESSING)은 위에서 따로 걸러내므로 여기는 '생성됐지만 비어 있음'이다
                <p className="text-label text-gray-500">
                  아직 생성된 요약이 없습니다.
                </p>
              )}
            </div>
          </ScrollArea>
        ) : (
          <Textarea
            ref={editRef}
            grow
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            // 저장 요청 뒤 입력한 내용은 성공과 함께 view로 넘어가며 조용히 사라진다
            readOnly={updateMutation.isPending}
            aria-busy={updateMutation.isPending}
            spellCheck={false}
            aria-label="요약 Markdown 원문 편집"
          />
        )}

        {/* 맨 위로. 혼자 서 있어 옆에 잴 글자가 없다 — §4가 그 경우를 글리프 24로 정한다. */}
        <div className="absolute right-6 bottom-6">
          <IconButton
            name="arrow-up"
            glyph={24}
            aria-label="맨 위로"
            onClick={handleScrollTop}
          />
        </div>
      </div>
    </section>
  );
}
