'use client';
// src/features/study/components/ProjectHeader.tsx
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LectureFormModal } from '@/features/project/components/LectureFormModal';
import { getDday } from '@/features/study/lib/format';
import { DdayBadge } from '@/features/exam/components/DdayBadge';
import type { ProjectDetail } from '@/shared/types/api';
import { IconButton } from '@/shared/ui/IconButton';

// 주차 목록 상단 헤더: 강의명 + 연필, 그 아래 교수명·강의 수·D-day.
// 새 주차 업로드는 헤더가 아니라 목록 바로 위에 있다(ChapterDetailScreen).
export function ProjectHeader({ project }: { project: ProjectDetail }) {
  const router = useRouter();
  const dday = getDday(project.examName, project.examDate);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <header className="flex flex-col gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <h1 className="text-heading-md min-w-0 truncate font-semibold text-gray-800">
          {project.title}
        </h1>
        {/* 라벨 없이 제목 옆에 서는 연필. 글자를 안 가진 컨트롤이라 이름은 aria-label이
            준다(§4가 IconButton의 계약으로 못 박은 것). shrink-0은 감싼 span이 갖는다 —
            IconButton은 className을 받지 않는다. */}
        <span className="shrink-0">
          <IconButton
            name="edit"
            aria-label={`${project.title} 수정`}
            glyph={20}
            onClick={() => setEditOpen(true)}
          />
        </span>
      </div>

      {/* §4: 값이 유한한 집합에서 올 때만 뱃지다. 교수명은 자유 텍스트, 강의 수는
          숫자라 알약을 둘러도 눈만 끌고 아무 말도 안 한다 — 강의 카드와 같은 규칙이다.
          집합인 건 시험까지 남은 날 하나뿐이고 §2가 색을 정해 뒀다. */}
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-label text-gray-500">
          {`${project.professor} 교수님 · 강의 ${project.chapterCount}개`}
        </p>
        {dday && <DdayBadge days={dday.days} />}
      </div>

      {editOpen && (
        <LectureFormModal
          project={project}
          onClose={() => setEditOpen(false)}
          // 지운 강의의 화면에 남아 있으면 조회가 실패한 빈 페이지가 된다.
          // replace라 뒤로 가기가 없어진 강의로 돌아오지 않는다.
          onDeleted={() => router.replace('/projects')}
        />
      )}
    </header>
  );
}
