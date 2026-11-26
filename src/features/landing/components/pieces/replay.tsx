// src/features/landing/components/pieces/replay.tsx
// 3장 · 놓친 말은, 그 페이지에서 다시.
import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/Icon';
import { Frag } from './Frag';
import styles from '@/features/landing/components/motion.module.css';

const LINES = [
  ['01:35', '먼저 무엇이 좋은 스케줄링인지 기준부터 봅시다.'],
  [
    '03:08',
    '대화형 시스템에서는 응답 시간이 제일 중요해요. 이거 시험에 나옵니다.',
  ],
  ['05:12', '처리량은 단위 시간에 끝내는 작업 수예요.'],
];

// 강의 자료 2쪽에 해당하는 녹음 구간과 그 원문. 재생 위치를 따라 줄이 켜진다
export function ReplayLead() {
  return (
    <Frag className="p-6">
      <div className="bg-well flex items-center gap-2.5 rounded-md py-2 pr-2 pl-3">
        <span className="bg-surface rounded-sm px-2 py-[5px] font-mono text-[13px] leading-none font-semibold">
          PDF P.02
        </span>
        <span className="text-label flex items-center gap-1.5 text-gray-700 tabular-nums">
          <Icon name="time" size={14} />
          01:35 – 06:50
        </span>
        <span className="bg-lime-action ml-auto grid size-8 place-items-center rounded-md">
          <Icon name="play" size={14} />
        </span>
      </div>
      <div className="bg-sky-pale mx-1 mt-3 mb-1.5 h-1 overflow-hidden rounded-full">
        <i
          className={cn(
            'bg-sky-status block h-full w-[42%] rounded-full',
            styles.bar,
          )}
        />
      </div>
      <ol className="grid gap-0.5">
        {LINES.map(([time, text], i) => (
          <li
            key={time}
            className={cn(
              'grid grid-cols-[52px_minmax(0,1fr)] gap-2 rounded-md p-2 text-gray-700',
              i === 1 && 'bg-lime-pale text-gray-800',
              styles.line,
            )}
            // 6초에 한 바퀴, 한 줄씩 2초. 음수 지연으로 셋이 서로 다른 박자에서 시작한다
            style={{ animationDelay: `${[0, -4, -2][i]}s` }}
          >
            <time className="text-label text-gray-500 tabular-nums">
              {time}
            </time>
            {text}
          </li>
        ))}
      </ol>
    </Frag>
  );
}
