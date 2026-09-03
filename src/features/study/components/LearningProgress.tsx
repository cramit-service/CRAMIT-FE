// src/features/study/components/LearningProgress.tsx

// 학습 진행률 (라벨 + 넓은 진행바). 상위에서 폭을 정하고, 이 컴포넌트는 폭을 꽉 채운다.
export function LearningProgress({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className="w-full">
      {/* #aeb1b6(gray-500), 진행바 왼쪽 끝에 맞춰 좌측 정렬 */}
      <div className="text-label mb-1.5 text-gray-500">
        학습 진행률 {clamped}%
      </div>
      {/* 트랙 #f0f1f1(gray-200) / 채움 #aeb1b6(gray-500).
          진행률은 시각적으로만 드러나므로 보조기기용 값을 함께 노출한다. */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-label="학습 진행률"
        className="h-1 w-full overflow-hidden rounded-full bg-gray-200"
      >
        <div
          className="h-full rounded-full bg-gray-500 transition-[width] duration-300"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
