'use client';
// src/features/exam/components/StudyBanner.tsx
import Image from 'next/image';
import Link from 'next/link';
import { GradientBackground } from '@/shared/ui/GradientBackground';
import { cn } from '@/shared/lib/cn';
import { daysUntil } from '@/features/exam/lib/dday';
import { DdayBadge } from '@/features/exam/components/DdayBadge';
import { examName } from '@/features/exam/lib/examName';
import { useExams } from '@/features/exam/hooks/useExams';

// 뱃지 오른쪽 한 마디. 급할 때만 붙이고 여유가 있으면 재촉하지 않는다.
function urgencyNote(days: number): string | null {
  if (days === 0) return '오늘 시험';
  if (days >= 1 && days <= 3) return '시험이 곧이에요';
  return null;
}

// 학습 배너. 가장 임박한 시험(exams[0])의 강의를 "이어서 학습" 대상으로 보여준다.
// 데이터는 시험 일정과 함께 내려온다(useExams 재사용). 배경은 랜딩과 동일한 GradientBackground.
export function StudyBanner() {
  const { data: exams, isLoading, isError } = useExams();
  // getExams가 임박한 순으로 정렬해 주므로 첫 번째가 배너 대상.
  const featured = exams?.[0];
  // 로딩·실패 중에는 featured가 없다. 아래 뱃지는 featured가 있을 때만 그린다.
  const days = featured ? daysUntil(featured.examDate) : 0;
  // 백엔드가 붙기 전이라 progress가 빠져 올 수 있다 — 없으면 진행 바를 통째로 접는다.
  const progress: number | null = featured?.progress ?? null;
  const note = urgencyNote(days);

  // 조회가 끝났고 정말로 일정이 없을 때만 빈 배너를 보여준다.
  // 로딩 중이나 실패했을 때 띄우면 "일정이 없다"고 단정하는 셈이 된다.
  if (!isLoading && !isError && !featured) {
    return <EmptyExamBanner />;
  }

  return (
    <GradientBackground
      variant="wide"
      // 호버 그림자는 featured가 있을 때만 — 로딩·에러 때는 안쪽 Link가 없어서
      // 눌리지 않는데 그림자만 뜨면 눌리는 것처럼 보인다.
      className={cn(
        'has-[a:focus-visible]:ring-secondary-400 flex min-h-35.5 flex-col justify-start rounded-md border border-gray-800 px-12 py-5 transition-shadow has-[a:focus-visible]:ring-2',
        featured && 'hover:shadow-md',
      )}
    >
      {/* 배너 장식 — 캐릭터(고양이)와 낙서. 오른쪽에 절대배치. 순수 장식이라 aria-hidden.
          SVG라 next/image 최적화 경로(400)를 피하려 unoptimized로 그대로 서빙한다. */}
      <Image
        src="/images/Banner_extra.svg"
        alt=""
        aria-hidden
        width={72}
        height={83}
        unoptimized
        className="pointer-events-none absolute top-10 left-[67%] h-14 w-auto select-none"
      />
      {/* 홈 첫 화면 상단이라 이 이미지가 LCP로 잡힌다. eager로 미리 받아
          Next의 LCP 경고를 없애고 배너가 늦게 채워지는 것도 막는다.
          Next 16부터 같은 일을 하던 priority는 deprecated라 preload를 쓴다. */}
      <Image
        src="/images/Crait_Cat.svg"
        alt=""
        aria-hidden
        width={195}
        height={154}
        unoptimized
        preload
        className="pointer-events-none absolute right-3 bottom-3 h-26 w-auto select-none"
      />
      {featured && (
        // 배너 전체가 학습 진입 링크다. Link에는 위치를 주지 않는다 — 주는 순간 after의
        // 기준이 배너가 아니라 링크 박스가 된다. 쌓임 기준은 대신 안쪽 세 줄에 준다.
        <Link
          href={`/projects/${featured.projectId}`}
          className="group flex flex-col after:absolute after:inset-0 focus-visible:outline-none"
        >
          <div className="relative flex flex-wrap items-center gap-2.5">
            <DdayBadge days={days} onGradient />
            {note && <span className="text-label text-gray-600">{note}</span>}
          </div>
          {/* 고양이(폭 132 + right-3)가 콘텐츠 상자를 96px 파고든다. 그만큼 비우고,
              긴 이름은 줄바꿈 대신 자른다 — 배너가 세로로 늘면 옆 시험 일정 열이 따라 늘어난다. */}
          <h3 className="text-heading-md relative mt-2 truncate pr-24 font-semibold text-gray-800">
            {examName(featured)}
          </h3>
          {progress !== null && (
            // 고양이 왼쪽까지가 96px인데 딱 붙어 보여서 32px을 더 뗀다(mr-32 = 128).
            // 폭을 w-full로 못 박으면 이 여백이 상자를 못 밀어내 바가 고양이 밑으로 들어간다 —
            // 늘어나는 건 flex stretch에 맡기고 상한만 준다.
            <div className="relative mt-3.5 mr-32 max-w-110">
              <div className="text-label flex items-center justify-between leading-4">
                <span className="text-gray-600">학습 진행률</span>
                <span className="font-semibold text-gray-950">{progress}%</span>
              </div>
              <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-gray-300">
                <span
                  className="block h-full rounded-full bg-gray-900 transition-[width] duration-300"
                  style={{ width: `${progress}%` }}
                />
              </span>
            </div>
          )}
          {/* 배너 전체가 링크라 이게 유일한 진입 신호다. */}
          <span
            className={cn(
              'text-body relative flex w-fit items-center gap-1 leading-6.5 font-medium text-gray-900 transition-colors group-hover:text-gray-950',
              progress !== null ? 'mt-3' : 'mt-3.5',
            )}
          >
            학습하러 가기
            <ChevronRightIcon className="size-4" />
          </span>
        </Link>
      )}
    </GradientBackground>
  );
}

// 시험 일정이 하나도 없을 때의 배너(시안 별도 상태).
// 높이는 진행 중 배너와 같게 맞춘다 — 다르면 둘 사이를 오갈 때 그리드 1행이 흔들린다.
function EmptyExamBanner() {
  return (
    <div className="relative flex min-h-35.5 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-md bg-gray-800">
      {/* 장식 — 낙서(좌)와 캐릭터(우). 순수 장식이라 aria-hidden.
          낙서는 어두운 배경용 흰색 별도 에셋이다(진행 중 배너의 Banner_extra는 거의 검정이라 안 보인다).
          SVG라 next/image 최적화 경로를 피하려 unoptimized로 그대로 서빙한다. */}
      <Image
        src="/images/Banner_extra_white.svg"
        alt=""
        aria-hidden
        width={72}
        height={83}
        unoptimized
        className="pointer-events-none absolute top-9 left-[10%] h-14 w-auto select-none"
      />
      {/* 진행 중 배너와 같은 이유로 LCP 대비 preload */}
      <Image
        src="/images/Crait_Cat.svg"
        alt=""
        aria-hidden
        width={195}
        height={154}
        unoptimized
        preload
        className="pointer-events-none absolute right-3 bottom-3 h-26 w-auto select-none"
      />
      <p className="text-heading-sm relative font-semibold text-white">
        예정된 시험 일정이 없습니다.
      </p>
      <p className="text-body relative text-gray-300">
        새로운 시험이 등록되면 이곳에 표시됩니다.
      </p>
    </div>
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
