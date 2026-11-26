// src/features/landing/components/FinalCtaSection.tsx
import { Button } from '@/shared/ui/Button';

export function FinalCtaSection() {
  return (
    <section className="px-4 pt-28 pb-24 text-center break-keep">
      <h2 className="text-heading-lg leading-tight font-bold text-gray-800">
        이번 시험부터,
        <br />
        Cramit.
      </h2>
      <div className="mt-8">
        <Button href="/login" size="2xl">
          무료로 시작하기
        </Button>
      </div>
    </section>
  );
}
