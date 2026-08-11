// src/features/landing/components/FinalCtaSection.tsx
import Link from 'next/link';
import { GradientBackground } from '@/shared/ui/GradientBackground';
import { ArrowUpRightIcon } from './icons';

// "맨 위로" 버튼은 이 섹션에 있었지만, 끝까지 내려와야만 보여서 ScrollTopButton으로 옮겼다.
// 남은 건 순수 표시용이라 서버 컴포넌트로 되돌린다.
export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden px-6 py-40">
      <GradientBackground layer />

      <div className="relative mx-auto max-w-2xl text-center">
        <h2 className="text-2xl leading-snug font-bold text-gray-900 md:text-4xl">
          수업은 끝났지만,
          <br />
          학습은 이제 시작입니다.
        </h2>
        <p className="mt-6 text-sm text-gray-700">
          크래밋이 여러분의 학습 효율성과 루틴을 찾아드립니다.
        </p>

        <Link
          href="/login"
          className="bg-secondary-400 hover:bg-secondary-500 mt-12 inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium text-gray-900 transition-colors"
        >
          크래밋 시작하기
          <ArrowUpRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
