'use client';
// src/features/study/components/ProjectHeader.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/lib/cn';
import { NewChapterUploadModal } from '@/features/project/components/NewChapterUploadModal';
import { LectureFormModal } from '@/features/project/components/LectureFormModal';
import { ShareProjectModal } from '@/features/share/components/ShareProjectModal';
import { Tag } from './Tag';
import { ChevronLeftIcon, PencilIcon, ShareIcon, PlusIcon } from './icons';
import { getDday } from '@/features/study/lib/format';
import type { ProjectDetail } from '@/shared/types/api';

// 헤더 우측 액션 2종(공유하기·새 주차 업로드)의 공통 골격.
// 높이·타이포를 한 곳에 두어 두 버튼이 서로 어긋나지 않게 한다.
// Button 컴포넌트를 쓰지 않는 이유: size 스케일에 이 헤더에 맞는 단계가 없고
// (xs 28px/12px, sm 46px/16px), cn엔 tailwind-merge가 없어 className으로 높이나
// 타이포를 덮으면 승자가 클래스 생성 순서에 달린다.
// Figma: 공유하기 40 / 새 주차 업로드 44 → 0.72배로 줄이면 29/32. 나란히 놓이는
// 버튼이라 큰 쪽(32px)에 맞춰 둘을 같은 높이로 둔다.
const HEADER_ACTION =
  'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-3 text-[14px] leading-none font-medium tracking-[-0.28px] transition-colors';

// 챕터 상세 상단 헤더: 뒤로가기 + 과목명/태그 + 우측 액션(공유/업로드)을 한 줄로 배치.
export function ProjectHeader({ project }: { project: ProjectDetail }) {
  const router = useRouter();
  const dday = getDday(project.examName, project.examDate);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <header className="relative flex flex-wrap items-center gap-x-4 gap-y-3">
      {/* 강의 목록으로 뒤로가기.
          Figma: 콘텐츠 열(과목명/섹션/카드) 왼쪽 바깥으로 걸어(outdent)
          제목·섹션·카드가 같은 정렬선을 갖게 한다. */}
      <button
        type="button"
        onClick={() => router.back()}
        className="absolute top-1/2 right-full mr-4 inline-flex -translate-y-1/2 items-center gap-1.5 whitespace-nowrap text-gray-950 transition-colors hover:text-gray-700"
      >
        <ChevronLeftIcon className="size-5" />
        <span className="text-[14px] leading-[22px] font-medium tracking-[-0.28px]">
          이전으로
        </span>
      </button>

      {/* 과목명 + 정보 태그들 */}
      <h1 className="text-[24px] leading-[34px] font-semibold tracking-[-0.48px] text-gray-950">
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
          className="inline-flex items-center gap-1 text-[12px] text-gray-400 transition-colors hover:text-gray-600"
        >
          <PencilIcon className="size-3" />
          수정하기
        </button>
      )}

      {/* 우측: 공유 / 새 주차 업로드 (모달은 각 담당) */}
      <div className="ml-auto flex shrink-0 items-center gap-2">
        {/* Figma: 테두리 0.5px gray-500, 글자 gray-600 */}
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className={cn(
            HEADER_ACTION,
            'border-[0.5px] border-gray-500 text-gray-600 hover:bg-gray-200',
          )}
        >
          공유하기
          <ShareIcon className="size-3.5" />
        </button>
        {/* 공유받은 강의(sharedBy 있음)에는 주차를 올릴 수 없다. 버튼 자체를 감춘다.
            모달의 강의 셀렉트도 같은 기준으로 내 강의만 보여준다.
            Figma: bg #2b2e36(gray-800) */}
        {!project.sharedBy && (
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className={cn(
              HEADER_ACTION,
              'bg-gray-800 text-white hover:bg-gray-700',
            )}
          >
            새 주차 업로드
            <PlusIcon className="size-4" />
          </button>
        )}
      </div>

      {/* 닫을 때 통째로 언마운트해 입력값·고른 파일이 다음 열기까지 남지 않게 한다. */}
      {uploadOpen && (
        <NewChapterUploadModal
          projectId={project.projectId}
          projectTitle={project.title}
          onClose={() => setUploadOpen(false)}
        />
      )}
      {shareOpen && (
        <ShareProjectModal
          projectId={project.projectId}
          onClose={() => setShareOpen(false)}
        />
      )}
      {editOpen && (
        <LectureFormModal
          project={project}
          onClose={() => setEditOpen(false)}
        />
      )}
    </header>
  );
}
