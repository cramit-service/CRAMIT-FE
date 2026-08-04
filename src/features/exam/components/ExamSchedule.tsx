'use client';
// src/features/exam/components/ExamSchedule.tsx
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';
import { formatKoreanDate } from '@/shared/lib/date';
import { daysUntil, ddayLabel } from '../lib/dday';
import { examName } from '../lib/examName';
import { useExams } from '../hooks/useExams';

// 남은 일수 → 뱃지 색. 디자인 시안 기준(보더+연한 배경+진한 글씨).
// D-DAY(빨강) / D-1~3(노랑) / D-4+(파랑).
// error·warning은 스케일 없는 단색 토큰이라 /20·/10으로 옅게 깔아 배경으로 쓴다. (색 하드코딩 아님)
// D-DAY 배경 error/20은 디자인 rgba(255,93,107,0.2)와 정확히 일치한다.
function ddayBadgeClass(days: number): string {
  if (days <= 0) return 'border-error bg-error/20 text-error';
  if (days <= 3) return 'border-level-02 bg-warning/10 text-warning';
  return 'border-secondary-400 bg-secondary-400/10 text-secondary-600';
}

function StatusMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex h-full items-center justify-center text-center text-[13px] text-gray-500">
      {children}
    </p>
  );
}

export function ExamSchedule() {
  const { data: exams, isLoading, isError } = useExams();

  return (
    <section>
      <div className="mb-1.5 flex items-center justify-between">
        <h2 className="text-[18px] leading-7 font-medium tracking-[-0.36px] text-gray-950">
          다가오는 시험 일정
        </h2>
        {/* TODO: 시험 추가 모달 연결 (이번 작업은 버튼 UI까지) */}
        <Button variant="dark" size="xs" className="gap-0.5">
          추가하기
          <PlusIcon className="size-3" />
        </Button>
      </div>

      {/* 카드는 데이터 유무와 무관하게 항상 렌더 — 크기(h-29)는 여기(div)에 준다. 비어도 안 줄어든다.
          스크롤은 안쪽 div가 맡는다. 카드가 직접 스크롤하면 스크롤바가 카드 가장자리에 붙어
          시안(우측 6px·상하 9px 안쪽)처럼 띄울 수 없다. 그 여백을 카드의 py/pr이 만든다. */}
      <div className="h-29 rounded-md bg-white py-2.5 pr-1.5 pl-6">
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
                return (
                  <li
                    key={exam.examId}
                    className="flex items-center gap-2.5 py-2"
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
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] leading-5 font-medium tracking-[-0.28px] text-gray-950">
                        {examName(exam)}
                      </p>
                      <p className="text-[12px] leading-4.5 tracking-[-0.24px] text-gray-600">
                        {formatKoreanDate(exam.examDate)}
                      </p>
                    </div>
                    <ChevronRightIcon className="size-4 shrink-0 text-gray-400" />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
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
