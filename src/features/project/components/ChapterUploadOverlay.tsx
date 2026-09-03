'use client';
// src/features/project/components/ChapterUploadOverlay.tsx
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { GradientBackground } from '@/shared/ui/GradientBackground';
import { Logo } from '@/shared/ui/Logo';
import { cn } from '@/shared/lib/cn';

// 시안(1:5259 "로딩 화면-ver2")의 진행 표시는 CRAMIT 심볼 10개가 왼쪽부터 차오르는 모양이다.
const DOT_COUNT = 10;

// 심볼 한 개. 시안 그룹 export(300.364×31에 10개가 31px 간격)에서 글리프 하나를 그대로 떼어냈다.
function BoltGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 21.364 31"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M6.77647 0.855505C8.87141 -0.620313 11.7944 -0.138827 13.3058 1.9307L19.714 10.7061C20.4833 11.3577 21.0499 12.2591 21.2696 13.3194C21.3415 13.666 21.3707 14.0115 21.3644 14.3506C21.3968 15.8137 20.723 17.2638 19.4259 18.1778C18.5218 18.8148 17.4634 19.0859 16.4308 19.0235L12.7501 19.7588L15.6466 23.7246C17.1576 25.7942 16.6847 28.6686 14.5899 30.1446C12.495 31.6207 9.57108 31.139 8.05967 29.0694L1.36436 19.9014C0.742407 19.2788 0.288078 18.476 0.0967829 17.5528C0.0290198 17.2257 -0.00188412 16.8998 0.00010318 16.5791C-0.0095861 15.1401 0.663328 13.7216 1.93956 12.8223C2.65226 12.3201 3.46117 12.0441 4.27745 11.9805L8.53428 11.1299L5.71983 7.27543C4.20847 5.2058 4.68152 2.33159 6.77647 0.855505Z" />
    </svg>
  );
}

interface ChapterUploadOverlayProps {
  /** 화면 한가운데 문구. 생성/수정에 따라 달라진다. */
  message: string;
  /** 전송 진행률 0~1. */
  progress: number;
  onCancel: () => void;
}

// 주차 업로드 대기 화면 (Figma 1:5259).
// 200MB까지 올릴 수 있어 몇 분이 걸리기도 한다. 모달 안에 갇혀 기다리는 대신
// 시안대로 화면을 통째로 넘겨받아 진행률을 보여주고, 언제든 되돌릴 수 있게 한다.
//
// 사이드바(90px 레일)는 시안에서도 그대로 보인다 — 그 폭만 비우고 덮는다.
export function ChapterUploadOverlay({
  message,
  progress,
  onCancel,
}: ChapterUploadOverlayProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // 이 화면이 뜨면 조작할 수 있는 건 취소뿐이다. 포커스를 그리로 옮겨
  // 키보드 사용자가 Tab을 더듬지 않아도 되게 한다.
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  // 사이드바는 시안대로 보이지만 눌리지는 않아야 한다. 클릭은 아래 차단 층이 막고,
  // 키보드는 여기서 막는다 — Tab으로 배경 컨트롤에 닿으면 이 화면을 잃은 채 조작하게 되고
  // 그때 취소 버튼도 함께 사라진다. 지금 할 수 있는 건 취소뿐이라 늘 그리로 돌려보낸다.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      e.preventDefault();
      cancelRef.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // 뒤 페이지가 스크롤되면 덮여 있는데도 배경이 움직여 보인다. 모달과 같은 규칙으로 잠근다.
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // 진행률을 심볼 개수로 바꾼다. 아직 한 바이트도 못 보낸 상태에서 첫 칸이 차 보이면
  // 안 된 일을 됐다고 말하는 셈이라 내림으로 센다.
  const percent = Math.min(100, Math.max(0, Math.round(progress * 100)));
  const filled = Math.floor((percent / 100) * DOT_COUNT);

  return (
    <>
      {/* 클릭 차단 층. 시안은 사이드바를 그대로 보여주지만, 업로드 중에 사이드바를 누르면
          이 화면을 잃은 채 배경으로 빠져나가고 진행률·취소 버튼이 같이 사라진다.
          보이기는 하되 눌리지 않도록 화면 전체를 투명하게 덮는다. */}
      <div className="fixed inset-0 z-50" aria-hidden />

      {/* 그림은 시안대로 레일 폭만큼 비켜서 그린다 — 배경 그라데이션이 사이드바를 침범하지
          않아야 한다. left-22.5는 Sidebar의 접힘 폭(w-22.5)·main의 pl-22.5와 한 쌍이다. */}
      <div className="fixed inset-y-0 right-0 left-22.5 z-50">
        <GradientBackground layer />

        <div className="relative flex h-full flex-col">
          {/* 시안 상단 바 124px. 워드마크는 다른 화면과 같은 22px로 둔다. */}
          <div className="flex h-[124px] shrink-0 items-center justify-center">
            <Logo className="h-[22px] text-gray-950" />
          </div>

          {/* 시안에서 마스코트~심볼 묶음은 화면 정중앙이다. 위 로고 바만큼을 아래 여백으로
            돌려줘야 그 중심이 유지된다. 묶음 사이 간격은 시안 30px. */}
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[30px] pb-[124px]">
            {/* 시안 188.366×148. 리포에 이미 있는 마스코트 원본과 같은 벡터다. */}
            <Image
              src="/images/Crait_Cat.svg"
              alt=""
              width={188}
              height={148}
              priority
              unoptimized
              className="h-[148px] w-[188px] select-none"
            />

            <p className="text-heading-md text-center text-gray-800">
              {message}
            </p>

            {/* 심볼이 차오르는 걸 색으로만 알리지 않도록 진행률을 값으로도 노출한다.
              시안에 숫자는 없어서 화면에는 심볼만 두고 보조기기에만 읽힌다. */}
            <div
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuetext={`${percent}% 완료`}
              aria-label={message}
              className="flex items-center gap-[9.636px]"
            >
              {Array.from({ length: DOT_COUNT }, (_, index) => (
                <BoltGlyph
                  key={index}
                  className={cn(
                    'h-[31px] w-[21.364px] transition-colors duration-300',
                    index < filled ? 'text-gray-950' : 'text-gray-100',
                  )}
                />
              ))}
            </div>

            {/* 시안에는 없지만 필요하다 — 이게 없으면 큰 파일을 잘못 골랐을 때
              업로드가 끝날 때까지 화면을 벗어날 방법이 아예 없다. */}
            <button
              ref={cancelRef}
              type="button"
              onClick={onCancel}
              className="text-label focus-visible:ring-secondary-400 mt-2 rounded-sm px-2 py-1 text-gray-600 underline underline-offset-4 transition-colors hover:text-gray-800 focus-visible:ring-2 focus-visible:outline-none"
            >
              업로드 취소
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
