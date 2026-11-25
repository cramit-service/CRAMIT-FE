// src/features/landing/components/ChapterSection.tsx
import { FeatureTour, type TourStep } from './FeatureTour';
import { Motion } from './Motion';

// 한 장 = 큰 장면 하나(제목이 말하는 것) + 같이 되는 기능을 실제 화면으로 하나씩(tour).
// 모든 장이 왼쪽 글·오른쪽 화면 한 가지 박자다. 아래 tour와 열 비율이 같아 세로로 줄이 맞는다
export function ChapterSection({
  id,
  label,
  title,
  body,
  lead,
  tour,
}: {
  id: string;
  label: string;
  title: string[];
  body: string;
  lead: React.ReactNode;
  tour: TourStep[];
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="mx-auto max-w-[1200px] scroll-mt-16 px-4 pt-14 pb-24 break-keep"
    >
      <div className="grid items-center gap-7 lg:min-h-[70vh] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        <div className="flex flex-col gap-3.5">
          <span className="text-label font-semibold text-gray-500">
            {label}
          </span>
          <h2
            id={`${id}-title`}
            className="text-heading-lg leading-tight font-bold text-gray-800"
          >
            {title.map((line, i) => (
              <span key={line} className="block">
                {line}
                {i < title.length - 1 && ' '}
              </span>
            ))}
          </h2>
          <p className="text-body-lg text-gray-500">{body}</p>
        </div>
        {/* 조각은 장식이다. 같은 내용을 옆 문장이 말한다 */}
        <Motion className="flex justify-center">
          <div aria-hidden className="flex w-full justify-center">
            {lead}
          </div>
        </Motion>
      </div>

      <FeatureTour steps={tour} />
    </section>
  );
}
