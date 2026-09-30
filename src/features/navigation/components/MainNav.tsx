'use client';
// src/features/navigation/components/MainNav.tsx
// 사이드바에 들어갈 것을 가져와서 도메인 없는 모양으로 옮긴다 (CLAUDE.md 3절).
// shared/ui/Sidebar는 강의도 프로필도 모르고, 여기가 그 사이를 잇는다.
import { useMemo } from 'react';
import { useProjectSummaries } from '@/features/study/hooks/useProjectSummaries';
import { useMyProfile } from '@/features/settings/hooks/useMyProfile';
import {
  buildSubjectColorMap,
  subjectDotClass,
} from '@/shared/lib/subjectColor';
import { MainShell, type NavCourse } from '@/shared/ui/Sidebar';

export function MainNav({ children }: { children: React.ReactNode }) {
  const { data, isPending, isError } = useProjectSummaries();
  const { data: profile } = useMyProfile();

  const nav = useMemo(() => {
    const courses = data ?? [];
    // 색 배정은 캘린더와 같은 전체 목록을 본다 — 다른 집합으로 배정하면
    // 같은 과목이 화면마다 다른 색이 된다.
    const dots = buildSubjectColorMap(data);
    const toNav = (p: (typeof courses)[number]): NavCourse => ({
      id: p.projectId,
      label: p.title,
      colorClass: subjectDotClass(dots, p.projectId),
    });

    return {
      mine: courses.map(toNav),
      pending: isPending,
      error: isError,
      profile: profile
        ? { name: profile.nickname, imageUrl: profile.profileImage }
        : null,
    };
  }, [data, isPending, isError, profile]);

  return <MainShell nav={nav}>{children}</MainShell>;
}
