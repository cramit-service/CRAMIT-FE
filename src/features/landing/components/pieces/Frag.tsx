// src/features/landing/components/pieces/Frag.tsx
import { cn } from '@/shared/lib/cn';

// 장면의 큰 조각을 담는 판. 앱 화면에서 떼어 낸 한 조각이 떠 있는 모양이다
export function Frag({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'bg-surface shadow-far text-body-sm w-full max-w-[560px] rounded-md border border-gray-100 p-4 text-gray-800',
        className,
      )}
    >
      {children}
    </div>
  );
}
