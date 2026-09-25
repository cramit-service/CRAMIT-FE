'use client';
// src/features/study/components/ProjectHeader.tsx
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { LectureFormModal } from '@/features/project/components/LectureFormModal';
import { Tag } from './Tag';
import { PencilIcon, PlusIcon } from './icons';
import { getDday } from '@/features/study/lib/format';
import type { ProjectDetail } from '@/shared/types/api';

// 헤더 우측 액션 2종(공유하기·새 주차 업로드)의 공통 골격.
// 높이·타이포를 한 곳에 두어 두 버튼이 서로 어긋나지 않게 한다.
// Button 컴포넌트를 쓰지 않는 이유: size 스케일에 이 헤더에 맞는 단계가 없다
// (xs 28px/12px, sm 46px/16px).
// Figma: 공유하기 40 / 새 주차 업로드 44. 나란히 놓이는 버튼이라 큰 쪽에 맞춰 같은 높이로 둔다.
const HEADER_ACTION =
  'inline-flex h-11 shrink-0 items-center gap-2 rounded-md px-4 text-label leading-none font-medium transition-colors';

// 챕터 상세 상단 헤더: 뒤로가기 + 과목명/태그 + 우측 액션(공유/업로드)을 한 줄로 배치.
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
      {/* 공유받은 강의일 때만 공유자 태그를 노출한다 (내 강의면 sharedBy가 null) */}
      {project.sharedBy && (
        <Tag tone="shared">{project.sharedBy} 님의 공유</Tag>
      )}

      {/* 공유받은 강의는 내가 고칠 수 없다 — 버튼 자체를 감춘다 (새 주차 업로드와 같은 기준).
          hidden 속성은 inline-flex 클래스에 덮이므로 렌더 자체를 막는다. */}
      {!project.sharedBy && (
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="text-button-sm inline-flex items-center gap-1 text-gray-700 transition-colors hover:text-gray-900"
        >
          <PencilIcon className="size-3" />
          수정하기
        </button>
      )}

      {/* 우측: 공유 / 새 주차 업로드 (모달은 각 담당) */}
      <div className="ml-auto flex shrink-0 items-center gap-2">
        {/* 공유받은 강의(sharedBy 있음)에는 주차를 올릴 수 없다. 버튼 자체를 감춘다.
            모달의 강의 셀렉트도 같은 기준으로 내 강의만 보여준다.
            Figma: bg #2b2e36(gray-800) */}
        {!project.sharedBy && (
          // 모달을 띄우지 않고 학습 화면 자리로 바로 들어간다 — 수업을 들으면서
          // 쓰는 동선이라 모달에 갇히지 않는 게 중요하다(#107).
          // 목적지가 있으므로 버튼이 아니라 링크다 (§4).
          <Link
            href={`/projects/${project.projectId}/chapters/new`}
            className={cn(
              HEADER_ACTION,
              'bg-lime-action hover:bg-lime-hover text-gray-800',
            )}
          >
            새 주차 업로드
            <PlusIcon className="size-4" />
          </Link>
        )}
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
