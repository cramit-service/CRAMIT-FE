'use client';
// src/shared/ui/Sidebar/CourseNav.tsx
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib/cn';
import { Tooltip } from '@/shared/ui/Tooltip';
import { useProjectSummaries } from '@/features/study/hooks/useProjectSummaries';
import {
  buildSubjectColorMap,
  subjectDotClass,
} from '@/shared/lib/subjectColor';
import type { ProjectSummary } from '@/shared/types/api';
import { BookNavIcon } from './navIcons';
import { ChevronRightIcon, UsersIcon } from './icons';

// 목록이 이보다 길어지면 묶음 안에서 스크롤한다. 안 그러면 내 강의가 길 때
// 공유 강의와 하단 메뉴가 화면 밖으로 밀린다.
const MAX_ROWS = 7;
const ROW_H = 42;

interface CourseNavProps {
  // 사이드바 펼침 여부. 접힘이면 점만 남고 강의명이 사라진다.
  expanded: boolean;
}

// 사이드바 과목 목록 — 내 강의 / 공유 강의 두 묶음이 각자 접힌다.
// 한 토글로 묶으면 내 강의를 보려고 열 때 공유 강의까지 따라 열린다.
export function CourseNav({ expanded }: CourseNavProps) {
  const { data, isPending, isError } = useProjectSummaries();
  const [openMine, setOpenMine] = useState(true);
  const [openShared, setOpenShared] = useState(true);

  const courses = data ?? [];
  const mine = courses.filter((p) => !p.sharedBy);
  const shared = courses.filter((p) => p.sharedBy);
  // 색 배정은 걸러 보여주기 전의 전체 목록을 본다 — 내 강의/공유 강의로 나눈 뒤
  // 각자 배정하면 같은 과목이 캘린더와 다른 색이 된다.
  const subjectDots = useMemo(() => buildSubjectColorMap(data), [data]);

  return (
    <>
      <CourseSection
        icon={<BookNavIcon />}
        label="내 강의"
        courses={mine}
        subjectDots={subjectDots}
        open={openMine}
        onToggle={() => setOpenMine((v) => !v)}
        expanded={expanded}
        pending={isPending}
        error={isError}
      />
      {/* 공유받은 게 없으면 묶음째로 안 그린다 — 빈 소제목만 남으면 고장으로 읽힌다.
          로딩 중에도 아직 모르므로 그리지 않는다(내 강의 쪽에 스켈레톤이 이미 있다). */}
      {shared.length > 0 && (
        <CourseSection
          icon={<UsersIcon className="size-6" />}
          label="공유 강의"
          courses={shared}
          subjectDots={subjectDots}
          open={openShared}
          onToggle={() => setOpenShared((v) => !v)}
          expanded={expanded}
        />
      )}
    </>
  );
}

interface CourseSectionProps {
  icon: React.ReactNode;
  label: string;
  courses: ProjectSummary[];
  /** 과목 id -> 점 색 클래스. 캘린더와 같은 규칙으로 만든 것을 위에서 내려준다. */
  subjectDots: Map<string, number>;
  open: boolean;
  onToggle: () => void;
  expanded: boolean;
  pending?: boolean;
  error?: boolean;
}

function CourseSection({
  icon,
  label,
  courses,
  subjectDots,
  open,
  onToggle,
  expanded,
  pending = false,
  error = false,
}: CourseSectionProps) {
  const pathname = usePathname();

  return (
    <div>
      {/* 묶음 제목 = 토글. 열림은 chevron 방향으로만 알린다 — 연두는 "지금 여기" 전용이라
          여기까지 칠하면 한 화면에 신호가 셋으로 갈린다. 접힘에서는 아래 점의 유무가 곧 표시다.
          아이콘 칸 폭은 접힘 레일(90)과 같아 폭이 바뀌는 동안 아이콘이 제자리에 머문다. */}
      <Tooltip label={label} disabled={expanded}>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={expanded ? undefined : label}
          className="focus-visible:ring-secondary-400 flex w-full items-center py-4.5 text-gray-200 transition-colors hover:text-white focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
        >
          <span className="flex w-22.5 shrink-0 justify-center text-gray-400">
            {icon}
          </span>
          <span
            className={cn(
              'text-label truncate font-normal',
              'transition-opacity duration-150 ease-out',
              expanded ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            {label}
          </span>
          <ChevronRightIcon
            className={cn(
              'mr-5 ml-auto size-4 shrink-0 transition-[transform,opacity] duration-150 ease-out',
              open && 'rotate-90',
              expanded ? 'opacity-100' : 'opacity-0',
            )}
          />
        </button>
      </Tooltip>

      {open && (
        <ul
          className={cn(
            courses.length > MAX_ROWS &&
              'scrollbar-dark fade-bottom overflow-x-hidden overflow-y-auto overscroll-contain',
          )}
          style={
            courses.length > MAX_ROWS
              ? { maxHeight: MAX_ROWS * ROW_H }
              : undefined
          }
        >
          {pending &&
            [0, 1, 2].map((i) => (
              <li key={i} className="flex items-center py-2.5">
                <span className="flex w-22.5 shrink-0 justify-center">
                  <span className="size-1.5 rounded-full bg-gray-700 motion-safe:animate-pulse" />
                </span>
                {expanded && (
                  <span className="mr-5 h-3 flex-1 rounded-full bg-gray-800 motion-safe:animate-pulse" />
                )}
              </li>
            ))}
          {error && expanded && (
            <li className="text-label py-2 pl-22.5 text-gray-500">
              목록을 불러오지 못했어요
            </li>
          )}
          {/* 성공했는데 비어 있는 경우 — 소제목만 남으면 고장으로 읽힌다.
              강의를 만들 수 있는 곳으로 보낸다. */}
          {!pending && !error && courses.length === 0 && expanded && (
            <li>
              <Link
                href="/projects"
                className="text-label focus-visible:ring-secondary-400 block py-2 pl-22.5 text-gray-500 transition-colors hover:text-gray-300 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
              >
                아직 강의가 없어요 · 등록하러 가기
              </Link>
            </li>
          )}
          {courses.map((course) => {
            const href = `/projects/${course.projectId}`;
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={course.projectId}>
                {/* 점은 상위 아이콘과 같은 열, 강의명은 상위 라벨과 같은 열에 선다.
                    접힘은 강의명만 사라지는 상태라 점이 제자리에 그대로 남는다.
                    툴팁은 접힘에서만 — 펼침에서는 강의명이 이미 옆에 있다. */}
                <Tooltip label={course.title} disabled={expanded}>
                  <Link
                    href={href}
                    aria-label={expanded ? undefined : course.title}
                    className={cn(
                      'focus-visible:ring-secondary-400 relative flex items-center py-2.5 transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
                      active
                        ? 'text-primary-400'
                        : 'text-gray-300 hover:text-white',
                    )}
                  >
                    {/* 활성 배경은 레일 안쪽으로 들여 양끝을 살린다 — 꽉 채우면 잘린 것처럼 보인다 */}
                    {active && (
                      <span className="absolute inset-y-0 right-2 left-2 rounded-lg bg-gray-800" />
                    )}
                    {/* 캘린더 일정 점과 같은 과목 색. 접힘에서는 이것만 남으므로
                        6px으로는 레일에서 안 보여 10px로 키운다. */}
                    <span className="relative flex w-22.5 shrink-0 justify-center">
                      <span
                        aria-hidden
                        className={cn(
                          'shrink-0 rounded-full transition-[width,height] duration-150 ease-out',
                          expanded ? 'size-1.5' : 'size-2.5',
                          subjectDotClass(subjectDots, course.projectId),
                        )}
                      />
                    </span>
                    <span
                      className={cn(
                        'text-label relative min-w-0 flex-1 truncate pr-5 text-left font-normal',
                        'transition-opacity duration-150 ease-out',
                        expanded
                          ? 'opacity-100'
                          : 'pointer-events-none opacity-0',
                      )}
                    >
                      {course.title}
                    </span>
                  </Link>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
