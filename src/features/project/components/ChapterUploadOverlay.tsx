'use client';
// src/features/project/components/ChapterUploadOverlay.tsx
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { Button } from '@/shared/ui/Button';
import { GradientBackground } from '@/shared/ui/GradientBackground';
import { Logo } from '@/shared/ui/Logo';
import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/Icon';

// 시안(1:5259 "로딩 화면-ver2")의 진행 표시는 CRAMIT 심볼 10개가 왼쪽부터 차오르는 모양이다.
const DOT_COUNT = 10;

// 시안 상단 바 높이. 아래 여백이 같은 값을 써야 마스코트 묶음이 화면 정중앙에 선다 —
// 둘이 한 상수를 보게 두어 한쪽만 바뀌는 일을 막는다. 고른 값이 아니라 시안에서 온
// 치수라 §2 간격 목록의 대상이 아니다(§5 "컴포넌트 내부 치수는 시안 px").
const TOP_BAR_HEIGHT = 124;

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
      <div className="z-modal fixed inset-0" aria-hidden />

      {/* 그림은 시안대로 레일 폭만큼 비켜서 그린다 — 배경 그라데이션이 사이드바를 침범하지
          않아야 한다. 폭은 사이드바·main 좌패딩과 같은 --sidebar-w를 본다. */}
      <div className="z-modal fixed inset-y-0 right-0 left-[var(--sidebar-w)]">
        <GradientBackground layer />

        <div className="relative flex h-full flex-col">
          {/* 워드마크는 다른 화면과 같은 22px로 둔다. */}
          <div
            style={{ height: TOP_BAR_HEIGHT }}
            className="flex shrink-0 items-center justify-center"
          >
            <Logo height={22} />
          </div>

          {/* 시안에서 마스코트~심볼 묶음은 화면 정중앙이다. 위 로고 바만큼을 아래 여백으로
            돌려줘야 그 중심이 유지된다.
            묶음 사이는 시안 30인데 §2 간격 목록에 없어 32로 올린다. */}
          <div
            style={{ paddingBottom: TOP_BAR_HEIGHT }}
            className="flex min-h-0 flex-1 flex-col items-center justify-center gap-8"
          >
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
              // 시안은 심볼 31에 간격 9.636이다. 둘 다 체계 밖이라 32와 8로 옮긴다 —
              // 31은 4px 배수가 아니라 스트로크가 반픽셀에 걸리고(§3), 9.636은 §2
              // 간격 목록에 없다. 줄 전체 폭은 396.7 → 392로 5px만 줄어든다.
              className="flex items-center gap-2"
            >
              {Array.from({ length: DOT_COUNT }, (_, index) => (
                <span
                  key={index}
                  className={cn(
                    'transition-colors duration-300',
                    index < filled ? 'text-gray-800' : 'text-gray-100',
                  )}
                >
                  <Icon name="bolt" size={32} />
                </span>
              ))}
            </div>

            {/* 시안에는 없지만 필요하다 — 이게 없으면 큰 파일을 잘못 골랐을 때
              업로드가 끝날 때까지 화면을 벗어날 방법이 아예 없다. */}
            <Button
              ref={cancelRef}
              rank="secondary"
              size="sm"
              onClick={onCancel}
            >
              업로드 취소
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
