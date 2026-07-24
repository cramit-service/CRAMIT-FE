'use client';
// src/features/project/components/home/StudyBanner.tsx
import { useRouter } from 'next/navigation';
import { GradientBackground } from '@/shared/ui/GradientBackground';
import { daysUntil, ddayLabel } from '../../lib/dday';
import { useExams } from '../../hooks/useExams';

// 학습 배너. 가장 임박한 시험(exams[0])의 강의를 "이어서 학습" 대상으로 보여준다.
// 데이터는 시험 일정과 함께 내려온다(useExams 재사용). 배경은 랜딩과 동일한 GradientBackground.
export function StudyBanner() {
  const router = useRouter();
  const { data: exams } = useExams();
  // getExams가 임박한 순으로 정렬해 주므로 첫 번째가 배너 대상.
  const featured = exams?.[0];

  return (
    <GradientBackground
      variant="wide"
      className="flex min-h-35.5 flex-col justify-center rounded-md border border-gray-800 px-8 py-6"
    >
      {featured && (
        // 제목이 배너 세로 중앙에 오도록 [제목+CTA] 묶음을 CTA 높이의 절반(약 14px)만큼 아래로 민다.
        // (묶음을 그냥 justify-center로 두면 제목이 중앙보다 위로 올라간다)
        <div className="flex translate-y-3.5 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-[24px] leading-[34px] font-semibold tracking-[-0.48px] text-gray-800">
              {featured.lectureName ?? featured.title}
            </h3>
            <span className="inline-flex items-center rounded-md border-[0.5px] border-error bg-error/20 px-2 py-0.5 text-[12px] leading-4.5 font-medium text-error">
              {ddayLabel(daysUntil(featured.examDate))}
            </span>
            <span className="inline-flex items-center rounded-md border-[0.5px] border-gray-800 bg-white px-2 py-0.5 text-[12px] leading-4.5 font-medium text-gray-800">
              학습 진행률 {featured.progress}%
            </span>
          </div>
          {/* 클릭 시 해당 프로젝트로 이동. 텍스트 CTA(gray-500) + chevron */}
          <button
            type="button"
            onClick={() => router.push(`/projects/${featured.projectId}`)}
            className="flex w-fit items-center gap-1 text-[14px] leading-5 font-medium tracking-[-0.28px] text-gray-500 transition-colors hover:text-gray-600"
          >
            학습하러 가기
            <ChevronRightIcon className="size-4" />
          </button>
        </div>
      )}
    </GradientBackground>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
