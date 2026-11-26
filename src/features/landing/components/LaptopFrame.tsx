// src/features/landing/components/LaptopFrame.tsx
import Image from 'next/image';

// 앱 화면을 담는 노트북 틀. 틀은 public/landing/laptop-frame.svg로 그려 화면 위에 덮는다.
// 금속 광택·유리 반사 같은 섬세한 색이 토큰에 없어서 그림 파일로 뺐다.
// 화면 칸 위치는 그 SVG의 화면 자리(x110 y30 w1100 h687.5 / 1320×800)를 비율로 옮긴 것이다.
export function LaptopFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto aspect-[1320/800] w-full max-w-[1240px]">
      <div className="bg-canvas absolute top-[3.75%] left-[8.3333%] h-[85.9375%] w-[83.3333%] overflow-hidden">
        {children}
      </div>
      <Image
        src="/landing/laptop-frame.svg"
        alt=""
        fill
        unoptimized
        className="pointer-events-none select-none"
      />
    </div>
  );
}
