'use client';
// src/features/exam/components/StudyBanner.tsx
import Image from 'next/image';
import Link from 'next/link';
import { GradientBackground } from '@/shared/ui/GradientBackground';
import { cn } from '@/shared/lib/cn';
import { daysUntil, ddayLabel, ddayBadgeClass } from '@/features/exam/lib/dday';
import { examName } from '@/features/exam/lib/examName';
import { useExams } from '@/features/exam/hooks/useExams';

// 학습 배너. 가장 임박한 시험(exams[0])의 강의를 "이어서 학습" 대상으로 보여준다.
// 데이터는 시험 일정과 함께 내려온다(useExams 재사용). 배경은 랜딩과 동일한 GradientBackground.
export function StudyBanner() {
  const { data: exams, isLoading, isError } = useExams();
  // getExams가 임박한 순으로 정렬해 주므로 첫 번째가 배너 대상.
  const featured = exams?.[0];
  // 로딩·실패 중에는 featured가 없다. 아래 뱃지는 featured가 있을 때만 그린다.
  const days = featured ? daysUntil(featured.examDate) : 0;

  // 조회가 끝났고 정말로 일정이 없을 때만 빈 배너를 보여준다.
  // 로딩 중이나 실패했을 때 띄우면 "일정이 없다"고 단정하는 셈이 된다.
  if (!isLoading && !isError && !featured) {
    return <EmptyExamBanner />;
  }

  return (
    <GradientBackground
      variant="wide"
      className="has-[a:focus-visible]:ring-secondary-400 flex min-h-35.5 flex-col justify-center rounded-md border border-gray-800 px-8 py-6 transition-shadow hover:shadow-md has-[a:focus-visible]:ring-2"
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
        // 배너 전체가 학습 진입 링크다. after로 배너를 통째로 덮어 어디를 눌러도 들어간다 —
        // 시험 행과 같은 규칙(카드 전체가 진입점)이라 홈에서 진입 방식이 갈리지 않는다.
        // 제목이 배너 세로 중앙에 오도록 묶음을 (gap 8 + 줄 높이 24)의 절반인 16px만큼 내린다.
        <Link
          href={`/projects/${featured.projectId}`}
          className="block after:absolute after:inset-0"
        >
          {/* 세로 위치 보정은 반드시 링크 '안쪽'에 둔다. transform이 걸린 요소는 그 안의
              absolute 자식에게 컨테이닝 블록이 되어, 링크에 걸면 after가 배너가 아니라
              링크 자기 박스만 덮는다(장식 영역을 눌러도 안 들어간다). */}
          <div className="flex translate-y-4 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* 시험 일정 카드와 같은 규칙으로 색을 나눈다(D-DAY 빨강 / D-1~3 노랑 / D-4+ 파랑).
                크기는 옆의 진행률 뱃지와 같아야 한다 — 나란히 놓이는 한 쌍이라 어긋나면 바로 보인다. */}
              <h3 className="text-[24px] leading-[34px] font-semibold tracking-[-0.48px] text-gray-800">
                {examName(featured)}
              </h3>
              <span
                className={cn(
                  'inline-flex items-center rounded-md border-[0.5px] px-2 py-0.5 text-[12px] leading-4.5 font-medium',
                  ddayBadgeClass(days),
                )}
              >
                {ddayLabel(days)}
              </span>
              <span className="inline-flex items-center rounded-md border-[0.5px] border-gray-800 bg-white px-2 py-0.5 text-[12px] leading-4.5 font-medium text-gray-800">
                학습 진행률 {featured.progress}%
              </span>
            </div>
            {/* 버튼이 아니라 어포던스 표시다 — 누르는 건 배너 전체다.
              gray-500이던 것을 gray-800으로 올린다. 유일한 진입 신호라 눈에 걸려야 한다. */}
            <span className="flex w-fit items-center gap-1 text-[15px] leading-6 font-semibold tracking-[-0.3px] text-gray-800">
              학습하러 가기
              <ChevronRightIcon className="size-4.5" />
            </span>
          </div>
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
      <p className="relative text-[24px] leading-8.5 font-semibold tracking-[-0.48px] text-white">
        예정된 시험 일정이 없습니다.
      </p>
      <p className="relative text-[14px] leading-5 tracking-[-0.28px] text-gray-300">
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
