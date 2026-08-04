'use client';
// src/features/study/components/ProjectHeader.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/Button';
import { NewChapterUploadModal } from '@/features/project/components/NewChapterUploadModal';
import { Tag } from './Tag';
import { ChevronLeftIcon, PencilIcon, ShareIcon, PlusIcon } from './icons';
import { getDday } from '../lib/format';
import type { ProjectDetail } from '@/shared/types/api';

// 챕터 상세 상단 헤더: 뒤로가기 + 과목명/태그 + 우측 액션(공유/업로드)을 한 줄로 배치.
export function ProjectHeader({ project }: { project: ProjectDetail }) {
  const router = useRouter();
  const dday = getDday(project.examName, project.examDate);
  const [uploadOpen, setUploadOpen] = useState(false);

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

      {/* TODO(모달): 프로젝트 수정 모달은 project(생성/수정) 담당. 버튼만 둔다. */}
      <button
        type="button"
        onClick={() => {
          // TODO: 프로젝트 수정 모달 열기 (project 담당)
        }}
        className="inline-flex items-center gap-1 text-[12px] text-gray-400 transition-colors hover:text-gray-600"
      >
        <PencilIcon className="size-3" />
        수정하기
      </button>

      {/* 우측: 공유 / 새 주차 업로드 (모달은 각 담당) */}
      <div className="ml-auto flex shrink-0 items-center gap-2">
        {/* TODO(모달): 공유 모달은 share 담당. 버튼만 둔다. */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // TODO: 공유 모달 열기 (share 담당)
          }}
          className="inline-flex items-center gap-1.5 border-gray-500 text-[14px] font-medium text-gray-600"
        >
          공유하기
          <ShareIcon className="size-3.5" />
        </Button>
        {/* 공유받은 강의(sharedBy 있음)에는 주차를 올릴 수 없다. 버튼 자체를 감춘다.
            모달의 강의 셀렉트도 같은 기준으로 내 강의만 보여준다.
            Button엔 dark variant가 없어 이 화면 전용 어두운 버튼을 사용한다.
            Figma: bg #2b2e36(gray-800), 16px Medium */}
        {!project.sharedBy && (
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-gray-800 px-2.5 py-1.5 text-[14px] font-medium text-white transition-colors hover:bg-gray-700"
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
    </header>
  );
}
