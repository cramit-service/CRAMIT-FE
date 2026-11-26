// src/features/landing/components/pieces/exam.tsx
// 5장 · D-5. 오늘 할 일만.
import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/Icon';
import { DdayBadge } from '@/features/exam/components/DdayBadge';
import { Frag } from './Frag';
import styles from '@/features/landing/components/motion.module.css';

function Todo({
  text,
  time,
  done,
}: {
  text: string;
  time: string;
  done?: boolean;
}) {
  return (
    <li className="flex items-center gap-3 rounded-md px-2 py-2.5">
      <span
        className={cn(
          'grid size-5 shrink-0 place-items-center rounded-sm border-[1.5px]',
          done
            ? cn(
                'bg-lime-action border-lime-action text-gray-800',
                styles.check,
              )
            : 'bg-surface border-gray-400 text-transparent',
        )}
      >
        <Icon name="check" size={12} />
      </span>
      {/* 취소선은 글자 길이만큼만 긋는다. 줄 전체가 아니라 안쪽 span에 붙인다 */}
      <span className="flex-1">
        <span
          className={cn(
            'relative',
            done
              ? cn(
                  'text-gray-500 after:absolute after:top-1/2 after:left-0 after:h-[1.5px] after:w-full after:bg-gray-500',
                  styles.strike,
                )
              : 'text-gray-800',
          )}
        >
          {text}
        </span>
      </span>
      <span className="text-label text-gray-500 tabular-nums">{time}</span>
    </li>
  );
}

// 시험까지 남은 날과 오늘 할 일. 첫 줄이 체크되며 지워진다
export function ExamLead() {
  return (
    <Frag className="p-6">
      <div className="flex items-center gap-3 rounded-md border border-gray-100 px-4 py-3.5">
        <DdayBadge days={5} />
        <b className="flex-1 font-semibold">운영체제 중간고사</b>
        <span className="text-label text-gray-500">11.23(월)</span>
      </div>
      <b className="mx-0.5 mt-[18px] mb-2 block text-[15px] font-bold text-gray-700">
        오늘 할 일
      </b>
      <ul className="grid gap-0.5">
        <Todo text="5주차 대기 시간 계산 연습" time="11:00" done />
        <Todo text="라운드 로빈 타임 퀀텀 영향 정리" time="15:00" />
        <Todo text="4주차 세마포어·뮤텍스 비교 복습" time="20:00" />
      </ul>
    </Frag>
  );
}
