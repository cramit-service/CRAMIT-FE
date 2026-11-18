// src/features/landing/components/LaptopFrame.tsx
// 앱 화면을 담는 노트북 틀. 실제 기기 사진·상표 없이 회색 토큰으로만 그린다.
// 화면 칸은 16:10이고 relative라, 안에 next/image fill을 그대로 넣으면 된다.
export function LaptopFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[1080px]">
      <div className="shadow-far relative rounded-t-[clamp(10px,1.8vw,22px)] bg-gray-800 p-[2.3%] pb-[2.5%] ring-1 ring-gray-700 ring-inset">
        {/* 카메라 */}
        <span
          aria-hidden
          className="absolute top-[0.95%] left-1/2 aspect-square w-[clamp(4px,0.5vw,7px)] -translate-x-1/2 rounded-full bg-gray-700"
        />
        <div className="bg-canvas relative aspect-[16/10] overflow-hidden rounded-sm">
          {children}
        </div>
      </div>
      {/* 받침. 화면보다 양옆으로 조금 넓고, 가운데 손톱 홈이 있다 */}
      <div className="relative -mx-[7%] h-[clamp(9px,1.5vw,20px)] rounded-[0_0_50%_50%/0_0_100%_100%] bg-linear-to-b from-gray-100 via-gray-200 to-gray-300">
        <span
          aria-hidden
          className="absolute top-0 left-1/2 h-[45%] w-[15%] -translate-x-1/2 rounded-b-[10px] bg-gray-200"
        />
      </div>
    </div>
  );
}
