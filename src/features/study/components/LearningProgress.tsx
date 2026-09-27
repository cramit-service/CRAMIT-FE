// src/features/study/components/LearningProgress.tsx

// 학습 진행률 (라벨 + 넓은 진행바). 상위에서 폭을 정하고, 이 컴포넌트는 폭을 꽉 채운다.
export function LearningProgress({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className="w-full">
      <div className="text-label mb-2 text-gray-500">
        학습 진행률 {clamped}%
      </div>
      {/* 트랙과 채움 모두 하늘이다. §2가 sky-pale을 "글자가 안 올라가는 상태면 —
          진행 트랙"으로 이미 적어 뒀고, 그 위의 채움이 sky-status다.
          채움이 bg-secondary-600이었는데 토큰에 없어서 진행바가 안 보이고 있었다.
          진행률은 시각적으로만 드러나므로 보조기기용 값을 함께 노출한다. */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-label="학습 진행률"
        className="bg-sky-pale h-1 w-full overflow-hidden rounded-full"
      >
        <div
          className="bg-sky-status h-full rounded-full transition-[width] duration-300"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
