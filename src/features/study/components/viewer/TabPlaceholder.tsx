// src/features/study/components/viewer/TabPlaceholder.tsx

// 아직 채우지 않은 탭의 자리표시. PDF 탭과 같은 패널 크기를 유지해
// 탭을 바꿔도 화면이 출렁이지 않게 한다.
export function TabPlaceholder({ label }: { label: string }) {
  return (
    <section className="flex h-[590px] items-center justify-center rounded-md bg-gray-900">
      <p className="text-[14px] leading-[22px] font-medium tracking-[-0.28px] text-gray-500">
        {label}
      </p>
    </section>
  );
}
