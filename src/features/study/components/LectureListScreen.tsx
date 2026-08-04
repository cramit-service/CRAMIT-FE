'use client';
// src/features/study/components/LectureListScreen.tsx
import { useState } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { useProjectSummaries } from '@/features/study/hooks/useProjectSummaries';
import {
  filterLectures,
  sortLectures,
  type SortKey,
} from '@/features/study/lib/lectureList';
import { LectureSearchBar } from './LectureSearchBar';
import { LectureSection } from './LectureSection';

// 학습하기(강의 목록) 화면. page.tsx는 이 컴포넌트를 조립만 한다.
export function LectureListScreen() {
  const [keyword, setKeyword] = useState('');
  // 두 섹션의 정렬은 시안에서 각각 드롭다운을 갖고 있어 상태도 따로 둔다.
  const [mySort, setMySort] = useState<SortKey>('REGISTERED');
  const [sharedSort, setSharedSort] = useState<SortKey>('REGISTERED');

  const { data: lectures, isLoading } = useProjectSummaries();

  if (isLoading) {
    return <div className="p-10 text-gray-500">불러오는 중…</div>;
  }

  // isError 대신 데이터 유무로 가른다. 재조회가 실패해도 캐시에 목록이 남아 있으면
  // 화면을 통째로 에러로 바꾸지 않는다. 첫 조회 실패는 data가 없어 여기서 잡힌다.
  if (!lectures) {
    return (
      <div className="p-10 text-gray-500">
        강의 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
      </div>
    );
  }

  // 두 섹션이 같은 검색어를 쓰므로 검색을 먼저 걸고 나서 소유/공유로 나눈다.
  const matched = filterLectures(lectures, keyword);
  const mine = sortLectures(
    matched.filter((l) => l.sharedBy === null),
    mySort,
  );
  const shared = sortLectures(
    matched.filter((l) => l.sharedBy !== null),
    sharedSort,
  );
  const searching = keyword.trim().length > 0;

  return (
    // Figma 시안은 1920 캔버스 기준 절대 px라 박스 값은 0.72배로 줄인다 (CLAUDE.md §4-4).
    // 폰트는 시안값이 이 화면에선 과해서 홈 화면 타이포 스케일(제목 24 / 본문 14 / 메타 12)을 따랐다.
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-8 py-10">
      <LectureSearchBar value={keyword} onChange={setKeyword} />

      <LectureSection
        title="내 강의"
        lectures={mine}
        tone="mine"
        sort={mySort}
        onSortChange={setMySort}
        searching={searching}
        emptyMessage="아직 만든 강의가 없어요. 생성하기로 첫 강의를 시작해보세요."
        action={<CreateLectureButton />}
      />

      {/* 시안에서 두 섹션 사이만 다른 간격보다 넓다 */}
      <div className="pt-6">
        <LectureSection
          title="공유 강의"
          description="공유자가 나를 초대하면 자동으로 목록에 표시돼요."
          lectures={shared}
          tone="shared"
          sort={sharedSort}
          onSortChange={setSharedSort}
          searching={searching}
          emptyMessage="아직 공유받은 강의가 없어요."
        />
      </div>
    </div>
  );
}

// TODO(모달): 새 강의 생성 화면은 별도 이슈. 버튼만 둔다.
// shared/ui/Button의 size 스케일엔 이 조합(높이 28 + 글자 14)이 없고, className으로 덮으면
// cn()에 merge가 없어 패딩 싸움이 난다. ProjectHeader의 다크 버튼과 같은 방식으로 직접 만든다.
function CreateLectureButton() {
  return (
    <button
      type="button"
      onClick={() => {
        // TODO: 새 강의 생성 화면으로 이동 (project 담당)
      }}
      className="inline-flex h-7 items-center gap-1 rounded-md bg-gray-800 pr-2 pl-2.5 text-[14px] leading-5 font-medium tracking-[-0.28px] text-white transition-colors hover:bg-gray-700"
    >
      생성하기
      <Icon name="add" size={14} />
    </button>
  );
}
