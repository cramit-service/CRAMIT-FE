// src/features/landing/components/IntroSection.tsx
import Image from 'next/image';

export function IntroSection() {
  return (
    // gray-100이 흰색 토큰이다
    <section className="bg-gray-100 px-6 py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-[2fr_3fr]">
        {/* Figma 시안 이미지(main_dashboard_1). 시안 비율이 3:2라 원본(4:3)을 잘라 맞춘다 */}
        <Image
          src="/landing/intro-desk.jpg"
          alt=""
          width={1200}
          height={900}
          className="aspect-3/2 w-full rounded-lg object-cover"
        />

        <div>
          <h2 className="text-2xl font-bold text-gray-900 md:text-4xl">
            아직도 벼락치기로 시험을 준비하나요?
          </h2>

          <div className="mt-10 space-y-5 text-sm leading-relaxed text-gray-700">
            <p>
              시험 기간마다 강의자료를 다시 찾고, 강의 녹음을 처음부터 다시
              듣고, 메모를 정리하며 시간을 허비하고 있지는 않나요?
            </p>
            <p>
              크래밋은 AI로 강의자료와 강의 녹음을 연결해 더 빠른 복습을
              지원합니다.
            </p>
            <p>
              흩어진 학습 자료를 하나로 모아 반복되는 정리 과정을 줄이고, 더
              계획적이고 효율적인 시험 준비가 가능합니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
