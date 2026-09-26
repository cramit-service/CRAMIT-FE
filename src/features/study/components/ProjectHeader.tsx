'use client';
// src/features/study/components/ProjectHeader.tsx
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { LectureFormModal } from '@/features/project/components/LectureFormModal';
import { Tag } from './Tag';
import { getDday } from '@/features/study/lib/format';
import type { ProjectDetail } from '@/shared/types/api';
import { Icon } from '@/shared/ui/Icon';

// 헤더 우측 액션의 골격.
// TODO: 컨트롤 사다리(shared/ui/control.ts)에 맞춰 Button으로 옮길 것 — 지금 이 높이는
// 시안에서 온 값이고 §4의 단계 중 어느 것도 아니다.
const HEADER_ACTION =
  'inline-flex h-11 shrink-0 items-center gap-2 rounded-md px-4 text-label leading-none font-medium transition-colors';

// 챕터 상세 상단 헤더: 과목명/태그 + 수정하기 + 새 주차 업로드를 한 줄로 배치.
export function ProjectHeader({ project }: { project: ProjectDetail }) {
  const dday = getDday(project.examName, project.examDate);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <header className="relative flex flex-wrap items-center gap-x-4 gap-y-3">
      {/* 과목명 + 정보 태그들 */}
      <h1 className="text-heading-sm font-semibold text-gray-950">
        {project.title}
      </h1>
      <Tag tone="dark">{project.professor} 교수님</Tag>
      <Tag tone="outline">강의 {project.chapterCount}개</Tag>
      {dday && <Tag tone={dday.tone}>{dday.label}</Tag>}
      <button
        type="button"
        onClick={() => setEditOpen(true)}
        className="text-button-sm inline-flex items-center gap-1 text-gray-700 transition-colors hover:text-gray-900"
      >
        <Icon name="edit" size={12} />
        수정하기
      </button>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        {/* 모달을 띄우지 않고 학습 화면 자리로 바로 들어간다 — 수업을 들으면서
            쓰는 동선이라 모달에 갇히지 않는 게 중요하다(#107).
            목적지가 있으므로 버튼이 아니라 링크다 (§4). */}
        <Link
          href={`/projects/${project.projectId}/chapters/new`}
          className={cn(
            HEADER_ACTION,
            'bg-lime-action hover:bg-lime-hover text-gray-800',
          )}
        >
          새 주차 업로드
          <Icon name="plus" size={16} />
        </Link>
      </div>

      {editOpen && (
        <LectureFormModal
          project={project}
          onClose={() => setEditOpen(false)}
        />
      )}
    </header>
  );
}
