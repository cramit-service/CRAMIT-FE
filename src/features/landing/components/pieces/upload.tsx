// src/features/landing/components/pieces/upload.tsx
// 1장 · 올리면, 끝.
import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/Icon';
import { Frag } from './Frag';
import styles from '@/features/landing/components/motion.module.css';

function FileRow({
  kind,
  name,
  meta,
  delay,
}: {
  kind: 'PDF' | 'REC';
  name: string;
  meta: string;
  delay: number;
}) {
  return (
    <div
      className={cn(
        'bg-canvas flex items-center gap-3.5 rounded-md border border-gray-100 px-4 py-3.5',
        styles.inLeft,
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      <span
        className={cn(
          'grid size-11 shrink-0 place-items-center rounded-md font-mono text-[12px] font-bold',
          kind === 'PDF' ? 'bg-well text-gray-700' : 'bg-sky-pale text-sky-ink',
        )}
      >
        {kind}
      </span>
      <span className="flex flex-col">
        <b className="font-semibold">{name}</b>
        <span className="text-label text-gray-500">{meta}</span>
      </span>
    </div>
  );
}

function Result({ label, note }: { label: string; note?: string }) {
  return (
    <div className="flex items-center gap-3 font-semibold">
      {label}
      {note && (
        <span className="text-label font-normal text-gray-500">{note}</span>
      )}
      {/* 같은 칸에 두 말을 겹쳐 두고, 만드는 중 → 완성으로 바꾼다. 끝 상태는 완성이다 */}
      <span className="text-label ml-auto inline-grid font-medium">
        <span
          className={cn(
            'invisible col-start-1 row-start-1 flex items-center gap-1.5 justify-self-end text-gray-500',
            styles.busy,
          )}
        >
          <Icon name="bolt" size={14} />
          만드는 중
        </span>
        <span
          className={cn(
            'col-start-1 row-start-1 flex items-center gap-1.5 justify-self-end',
            styles.pop,
          )}
          style={{ animationDelay: '3.1s' }}
        >
          <span className="bg-lime-action grid size-5 place-items-center rounded-md">
            <Icon name="check" size={14} />
          </span>
          완성
        </span>
      </span>
    </div>
  );
}

export function UploadLead() {
  return (
    <Frag className="grid gap-3.5 p-6">
      <FileRow
        kind="PDF"
        name="5주차_CPU스케줄링.pdf"
        meta="2.1MB · 6쪽"
        delay={0}
      />
      <FileRow
        kind="REC"
        name="5주차_강의녹음.m4a"
        meta="68MB · 75분"
        delay={0.25}
      />
      <span
        className={cn('justify-self-center text-gray-400', styles.up)}
        style={{ animationDelay: '0.6s' }}
      >
        <Icon name="arrow-down" size={24} />
      </span>
      <div
        className={cn(
          'grid gap-2 rounded-md border border-gray-100 p-4',
          styles.up,
        )}
        style={{ animationDelay: '0.8s' }}
      >
        <Result label="원문 스크립트" note="페이지별로" />
        <Result label="AI 요약" />
      </div>
    </Frag>
  );
}
