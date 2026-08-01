'use client';
// src/features/study/components/viewer/PdfMaterialTab.tsx
import { useState } from 'react';
import type { MockAudio } from '@/features/study/hooks/useMockAudio';
import { VIEWER_PANEL } from './panel';
import { AudioPlayer } from './AudioPlayer';
import {
  LIST_DEFAULT_WIDTH,
  LIST_MAX_WIDTH,
  LIST_MIN_WIDTH,
  PageList,
} from './PageList';
import { Resizer } from './Resizer';
import { PdfPagePreview } from './PdfPlaceholder';
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
  const [currentPage, setCurrentPage] = useState(1);
  // 가운데 핸들을 좌우로 끌면 좌측 목록이 줄었다 늘었다 한다.
  // 좁아지면 썸네일 대신 페이지 번호만 보이는 형태로 바뀐다 (Figma 두 시안).
  const [listWidth, setListWidth] = useState(LIST_DEFAULT_WIDTH);

  // 페이지가 없는 자료는 헤더에 "1/0"이 뜨고 목록도 비어버린다.
  // 훅을 모두 호출한 뒤 빈 상태 안내로 갈음한다.
  if (material.pdfPageCount < 1) {
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
        pageCount={material.pdfPageCount}
        isPlaying={audio.isPlaying}
        onTogglePlay={audio.toggle}
        currentTime={audio.currentTime}
        duration={material.audioDuration}
        onSeek={audio.seek}
      />

      <div className="flex min-h-0 flex-1 px-8 pb-5">
        <PageList
          pageCount={material.pdfPageCount}
          currentPage={currentPage}
          onSelect={setCurrentPage}
          width={listWidth}
        />
        <Resizer
          label="페이지 목록 너비 조절"
          value={listWidth}
          min={LIST_MIN_WIDTH}
          max={LIST_MAX_WIDTH}
          onResize={setListWidth}
          divider
        />
        <PdfPagePreview page={currentPage} />
      </div>
    </section>
  );
}
