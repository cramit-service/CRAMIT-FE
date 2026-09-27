'use client';
// src/features/study/components/ChapterDetailScreen.tsx
import { useState, type ReactNode } from 'react';
import { useProjectDetail } from '@/features/study/hooks/useProjectDetail';
import { useChapters } from '@/features/study/hooks/useChapters';
import { ProjectHeader } from './ProjectHeader';
import { LearningProgress } from './LearningProgress';
import { ChapterCard } from './ChapterCard';
import { Pagination } from './Pagination';

// 콘텐츠 폭은 홈·강의 목록과 같은 1512 (CLAUDE.md 4-4). 바깥 여백은 남는 공간이 갖는다.
// 로딩·에러 문구도 같은 폭에 둔다 — 전체 폭이면 데이터가 도착하는 순간 콘텐츠가 가로로 튄다.
function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 pt-12 pb-12 md:px-8 lg:px-0">
      <div className="lg:content-col mx-auto w-full">{children}</div>
    </div>
  );
}

const PAGE_SIZE = 4;

// 챕터 상세(단계별 학습) 화면. page.tsx는 이 컴포넌트를 조립만 한다.
export function ChapterDetailScreen({ projectId }: { projectId: string }) {
  const [page, setPage] = useState(1);
  // 꾹 눌러 연 "주차 정보 수정하기" 대상. 닫을 때 통째로 언마운트해 입력값이 남지 않게 한다.
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
    return (
      <PageShell>
        <p className="text-gray-500">불러오는 중…</p>
      </PageShell>
    );
  }

  // 조회에 실패하면 로딩 문구가 계속 남지 않게 에러 상태를 따로 보여준다.
  if (projectError || chaptersError || !project || !chapters) {
    return (
      <PageShell>
        <p className="text-gray-500">
          강의 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      </PageShell>
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
  // page는 화면이 살아있는 동안 유지되므로 챕터가 지워지거나 PAGE_SIZE가 바뀌어
  // totalPages가 줄면 범위를 벗어난다. 위아래 모두 잘라 slice가 빈 배열이 되지 않게 한다.
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * PAGE_SIZE;
  const visible = ordered.slice(start, start + PAGE_SIZE);

  return (
    <PageShell>
      <ProjectHeader project={project} />

      <section className="mt-7">
        {/* 섹션 제목 + 우측 학습 진행률 바 */}
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-body-md font-semibold text-gray-950">
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
            <p className="text-label rounded-md bg-white px-6 py-12 text-center text-gray-500">
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
    </PageShell>
  );
}
