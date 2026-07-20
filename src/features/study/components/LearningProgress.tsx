// src/features/study/components/LearningProgress.tsx

// 학습 진행률 (라벨 + 넓은 진행바). 상위에서 폭을 정하고, 이 컴포넌트는 폭을 꽉 채운다.
export function LearningProgress({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className="w-full">
      {/* #aeb1b6(gray-500), 진행바 왼쪽 끝에 맞춰 좌측 정렬 */}
      <div className="mb-1.5 text-[14px] leading-[22px] tracking-[-0.28px] text-gray-500">
        학습 진행률 {clamped}%
      </div>
      {/* 트랙 #f0f1f1(gray-200) / 채움 #aeb1b6(gray-500) */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-gray-500 transition-[width] duration-300"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
