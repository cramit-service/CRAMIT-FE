// src/features/landing/components/LandingSplash.tsx
import { GradientBackground } from '@/shared/ui/GradientBackground';
import { Logo } from '@/shared/ui/Logo';

// 세션 안에서 이미 봤으면 <html data-splash="seen">를 찍어 스플래시를 아예 그리지 않는다.
// 마운트 후 useEffect로 숨기면 재방문 때 스플래시가 한 번 번쩍이므로,
// 첫 페인트 전에 끝나도록 오버레이보다 먼저 오는 인라인 스크립트로 판정한다.
const SKIP_IF_SEEN = `try{var d=document.documentElement;if(sessionStorage.getItem('cramit:splash')){d.dataset.splash='seen'}else{sessionStorage.setItem('cramit:splash','1')}}catch(e){}`;

// 랜딩 진입 스플래시 (Figma "메인화면").
// 워드마크는 헤더와 같은 자리에 두어 사라질 때 제자리에 남은 것처럼 보이게 하고,
// 큰 제목만 배경과 함께 걷힌다. 사라지는 동작은 CSS 애니메이션이라 상태가 필요 없다.
export function LandingSplash() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SKIP_IF_SEEN }} />
      <div
        data-splash-overlay
        aria-hidden
        className="animate-splash-out fixed inset-0 z-100"
      >
        <GradientBackground layer />

        {/* 헤더 로고와 같은 높이(h-16 헤더의 세로 중앙)에 맞춰 자리를 겹친다 */}
        <div className="relative flex h-16 items-center justify-center">
          <Logo className="h-[22px]" />
        </div>

        {/* Figma: 150px / Medium / leading 184 / tracking -3px.
            1920 기준 7.8vw라 vw로 두면 어느 폭에서도 시안 비율이 유지된다 */}
        <div className="relative flex h-[calc(100%-4rem)] items-center justify-center px-6">
          <p className="text-center text-[clamp(2.25rem,7.8vw,150px)] leading-[1.23] font-medium tracking-[-0.02em] text-gray-950">
            나만의 학습 어시스턴트
          </p>
        </div>
      </div>
    </>
  );
}
