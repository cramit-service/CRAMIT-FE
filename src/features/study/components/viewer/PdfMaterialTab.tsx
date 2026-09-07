'use client';
// src/features/study/components/viewer/PdfMaterialTab.tsx
import { useEffect, useState } from 'react';
import type { MockAudio } from '@/features/study/hooks/useMockAudio';
import { toPlayDuration } from '@/features/study/lib/format';
import { VIEWER_PANEL } from '@/features/study/components/viewer/panel';
import { AudioPlayer } from '@/features/study/components/viewer/AudioPlayer';
import {
  LIST_MAX_WIDTH,
  LIST_MIN_WIDTH,
  PageList,
} from '@/features/study/components/viewer/PageList';
import { PageListToggle } from '@/features/study/components/viewer/PageListToggle';
import { PdfPagePreview } from '@/features/study/components/viewer/PdfPlaceholder';
import { usePdfDocument } from '@/features/study/hooks/usePdfDocument';
import { cn } from '@/shared/lib/cn';
import type { LectureMaterial } from '@/shared/types/api';

interface PdfMaterialTabProps {
  material: LectureMaterial;
  // 재생 상태는 화면(StudyViewerScreen)이 쥐고 있다. 탭을 옮겨도 위치가 유지되고
  // 원문 스크립트 탭이 같은 값을 읽어 표시할 수 있다.
  audio: MockAudio;
}

// PDF 강의 자료 탭: 상단 오디오 플레이어 + 좌측 페이지 목록 + 우측 미리보기.
export function PdfMaterialTab({ material, audio }: PdfMaterialTabProps) {
  const { doc, ratio, failed, isLoading } = usePdfDocument(material.pdfUrl);
  const [selectedPage, setSelectedPage] = useState(1);
  // 가운데 버튼으로 좌측 목록을 최소 ↔ 최대로 바꾼다.
  // 좁으면 썸네일 대신 페이지 번호만 보이는 형태가 된다 (Figma 두 시안).
  const [wideList, setWideList] = useState(true);
  const listWidth = wideList ? LIST_MAX_WIDTH : LIST_MIN_WIDTH;

  // 페이지 수는 열어 본 문서가 정답이다. API의 pdfPageCount는 로딩 중 자리를 잡는 용도라,
  // 실제 파일과 어긋나 있으면 목록이 문서보다 길거나 짧아진다.
  const pageCount = doc?.numPages ?? material.pdfPageCount;

  // 자료를 다시 조회해 페이지 수가 줄면 고른 페이지가 범위를 벗어나 "5/3"이 뜬다.
  // useEffect로 상태를 되돌리면 잘못된 값이 한 번 그려진 뒤에 고쳐진다.
  // 상태는 그대로 두고 읽는 시점에 자른다(useMockAudio가 재생 위치를 다루는 방식과 같다).
  const currentPage = Math.min(
    Math.max(1, selectedPage),
    Math.max(1, pageCount),
  );

  // 좌우 방향키로 페이지를 넘긴다. 화면 어디에 포커스가 있어도 되도록 document에서 듣되,
  // 방향키를 자기 것으로 쓰는 곳(글자 입력, 리사이저 role="separator", 슬라이더)은 비켜 준다.
  useEffect(() => {
    if (pageCount < 1) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const active = document.activeElement;
      if (
        active instanceof HTMLElement &&
        active.closest(
          'input, textarea, select, [contenteditable], [role="separator"], [role="slider"]',
        )
      ) {
        return;
      }
      e.preventDefault();
      const step = e.key === 'ArrowRight' ? 1 : -1;
      setSelectedPage((prev) => {
        const base = Math.min(Math.max(1, prev), pageCount);
        return Math.min(Math.max(1, base + step), pageCount);
      });
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [pageCount]);

  // 페이지가 없는 자료는 헤더에 "1/0"이 뜨고 목록도 비어버린다.
  // 훅을 모두 호출한 뒤 빈 상태 안내로 갈음한다.
  if (pageCount < 1) {
    return (
      <section className={cn(VIEWER_PANEL, 'flex items-center justify-center')}>
        <p className="text-gray-500">표시할 PDF 자료가 없습니다.</p>
      </section>
    );
  }

  return (
    // Figma: 어두운 패널(gray-900) 하나에 플레이어와 자료 영역이 함께 들어간다
    <section className={cn(VIEWER_PANEL, 'flex flex-col')}>
      <AudioPlayer
        currentPage={currentPage}
        pageCount={pageCount}
        isPlaying={audio.isPlaying}
        onTogglePlay={audio.toggle}
        currentTime={audio.currentTime}
        duration={toPlayDuration(material.audioDuration)}
        onSeek={audio.seek}
      />

      <div className="flex min-h-0 flex-1 px-8 pb-5">
        <PageList
          doc={doc}
          ratio={ratio}
          pageCount={pageCount}
          currentPage={currentPage}
          onSelect={setSelectedPage}
          width={listWidth}
        />
        <PageListToggle
          wide={wideList}
          onToggle={() => setWideList((v) => !v)}
        />
        <PdfPagePreview
          doc={doc}
          page={currentPage}
          isLoading={isLoading}
          failed={failed}
        />
      </div>
    </section>
  );
}
