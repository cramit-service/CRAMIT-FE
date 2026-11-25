// src/features/landing/components/HeroSection.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/shared/ui/Button';
import { LaptopFrame } from '@/features/landing/components/LaptopFrame';

export function HeroSection() {
  return (
    <section className="px-4 pt-16 pb-16 break-keep sm:pt-24">
      <div className="text-center">
        <h1 className="text-heading-lg leading-tight font-bold text-balance text-gray-800">
          강의 하나로,
          <br />
          시험까지.
        </h1>
        <p className="text-body-lg mt-5 font-medium text-gray-700">
          요약부터 시험 준비까지, 한 곳에서.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
          <Button href="/login" size="2xl">
            무료로 시작하기
          </Button>
          <Link
            href="#why"
            className="text-body-md font-medium text-gray-800 hover:text-gray-700"
          >
            더 알아보기 ›
          </Link>
        </div>
      </div>

      <div className="relative isolate mx-auto mt-14 max-w-[1200px]">
        {/* 노트북 뒤 은은한 연두 빛 */}
        <div
          aria-hidden
          className="from-lime-action/30 absolute inset-x-[10%] top-[8%] bottom-0 -z-10 bg-radial to-transparent to-70% blur-3xl"
        />
        <LaptopFrame>
          <Image
            src="/landing/screen-study.webp"
            alt="Cramit 학습 화면. 왼쪽에 강의 PDF, 오른쪽에 AI 요약이 나란히 열려 있다."
            fill
            priority
            sizes="(max-width: 1112px) 92vw, 1030px"
            className="object-cover object-left-top"
          />
        </LaptopFrame>
      </div>
    </section>
  );
}
