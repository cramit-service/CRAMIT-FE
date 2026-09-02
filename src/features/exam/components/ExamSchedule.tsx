'use client';
// src/features/exam/components/ExamSchedule.tsx
import Link from 'next/link';
import { useState } from 'react';
import type { Exam } from '@/shared/types/api';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';
import { formatKoreanDate } from '@/shared/lib/date';
import { daysUntil, ddayLabel, ddayBadgeClass } from '@/features/exam/lib/dday';
import { examName } from '@/features/exam/lib/examName';
import { useExams } from '@/features/exam/hooks/useExams';
import { ExamFormModal } from './ExamFormModal';

function StatusMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex h-full items-center justify-center text-center text-[13px] text-gray-500">
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
    <section>
      <div className="mb-1.5 flex items-center justify-between">
        <h2 className="text-[18px] leading-7 font-medium tracking-[-0.36px] text-gray-950">
          다가오는 시험 일정
        </h2>
        <Button
          variant="dark"
          size="xs"
          className="gap-0.5"
          onClick={() => setEditing('new')}
        >
          추가하기
          <PlusIcon className="size-3" />
        </Button>
      </div>

      {/* 카드는 데이터 유무와 무관하게 항상 렌더 — 크기는 여기(div)에 준다. 비어도 안 줄어든다.
          스크롤은 안쪽 div가 맡는다. 카드가 직접 스크롤하면 스크롤바가 카드 가장자리에 붙어
          시안(우측 6px·상하 9px 안쪽)처럼 띄울 수 없다. 그 여백을 카드의 py/pr이 만든다. */}
      {/* 높이 129 = py-2.5(20) + 행 54 × 2 + 구분선 1. 항목 2개가 잘리지 않고 딱 들어가는 값이다.
          예전 h-29(116)는 안쪽이 96뿐이라 두 번째 행이 13px 잘렸다. 행 여백(py-2)은 시안값이라
          그쪽을 줄이면 시험 행만 TODO 행보다 촘촘해진다 — 그래서 카드를 키웠다.
          이 높이는 1행 전체 높이를 정하므로 home/page.tsx의 세로 합 주석과 함께 움직인다. */}
      <div className="h-[129px] rounded-md bg-white py-2.5 pr-1.5 pl-6">
        <div className="scrollbar-slim h-full overflow-y-auto overscroll-none pr-4">
          {isLoading ? (
            <StatusMessage>불러오는 중…</StatusMessage>
          ) : isError || !exams ? (
            <StatusMessage>
              시험 일정을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
            </StatusMessage>
          ) : exams.length === 0 ? (
            <StatusMessage>다가오는 시험이 없어요.</StatusMessage>
          ) : (
            <ul className="divide-y divide-gray-200">
              {exams.map((exam) => {
                const days = daysUntil(exam.examDate);
                // 행을 누르면 그 시험의 강의로 이동한다. 홈에서 학습으로 들어가는 길이
                // 배너 하나뿐이라, 가장 자연스러운 진입점인 이 행을 열어 준다.
                // 행 끝 셰브론은 앱의 다른 곳(배너 CTA·최근 학습)에서도 이동을 뜻하므로
                // 이제야 모양과 동작이 맞는다. 수정은 옆 연필 버튼으로 옮겼다.
                // relative 필수 — 아래 Link의 after가 이 행을 기준으로 펼쳐진다(CLAUDE.md 4-5).
                // 기준이 없으면 문서 최상위가 되어 카드 바깥까지 덮는다.
                return (
                  <li
                    key={exam.examId}
                    className="group relative flex items-center gap-2.5 py-2"
                  >
                    {/* 뱃지는 자연 크기 유지. 고정폭 슬롯에 왼쪽 정렬해 뒤 제목의 시작 x를 통일한다 */}
                    <div className="w-14 shrink-0">
                      <span
                        className={cn(
                          'inline-block rounded-md border-[0.5px] px-2 py-0.5 text-[12px] leading-4.5 font-medium',
                          ddayBadgeClass(days),
                        )}
                      >
                        {ddayLabel(days)}
                      </span>
                    </div>
                    {/* after로 행 전체를 덮어 뱃지·여백을 눌러도 이동하게 한다.
                        빈 오버레이 링크가 아니라 글자를 감싸는 이유: 링크 이름이
                        "시험명 + 날짜"로 저절로 잡힌다(빈 링크면 aria-label을 따로 붙여야 한다). */}
                    <Link
                      href={`/projects/${exam.projectId}`}
                      className="focus-visible:ring-secondary-400 min-w-0 flex-1 rounded-sm after:absolute after:inset-0 focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <p className="truncate text-[14px] leading-5 font-medium tracking-[-0.28px] text-gray-950">
                        {examName(exam)}
                      </p>
                      <p className="text-[12px] leading-4.5 tracking-[-0.24px] text-gray-600">
                        {formatKoreanDate(exam.examDate)}
                      </p>
                    </Link>
                    {/* 수정 — 이동 링크의 after가 행을 덮으므로 z-10으로 그 위에 올린다.
                        행에 마우스를 올리거나 행 안에 포커스가 들어왔을 때만 드러낸다.
                        이 앱은 데스크톱(웹·앱)만 대상이라 호버가 항상 있다 — 터치만 쓰는
                        기기가 대상이었다면 호버가 없어 영영 안 나타났을 방식이다.
                        opacity로만 숨기므로 버튼은 계속 포커스 대상이고 보조기술에도 남는다.
                        group-focus-within이라 Tab으로 행에 들어오면 같이 보인다 —
                        키보드로는 호버가 없으니 이게 없으면 보이지 않는 채로 포커스만 간다.
                        보이는 크기는 28로 두고 before로 히트 영역만 44로 넓힌다(28+8*2).
                        늘린 8px은 옆 셰브론과의 간격(10) 안쪽이라 서로 겹치지 않는다. */}
                    <button
                      type="button"
                      aria-label={`${examName(exam)} 수정`}
                      onClick={() => setEditing(exam)}
                      className="focus-visible:ring-secondary-400 relative z-10 flex size-7 shrink-0 items-center justify-center rounded-md text-gray-400 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100 before:absolute before:-inset-2 hover:bg-gray-200 hover:text-gray-700 focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <PencilIcon className="size-4" />
                    </button>
                    <ChevronRightIcon className="size-4 shrink-0 text-gray-400 transition-colors group-hover:text-gray-600" />
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

// 수정 아이콘. 같은 파일의 다른 아이콘과 규격을 맞춘다(24 viewBox·stroke 2·round).
function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 20h4L19 9a2.5 2.5 0 0 0-4-4L4 16v4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
