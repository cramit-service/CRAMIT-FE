'use client';
// src/features/exam/components/ExamSchedule.tsx
import Link from 'next/link';
import { useState } from 'react';
import type { Exam } from '@/shared/types/api';
import { Icon } from '@/shared/ui/Icon';
import { formatShortDate } from '@/shared/lib/date';
import { daysUntil } from '@/features/exam/lib/dday';
import { DdayBadge } from '@/features/exam/components/DdayBadge';
import { examName } from '@/features/exam/lib/examName';
import { useExams } from '@/features/exam/hooks/useExams';
import { ExamFormModal } from './ExamFormModal';

function StatusMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex h-full items-center justify-center text-center text-[14px] leading-5 text-gray-600">
      {children}
    </p>
  );
}

export function ExamSchedule() {
  const { data: exams, isLoading, isError } = useExams();
  // null이면 닫힘, 'new'면 추가, Exam이면 그 시험을 수정.
  // 모달은 열려 있을 때만 마운트한다 — 닫으면 입력값이 딸려 사라져
  // 다음에 열 때 초기값부터 다시 시작한다(초기화 코드가 따로 필요 없다).
  const [editing, setEditing] = useState<Exam | 'new' | null>(null);

  return (
    <section className="flex min-h-0 flex-col">
      <div className="mb-1.5 flex min-h-10 items-center justify-between">
        <h2 className="text-heading-sm leading-8 font-semibold text-gray-950">
          다가오는 시험 일정
        </h2>
        {/* 텍스트 버튼이라 좌우 패딩만큼 라벨이 안으로 들어간다. 음수 마진으로 그만큼
            빼내 "추가"의 오른쪽 끝이 아래 카드의 오른쪽 끝과 한 선에 선다. */}
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="focus-visible:ring-secondary-400 -mr-2.5 flex items-center gap-1 rounded-md px-2.5 py-2 text-[14px] leading-5 text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-900 focus-visible:ring-2 focus-visible:outline-none"
        >
          <PlusIcon className="size-3.5 shrink-0" />
          추가
        </button>
      </div>

      {/* 카드는 데이터 유무와 무관하게 항상 렌더 — 크기는 여기(div)에 준다. 비어도 안 줄어든다.
          스크롤은 안쪽 div가 맡는다. 카드가 직접 스크롤하면 스크롤바가 카드 모서리에 붙는다.
          안쪽의 -mr-3/pr-3은 스크롤바를 카드 우패딩 자리로 빼되 글자는 그대로 두려는 것이다. */}
      {/* 높이는 1행(배너가 정하는 202)에서 제목 블록 46을 뺀 값이다. 배너와 하단이 맞는다 —
          2행에서 TODO 카드가 캘린더와 맞는 것과 같은 규칙이다.
          안쪽 140에 세 행이 들어가야 한다: 행 46 × 3 + 구분선 1 × 2 = 140.
          행 46 = 뱃지 32 + py-1.75(14). 이 셋 중 하나를 바꾸면 세 행이 깨진다. */}
      <div className="flex h-[156px] flex-col rounded-lg border border-gray-300 bg-white px-6 py-2">
        <div className="scrollbar-bare -mr-3 min-h-0 flex-1 overflow-y-auto overscroll-none pr-3">
          {isLoading ? (
            <StatusMessage>불러오는 중…</StatusMessage>
          ) : isError || !exams ? (
            <StatusMessage>
              시험 일정을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
            </StatusMessage>
          ) : exams.length === 0 ? (
            <StatusMessage>다가오는 시험이 없어요.</StatusMessage>
          ) : (
            // 행 사이 선은 둘째 행부터의 위쪽 테두리다. divide-y를 안 쓰는 이유는
            // v4에서 그게 아래쪽 선으로 바뀌어 "첫 행 제외 상단"과 걸리는 요소가 달라서다.
            <ul className="[&>li+li]:border-t [&>li+li]:border-gray-200">
              {exams.map((exam) => {
                const days = daysUntil(exam.examDate);
                // 행을 누르면 그 시험의 강의로 이동한다. 홈에서 학습으로 들어가는 길이
                // 배너 하나뿐이라, 가장 자연스러운 진입점인 이 행을 열어 준다.
                // relative 필수 — 아래 Link의 after가 이 행을 기준으로 펼쳐진다(CLAUDE.md 4-5).
                // 기준이 없으면 문서 최상위가 되어 카드 바깥까지 덮는다.
                return (
                  <li
                    key={exam.examId}
                    className="group relative flex items-center gap-4 py-1.75"
                  >
                    <DdayBadge days={days} />
                    {/* after로 행 전체를 덮어 뱃지·여백을 눌러도 이동하게 한다.
                        빈 오버레이 링크가 아니라 글자를 감싸는 이유: 링크 이름이
                        "시험명 + 날짜"로 저절로 잡힌다(빈 링크면 aria-label을 따로 붙여야 한다). */}
                    {/* 제목과 날짜가 한 줄에 선다. 2줄로 쌓으면 글자만 44라 행이 46에 안 들어간다. */}
                    <Link
                      href={`/projects/${exam.projectId}`}
                      className="focus-visible:ring-secondary-400 flex min-w-0 flex-1 items-baseline gap-3 rounded-sm after:absolute after:inset-0 focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <span className="truncate text-[17px] leading-6 font-medium text-gray-900 transition-colors group-hover:text-gray-950">
                        {examName(exam)}
                      </span>
                      <span className="ml-auto shrink-0 text-[14px] leading-5 text-gray-600">
                        {formatShortDate(exam.examDate)}
                      </span>
                    </Link>
                    {/* 수정 — 이동 링크의 after가 행을 덮으므로 z-10으로 그 위에 올린다.
                        행에 마우스를 올리거나 행 안에 포커스가 들어왔을 때만 드러낸다.
                        이 앱은 데스크톱(웹·앱)만 대상이라 호버가 항상 있다 — 터치만 쓰는
                        기기가 대상이었다면 호버가 없어 영영 안 나타났을 방식이다.
                        opacity로만 숨기므로 버튼은 계속 포커스 대상이고 보조기술에도 남는다.
                        group-focus-within이라 Tab으로 행에 들어오면 같이 보인다 —
                        키보드로는 호버가 없으니 이게 없으면 보이지 않는 채로 포커스만 간다.
                        보이는 크기는 28로 두고 before로 히트 영역만 44로 넓힌다(28+8*2).
                        늘린 8px은 옆 셰브론과의 간격(16) 안쪽이라 서로 겹치지 않는다. */}
                    <button
                      type="button"
                      aria-label={`${examName(exam)} 수정`}
                      onClick={() => setEditing(exam)}
                      className="focus-visible:ring-secondary-400 relative z-10 flex size-7 shrink-0 items-center justify-center rounded-md text-gray-400 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100 before:absolute before:-inset-2 hover:bg-gray-200 hover:text-gray-700 focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <Icon name="edit" size={16} />
                    </button>
                    <ChevronRightIcon className="size-4 shrink-0 text-gray-500" />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {editing && (
        <ExamFormModal
          exam={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
