'use client';
// src/features/study/components/viewer/PdfMaterialTab.tsx
import { useState } from 'react';
import { useMockAudio } from '../../hooks/useMockAudio';
import { AudioPlayer } from './AudioPlayer';
import {
  LIST_DEFAULT_WIDTH,
  LIST_MAX_WIDTH,
  LIST_MIN_WIDTH,
  PageList,
} from './PageList';
import { ListResizer } from './ListResizer';
import { PdfPagePreview } from './PdfPlaceholder';
import type { LectureMaterial } from '@/shared/types/api';

// PDF 강의 자료 탭: 상단 오디오 플레이어 + 좌측 페이지 목록 + 우측 미리보기.
export function PdfMaterialTab({ material }: { material: LectureMaterial }) {
  const [currentPage, setCurrentPage] = useState(1);
  // 가운데 핸들을 좌우로 끌면 좌측 목록이 줄었다 늘었다 한다.
  // 좁아지면 썸네일 대신 페이지 번호만 보이는 형태로 바뀐다 (Figma 두 시안).
  const [listWidth, setListWidth] = useState(LIST_DEFAULT_WIDTH);
  const { isPlaying, currentTime, toggle, seek } = useMockAudio(
    material.audioDuration,
  );

  return (
    // Figma: 어두운 패널(gray-900) 하나에 플레이어와 자료 영역이 함께 들어간다
    <section className="flex h-[590px] flex-col rounded-md bg-gray-900">
      <AudioPlayer
        currentPage={currentPage}
        pageCount={material.pdfPageCount}
        isPlaying={isPlaying}
        onTogglePlay={toggle}
        currentTime={currentTime}
        duration={material.audioDuration}
        onSeek={seek}
      />

      <div className="flex min-h-0 flex-1 px-8 pb-5">
        <PageList
          pageCount={material.pdfPageCount}
          currentPage={currentPage}
          onSelect={setCurrentPage}
          width={listWidth}
        />
        <ListResizer
          width={listWidth}
          min={LIST_MIN_WIDTH}
          max={LIST_MAX_WIDTH}
          onResize={setListWidth}
        />
        <PdfPagePreview page={currentPage} />
      </div>
    </section>
  );
}
