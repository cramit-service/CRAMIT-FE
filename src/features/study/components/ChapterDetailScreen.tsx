'use client';
// src/features/study/components/ChapterDetailScreen.tsx
import { useState } from 'react';
import { useProjectDetail } from '@/features/study/hooks/useProjectDetail';
import { useChapters } from '@/features/study/hooks/useChapters';
import { ProjectHeader } from './ProjectHeader';
import { LearningProgress } from './LearningProgress';
import { ChapterCard } from './ChapterCard';
import { Pagination } from './Pagination';
import { SharedBoardPlaceholder } from './SharedBoardPlaceholder';

const PAGE_SIZE = 3;

// 챕터 상세(단계별 학습) 화면. page.tsx는 이 컴포넌트를 조립만 한다.
export function ChapterDetailScreen({ projectId }: { projectId: string }) {
  const [page, setPage] = useState(1);
  const {
    data: project,
    isLoading: projectLoading,
    isError: projectError,
  } = useProjectDetail(projectId);
  const {
    data: chapters,
    isLoading: chaptersLoading,
    isError: chaptersError,
  } = useChapters(projectId);

  if (projectLoading || chaptersLoading) {
    return <div className="p-10 text-gray-500">불러오는 중…</div>;
  }

  // 조회에 실패하면 로딩 문구가 계속 남지 않게 에러 상태를 따로 보여준다.
  if (projectError || chaptersError || !project || !chapters) {
    return (
      <div className="p-10 text-gray-500">
        강의 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
      </div>
    );
  }

  // 학습 진행률 = 완료 챕터 / 전체 챕터
  const doneCount = chapters.filter((c) => c.status === 'DONE').length;
  const progress = chapters.length ? (doneCount / chapters.length) * 100 : 0;

  // 최신 챕터가 위로 오도록 번호 내림차순 정렬
  const ordered = [...chapters].sort(
    (a, b) => b.chapterNumber - a.chapterNumber,
  );

  // 클라이언트 페이지네이션 (mock)
  const totalPages = Math.max(1, Math.ceil(ordered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * PAGE_SIZE;
  const visible = ordered.slice(start, start + PAGE_SIZE);

  return (
    // Figma 시안은 1920 기준 절대 px라 실제 화면(사이드바 제외)에선 과하게 커진다.
    // 비례는 그대로 두고 전체를 약 0.72배로 줄여 한 화면에 들어오게 한다.
    <div className="mx-auto w-full max-w-4xl px-8 pt-12 pb-12">
      <ProjectHeader project={project} />

      <section className="mt-7">
        {/* 섹션 제목 + 우측 학습 진행률 바 */}
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-[18px] leading-[28px] font-semibold tracking-[-0.36px] text-gray-950">
            단계별 학습
          </h2>
          <div className="ml-auto w-full max-w-[280px] min-w-[160px] flex-1">
            <LearningProgress percent={progress} />
          </div>
        </div>

        {/* 카드 간 간격 */}
        <div className="flex flex-col gap-2">
          {visible.length === 0 ? (
            // 아직 주차를 올리지 않은 프로젝트는 빈 영역 대신 안내를 보여준다.
            <p className="rounded-md bg-white px-6 py-12 text-center text-[14px] leading-[22px] text-gray-500">
              아직 업로드된 강의가 없어요. 새 주차를 업로드해 학습을
              시작해보세요.
            </p>
          ) : (
            visible.map((chapter) => (
              <ChapterCard key={chapter.chapterId} chapter={chapter} />
            ))
          )}
        </div>

        <div className="mt-5">
          <Pagination
            currentPage={current}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </section>

      {/* 공유 강의일 때만 공유 게시판 자리 노출 (내 강의면 없음) */}
      {project.isShared && <SharedBoardPlaceholder />}
    </div>
  );
}
