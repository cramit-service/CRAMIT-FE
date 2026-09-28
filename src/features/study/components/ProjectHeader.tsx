'use client';
// src/features/study/components/ProjectHeader.tsx
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LectureFormModal } from '@/features/project/components/LectureFormModal';
import { getDday } from '@/features/study/lib/format';
import { DdayBadge } from '@/features/exam/components/DdayBadge';
import type { ProjectDetail } from '@/shared/types/api';
import { Button } from '@/shared/ui/Button';
import { IconButton } from '@/shared/ui/IconButton';
import { LearningProgress } from './LearningProgress';

// 주차 목록 상단 헤더: 강의명 + 연필, 그 아래 한 줄에 교수명·강의 수·D-day와
// 학습 진행률·새 주차 업로드.
export function ProjectHeader({
  project,
  percent,
}: {
  project: ProjectDetail;
  percent: number;
}) {
  const router = useRouter();
  const dday = getDday(project.examName, project.examDate);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <header className="flex flex-col gap-6">
      {/* 타이틀 — 제목 줄과 그 아래 회색 세부. 네 작업 화면이 같은 뼈대를 쓴다. */}
      <div className="flex flex-col gap-2">
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
            집합인 건 시험까지 남은 날 하나뿐이라, 그것만 아래 컨트롤 줄에 남는다. */}
        <p className="text-label text-gray-500">
          {`${project.professor} 교수님 · 강의 ${project.chapterCount}개`}
        </p>
      </div>

      {/* 컨트롤 줄. 왼쪽은 남은 날(재는 것), 오른쪽은 진행률과 새 주차(재는 것과 누르는 것).
          items-end — 배지·진행바·버튼의 밑변이 같은 선에 온다.
          좁아지면 오른쪽 묶음이 통째로 아래 줄로 내려가고, ml-auto 덕에 그때도 오른쪽에 붙는다.
          D-day가 왼쪽에 남는 이유는 오른쪽이 누르는 것들의 자리라서다. */}
      <div className="flex flex-wrap items-end gap-4">
        {dday && <DdayBadge days={dday.days} />}

        <div className="ml-auto flex items-end gap-4">
          <div className="w-full max-w-[280px] min-w-[160px]">
            <LearningProgress percent={percent} />
          </div>
          {/* 모달을 띄우지 않고 학습 화면 자리로 바로 들어간다 — 수업을 들으면서
              쓰는 동선이라 모달에 갇히지 않는 게 중요하다(#107).
              목적지가 있으므로 버튼이 아니라 링크다(§4). Button이 href를 받으면 <a>를
              내므로 생김새가 다른 버튼과 한 부품에서 나온다. */}
          <Button href={`/projects/${project.projectId}/chapters/new`}>
            새 주차 업로드
          </Button>
        </div>
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
