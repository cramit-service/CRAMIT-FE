// src/features/study/components/viewer/TabPlaceholder.tsx
import { cn } from '@/shared/lib/cn';
import { VIEWER_PANEL } from './panel';

// 아직 채우지 않은 탭의 자리표시. PDF 탭과 같은 패널 크기를 유지해
// 탭을 바꿔도 화면이 출렁이지 않게 한다.
export function TabPlaceholder({ label }: { label: string }) {
  return (
    <section className={cn(VIEWER_PANEL, 'flex items-center justify-center')}>
      <p className="text-[14px] leading-[22px] font-medium tracking-[-0.28px] text-gray-500">
        {label}
      </p>
    </section>
  );
}
