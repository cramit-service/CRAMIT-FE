// src/features/landing/components/pieces/ask.tsx
// 4장 · 모르면, 바로.
import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/Icon';
import { Frag } from './Frag';
import styles from '@/features/landing/components/motion.module.css';

// 요약에서 고른 문장을 AI에게 묻고, 이번 주 강의 예시로 답을 받는다
export function AskLead() {
  return (
    <Frag className="grid gap-3 p-6">
      <p className="px-0.5 py-1 leading-[26px] text-gray-700">
        퀀텀이 모든 CPU 버스트보다{' '}
        <mark
          className={cn(
            'from-sky-status/30 to-sky-status/30 bg-transparent bg-linear-to-r bg-no-repeat text-gray-800',
            styles.sweep,
          )}
        >
          길면 라운드 로빈은 FCFS와 같아진다
        </mark>
        .
      </p>
      <span
        className={cn(
          'bg-surface shadow-near flex h-9 items-center gap-1.5 justify-self-start rounded-md border border-gray-100 px-3 text-[14px] font-semibold',
          styles.pop,
        )}
        style={{ animationDelay: '1s' }}
      >
        <span className="text-sky-ink">
          <Icon name="sparkle" size={14} />
        </span>
        AI에게 질문
      </span>
      <div className="from-sky-pale to-lime-pale/40 grid gap-2.5 rounded-md bg-linear-to-br p-3.5">
        <span
          className={cn(
            'border-sky-status bg-surface max-w-[86%] justify-self-end rounded-sm border-l-[3px] px-2.5 py-1.5 text-[13.5px] leading-5 text-gray-700',
            styles.up,
          )}
          style={{ animationDelay: '1.7s' }}
        >
          길면 라운드 로빈은 FCFS와 같아진다
        </span>
        <span
          className={cn(
            'bg-well max-w-[86%] justify-self-end rounded-md px-3.5 py-2.5 text-[15px]',
            styles.up,
          )}
          style={{ animationDelay: '2.1s' }}
        >
          왜 같아져?
        </span>
        <div
          className={cn(
            'grid grid-cols-[22px_minmax(0,1fr)] items-start gap-2',
            styles.up,
          )}
          style={{ animationDelay: '2.8s' }}
        >
          <span className="text-sky-ink mt-1.5">
            <Icon name="sparkle" size={18} />
          </span>
          <p className="bg-surface rounded-md border border-gray-100 px-3.5 py-2.5 text-[15px] leading-[23px]">
            퀀텀이 버스트보다 길면 모든 프로세스가 퀀텀을 다 쓰기 전에 끝나요.
            선점이 한 번도 없으니 도착 순서대로 끝까지 실행돼요. 강의 3쪽 예시에
            q = 30ms를 넣으면 평균 대기 시간도 17ms로 같아요.
          </p>
        </div>
      </div>
    </Frag>
  );
}
