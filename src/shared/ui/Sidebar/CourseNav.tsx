'use client';
// src/shared/ui/Sidebar/CourseNav.tsx
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib/cn';
import { Tooltip } from '@/shared/ui/Tooltip';
import type { NavCourse } from './types';
import { NavScroll } from './NavScroll';
import { Icon } from '@/shared/ui/Icon';

interface CourseNavProps {
  // 사이드바 펼침 여부. 접힘이면 점만 남고 강의명이 사라진다.
  expanded: boolean;
  mine: NavCourse[];
  pending: boolean;
  error: boolean;
}

// 사이드바 과목 목록. 제목 줄은 강의 목록 화면으로 가는 링크이고, 접었다 펴는 일은
// 옆의 chevron이 따로 맡는다 — 한 줄이 두 가지를 하면 어느 쪽이 눌릴지 알 수 없다.
export function CourseNav({ expanded, mine, pending, error }: CourseNavProps) {
  const [open, setOpen] = useState(true);

  return (
    <CourseSection
      icon={<Icon name="book" size={24} />}
      label="내 강의"
      href="/projects"
      courses={mine}
      open={open}
      onToggle={() => setOpen((v) => !v)}
      expanded={expanded}
      pending={pending}
      error={error}
    />
  );
}

interface CourseSectionProps {
  icon: React.ReactNode;
  label: string;
  /** 제목 줄이 가리키는 곳. 강의 목록 화면이다. */
  href: string;
  courses: NavCourse[];
  /** 과목 id -> 점 색 클래스. 캘린더와 같은 규칙으로 만든 것을 위에서 내려준다. */
  open: boolean;
  onToggle: () => void;
  expanded: boolean;
  pending?: boolean;
  error?: boolean;
}

function CourseSection({
  icon,
  label,
  href,
  courses,
  open,
  onToggle,
  expanded,
  pending = false,
  error = false,
}: CourseSectionProps) {
  const pathname = usePathname();
  // 정확히 일치할 때만 켠다. prefix로 잡으면 과목 상세(/projects/1)에서 아래 과목 줄과
  // 둘 다 켜져 "지금 여기"가 두 군데가 된다.
  const active = pathname === href;

  return (
    // 제목 줄은 제자리에 두고 목록만 스크롤한다. 그래서 이 묶음이 남는 높이를 전부
    // 가져가고(min-h-0 + flex-1), 안에서 제목은 shrink-0, 목록은 flex-1로 갈린다.
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 제목 줄은 강의 목록으로 가는 링크, chevron은 접었다 펴는 버튼 — 서로 다른 일이라
          표적을 나눈다. 접힘에서는 chevron이 사라지므로 아이콘을 누르면 목록 화면으로 간다.
          그 상태에서는 아래 점이 이미 다 보여서 접을 일이 없다.
          아이콘 칸 폭은 접힘 레일과 같아 폭이 바뀌는 동안 아이콘이 제자리에 머문다. */}
      <div className="group/row relative flex shrink-0 items-center">
        {/* 활성 배경은 레일 안쪽으로 들여 양끝을 살린다 — 항목들과 같은 언어를 쓴다.
            hover도 같은 자리다(SidebarItem과 같은 이유). */}
        <span
          className={cn(
            'absolute inset-y-0 right-2 left-2 rounded-md transition-colors',
            active ? 'bg-lime-action' : 'group-hover/row:bg-gray-100',
          )}
        />
        <Tooltip label={label} disabled={expanded}>
          <Link
            href={href}
            aria-label={expanded ? undefined : label}
            className="focus-visible:ring-sky-ink relative flex min-w-0 flex-1 items-center py-4.5 text-gray-800 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
          >
            <span
              className={cn(
                'flex w-[var(--sidebar-rail)] shrink-0 justify-center',
                !active && 'text-gray-800',
              )}
            >
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
          </Link>
        </Tooltip>
        {/* 접힘에서는 자리를 아예 비운다 — 90px 레일에 들어갈 공간이 없고,
            점이 전부 보이는 상태라 접을 이유도 없다. */}
        {expanded && (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-label={`${label} ${open ? '접기' : '펼치기'}`}
            className="focus-visible:ring-sky-ink relative mr-3.5 flex size-8 shrink-0 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 focus-visible:ring-2 focus-visible:outline-none"
          >
            <Icon
              name="arrow-right"
              className={cn(
                'size-4 transition-transform duration-150 ease-out',
                open && 'rotate-90',
              )}
            />
          </button>
        )}
      </div>

      {open && (
        <NavScroll>
          <ul>
            {pending &&
              [0, 1, 2].map((i) => (
                <li key={i} className="flex items-center py-2.5">
                  <span className="flex w-[var(--sidebar-rail)] shrink-0 justify-center">
                    <span className="size-1.5 rounded-full bg-gray-200 motion-safe:animate-pulse" />
                  </span>
                  {expanded && (
                    <span className="mr-5 h-3 flex-1 rounded-full bg-gray-200 motion-safe:animate-pulse" />
                  )}
                </li>
              ))}
            {error && expanded && (
              <li className="text-label py-2 pl-[var(--sidebar-rail)] text-gray-500">
                목록을 불러오지 못했어요
              </li>
            )}
            {/* 성공했는데 비어 있는 경우 — 소제목만 남으면 고장으로 읽힌다.
              강의를 만들 수 있는 곳으로 보낸다. */}
            {!pending && !error && courses.length === 0 && expanded && (
              <li>
                <Link
                  href="/projects"
                  className="text-label focus-visible:ring-sky-ink block py-2 pl-[var(--sidebar-rail)] text-gray-500 transition-colors hover:text-gray-700 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
                >
                  아직 강의가 없어요 · 등록하러 가기
                </Link>
              </li>
            )}
            {courses.map((course) => {
              const href = `/projects/${course.id}`;
              const active =
                pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={course.id}>
                  {/* 점은 상위 아이콘과 같은 열, 강의명은 상위 라벨과 같은 열에 선다.
                    접힘은 강의명만 사라지는 상태라 점이 제자리에 그대로 남는다.
                    툴팁은 접힘에서만 — 펼침에서는 강의명이 이미 옆에 있다. */}
                  <Tooltip label={course.label} disabled={expanded}>
                    <Link
                      href={href}
                      aria-label={expanded ? undefined : course.label}
                      className={cn(
                        'focus-visible:ring-sky-ink group relative flex items-center py-2.5 transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
                        active
                          ? 'text-gray-800'
                          : 'text-gray-500 hover:text-gray-700',
                      )}
                    >
                      {/* 활성·hover 배경. 위 메뉴 줄과 같은 자리·같은 모양이다.
                          글자가 한 단 같이 내려오는 건 대비 때문이다 — gray-500은 채움
                          위에서 4.08:1이라 문턱(4.5)을 못 넘는다. gray-700은 8.98:1. */}
                      <span
                        className={cn(
                          'absolute inset-y-0 right-2 left-2 rounded-md transition-colors',
                          active ? 'bg-lime-action' : 'group-hover:bg-gray-100',
                        )}
                      />
                      {/* 캘린더 일정 점과 같은 과목 색. 접힘에서는 이것만 남으므로
                        6px으로는 레일에서 안 보여 10px로 키운다. */}
                      <span className="relative flex w-[var(--sidebar-rail)] shrink-0 justify-center">
                        <span
                          aria-hidden
                          className={cn(
                            'shrink-0 rounded-full transition-[width,height] duration-150 ease-out',
                            expanded ? 'size-1.5' : 'size-2.5',
                            course.colorClass,
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
                        {course.label}
                      </span>
                    </Link>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </NavScroll>
      )}
    </div>
  );
}
