'use client';
// src/features/study/components/LectureListScreen.tsx
import { useState } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { LectureFormModal } from '@/features/project/components/LectureFormModal';
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
    // 콘텐츠 폭은 홈과 같은 1512 (CLAUDE.md 4-4). 바깥 여백은 남는 공간이 갖는다.
    // TODO(타이포): 이 화면 글자는 시안이 아니라 홈 스케일을 따랐다 — 폭이 1512로 돌아왔으니
    // 시안(1:2523) 기준으로 다시 볼 것.
    <div className="px-4 py-10 md:px-8 lg:px-0">
      <div className="mx-auto flex w-full flex-col gap-6 lg:w-[82.57%] lg:max-w-[1511px]">
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
    </div>
  );
}

// shared/ui/Button의 size 스케일엔 이 조합(높이 28 + 글자 14)이 없어 직접 만든다.
function CreateLectureButton() {
  // 닫을 때 통째로 언마운트해 입력값이 다음 열기까지 남지 않게 한다.
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-label inline-flex h-7 items-center gap-1 rounded-md bg-gray-800 pr-2 pl-2.5 font-medium text-white transition-colors hover:bg-gray-700"
      >
        생성하기
        <Icon name="add" size={14} />
      </button>
      {open && <LectureFormModal onClose={() => setOpen(false)} />}
    </>
  );
}
