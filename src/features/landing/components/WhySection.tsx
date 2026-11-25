// src/features/landing/components/WhySection.tsx
import { cn } from '@/shared/lib/cn';
import { Desk } from './Desk';
import { Motion } from './Motion';
import styles from './motion.module.css';

// 불편 다섯 줄은 아래 다섯 장과 같은 순서다. 오른쪽 알약이 그걸 푸는 장으로 데려간다
const PAINS = [
  {
    tool: '녹음 앱 · 메모',
    say: '75분 녹음을 받아 적고 정리하는 데, 수업 시간만큼 또 씁니다.',
    to: '올리면, 끝.',
    href: '#upload',
  },
  {
    tool: 'PDF 뷰어 · 필기 앱',
    say: '자료와 정리가 다른 창에 있어서, 페이지를 맞추느라 계속 오갑니다.',
    to: '슬라이드 옆에, 요약.',
    href: '#read',
  },
  {
    tool: '녹음 앱',
    say: '“이거 시험에 나와요” 한 마디를 찾으려면, 녹음을 처음부터 다시 돌립니다.',
    to: '놓친 말은, 그 페이지에서 다시.',
    href: '#replay',
  },
  {
    tool: 'AI 챗봇',
    say: '물어보면 교과서 같은 답이 옵니다. 교수님이 든 예시는 모르니까요.',
    to: '모르면, 바로.',
    href: '#ask',
  },
  {
    tool: '캘린더 · 할 일 앱',
    say: '시험까지 며칠 남았는지, 뭐가 남았는지는 또 다른 앱에 있습니다.',
    to: 'D-5. 오늘 할 일만.',
    href: '#exam',
  },
];

export function WhySection() {
  return (
    <section
      id="why"
      aria-labelledby="why-title"
      className="mx-auto max-w-[1200px] scroll-mt-16 px-4 pt-24 pb-18 break-keep"
    >
      <div className="flex max-w-[760px] flex-col gap-4">
        <h2
          id="why-title"
          className="text-heading-lg leading-tight font-bold text-gray-800"
        >
          시험 공부 한 번에,
          <br />
          앱이 몇 개 열려 있나요?
        </h2>
        <p className="text-body-lg text-gray-500">
          녹음은 녹음 앱에, 자료는 PDF 뷰어에, 질문은 챗봇에. 시험 기간마다
          저희도 그랬습니다.
        </p>
      </div>

      <div className="mt-11">
        <Desk />
      </div>

      <Motion>
        <ul className="bg-surface mt-7 rounded-md border border-gray-100">
          {PAINS.map((pain, i) => (
            <li
              key={pain.href}
              className={cn(
                'grid gap-2 border-t border-gray-100 p-[18px] first:border-t-0 md:grid-cols-[170px_minmax(0,1fr)_auto] md:items-center md:gap-6 md:px-6 md:py-[22px]',
                styles.up,
              )}
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <span className="text-[13.5px] font-semibold text-gray-500">
                {pain.tool}
              </span>
              <p className="text-[19px] leading-normal text-gray-800">
                {pain.say}
              </p>
              <a
                href={pain.href}
                className="justify-self-start rounded-full border border-gray-100 px-3 py-2 text-[14px] font-semibold whitespace-nowrap text-gray-700 hover:bg-gray-100"
              >
                {pain.to}
              </a>
            </li>
          ))}
        </ul>
      </Motion>

      <div className="flex flex-col items-center gap-3.5 pt-18 text-center">
        <h2 className="text-heading-lg leading-tight font-bold text-gray-800">
          그래서 강의 하나에
          <br />다 모았습니다.
        </h2>
        <p className="text-body-lg max-w-[44ch] text-gray-500">
          자료와 녹음을 올리면, 나머지는 Cramit이 한 화면에 이어 붙입니다.
        </p>
      </div>
    </section>
  );
}
