'use client';
// src/features/study/components/ChapterDetailScreen.tsx
import type { ReactNode } from 'react';
import { useProjectDetail } from '@/features/study/hooks/useProjectDetail';
import { useChapters } from '@/features/study/hooks/useChapters';
import { ProjectHeader } from './ProjectHeader';
import { ChapterCard } from './ChapterCard';

// 콘텐츠 폭은 홈·강의 목록과 같은 1512 (CLAUDE.md 4-4). 바깥 여백은 남는 공간이 갖는다.
// 로딩·에러 문구도 같은 폭에 둔다 — 전체 폭이면 데이터가 도착하는 순간 콘텐츠가 가로로 튄다.
function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 pt-12 pb-12 md:px-8 lg:px-0">
      <div className="lg:content-col mx-auto w-full">{children}</div>
    </div>
  );
}

// 주차 목록 화면. page.tsx는 이 컴포넌트를 조립만 한다.
export function ChapterDetailScreen({ projectId }: { projectId: string }) {
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

  return (
    <PageShell>
      <ProjectHeader project={project} percent={progress} />

      {/* 섹션 제목("단계별 학습")을 뺐다 — 상태 셋이 회독 수로 바뀌면서 밟을 단계가
          없어졌고, 이 화면에 목록이 하나뿐이라 그건 섹션 이름이 아니라 화면 이름이었다.
          화면 이름은 위 ProjectHeader의 강의명이 이미 맡고 있다. */}
      <section className="mt-8 flex flex-col gap-2">
        {ordered.length === 0 ? (
          // 아직 주차를 올리지 않은 프로젝트는 빈 영역 대신 안내를 보여준다.
          <p className="text-body bg-surface rounded-lg px-6 py-12 text-center text-gray-500">
            아직 업로드된 강의가 없어요. 새 주차를 업로드해 학습을 시작해보세요.
          </p>
        ) : (
          ordered.map((chapter) => (
            <ChapterCard key={chapter.chapterId} chapter={chapter} />
          ))
        )}
      </section>
    </PageShell>
  );
}
