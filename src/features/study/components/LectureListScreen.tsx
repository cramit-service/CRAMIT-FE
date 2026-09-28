'use client';
// src/features/study/components/LectureListScreen.tsx
import { useState, type ReactNode } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { LectureFormModal } from '@/features/project/components/LectureFormModal';
import { useProjectSummaries } from '@/features/study/hooks/useProjectSummaries';
import {
  filterLectures,
  sortLectures,
  SORT_OPTIONS,
  type SortKey,
} from '@/features/study/lib/lectureList';
import { buildSubjectColorMap } from '@/shared/lib/subjectColor';
import { LectureSection } from './LectureSection';
import { PAGE_PAD } from '@/shared/ui/pageShell';

// 콘텐츠 폭은 홈과 같은 1512 (CLAUDE.md 4-4). 바깥 여백은 남는 공간이 갖는다.
// 로딩·에러 문구도 같은 폭에 둔다 — 전체 폭이면 데이터가 도착하는 순간 콘텐츠가 가로로 튄다.
function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className={PAGE_PAD}>
      <div className="lg:content-col mx-auto flex w-full flex-col gap-6">
        {children}
      </div>
    </div>
  );
}

// 학습하기(강의 목록) 화면. page.tsx는 이 컴포넌트를 조립만 한다.
export function LectureListScreen() {
  const [keyword, setKeyword] = useState('');
  const [mySort, setMySort] = useState<SortKey>('REGISTERED');

  const { data: lectures, isLoading } = useProjectSummaries();

  if (isLoading) {
    return (
      <PageShell>
        <p className="text-gray-500">불러오는 중…</p>
      </PageShell>
    );
  }

  // isError 대신 데이터 유무로 가른다. 재조회가 실패해도 캐시에 목록이 남아 있으면
  // 화면을 통째로 에러로 바꾸지 않는다. 첫 조회 실패는 data가 없어 여기서 잡힌다.
  if (!lectures) {
    return (
      <PageShell>
        <p className="text-gray-500">
          강의 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      </PageShell>
    );
  }

  const mine = sortLectures(filterLectures(lectures, keyword), mySort);
  const searching = keyword.trim().length > 0;
  // 검색으로 거르기 전 전체 목록으로 배정해야 사이드바·캘린더와 같은 색이 나온다.
  const subjectDots = buildSubjectColorMap(lectures);

  return (
    // TODO(타이포): 이 화면 글자는 시안이 아니라 홈 스케일을 따랐다 — 폭이 1512로 돌아왔으니
    // 시안(1:2523) 기준으로 다시 볼 것.
    <PageShell>
      {/* 화면 제목이 열의 왼쪽 위에 선다 — 주차 내부(ProjectHeader)의 제목과 같은 자리다.
          목록 섹션이 자기 머리에 제목을 들고 있었는데, 섹션이 하나뿐이라 그건 섹션
          제목이 아니라 화면 제목이었다. */}
      <div className="flex flex-col gap-4">
        <h1 className="text-heading-md font-semibold text-gray-800">내 강의</h1>

        {/* 목록을 다루는 셋이 한 줄에 선다 — 찾기(검색), 순서(정렬), 늘리기(추가).
            좁아지면 감싸지만 그때도 셋의 순서는 같다. */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 열 전체 폭을 쓰지 않는다. placeholder가 196.8이고 아이콘·간격·여백이 58이라
              글자가 요구하는 건 259뿐인데, 열은 1506까지 간다 — 짧은 검색어를 받는 칸이
              화면을 가로지르면 어디를 눌러야 하는지가 흐려진다.
              655는 §4가 모달에 준 폭이다. 둘 다 뷰포트를 따라가지 않는 부품이라
              같은 숫자를 쓴다 — 새 숫자를 만들 이유가 없다. */}
          <div className="max-w-[655px] min-w-0 flex-1">
            {/* 돋보기는 칸 앞에 선다 — 이 칸이 무엇을 받는지 말할 뿐 누르는 게 아니다.
                뒷자리는 목록을 떨어뜨리는 것(Select의 chevron)에 남겨 둔다. */}
            <Input
              type="search"
              icon="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="강의 명 또는 키워드를 검색해 주세요."
              aria-label="강의 검색"
            />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-3">
            <Select
              value={mySort}
              onChange={setMySort}
              options={SORT_OPTIONS}
              label="내 강의 정렬"
            />
            <CreateLectureButton />
          </div>
        </div>
      </div>

      <LectureSection
        lectures={mine}
        subjectDots={subjectDots}
        searching={searching}
        emptyMessage="아직 만든 강의가 없어요. 추가하기로 첫 강의를 시작해보세요."
      />
    </PageShell>
  );
}

function CreateLectureButton() {
  // 닫을 때 통째로 언마운트해 입력값이 다음 열기까지 남지 않게 한다.
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 회색 채움을 걷었다 — §4는 그걸 비활성에만 허락하고, 짝이던 text-white는
          토큰에 없어서 글자가 아예 색을 못 받고 있었다(검은 바탕에 검은 글자의 정체).
          칸은 기본값 md(40)다. 옆의 정렬과 같은 줄에 서므로 같은 칸이어야 한다. */}
      <Button onClick={() => setOpen(true)}>추가하기</Button>
      {open && <LectureFormModal onClose={() => setOpen(false)} />}
    </>
  );
}
