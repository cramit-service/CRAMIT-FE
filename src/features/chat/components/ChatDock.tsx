'use client';
// src/features/chat/components/ChatDock.tsx
import { useState } from 'react';
import { ChatPanel } from '@/features/chat/components/ChatPanel';
import { cn } from '@/shared/lib/cn';
import { GradientBackground } from '@/shared/ui/GradientBackground';
import { Icon } from '@/shared/ui/Icon';

// 시안 패널 폭 707은 1920 캔버스의 36.82%다. 시안 px을 그대로 박으면 좁은 화면에서
// 차지하는 비율이 커지므로(1536에서 46%) 비율로 두고 시안값을 상한으로 삼는다.
// 세로 탭은 이 폭 바깥 왼쪽에 붙으므로 같은 값을 써야 한다.
const PANEL_WIDTH = 'min(707px, 36.82vw)';

// 프로젝트 하위 레이아웃에서만 노출되는 채팅 도크.
// 우측 화면 경계의 세로 탭을 누르면 챗봇 패널이 오버레이로 열린다(시안: 뒤 화면을 밀지 않는다).
export function ChatDock({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 우측 경계 세로 탭. 패널이 열리면 패널 왼쪽으로 붙는다.
          Figma: 32×107, top 262.
          채움이 bg-white + from-secondary-200/60 to-primary-300/30이었다 — 셋 다 §2에
          없는 이름이라 탭이 통째로 투명하게 렌더되고 테두리만 남아 있었다.
          흰 표면 위에 mesh-tab을 얹는다(값과 근거는 globals.css).
          테두리는 gray-700(3.9:1)이었는데 카드와 같은 gray-100으로 내린다 — 이 탭은
          페이지 위에 뜬 것이라 그림자가 경계를 만든다(§2의 near). */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? '채팅 닫기' : '채팅 열기'}
        aria-expanded={open}
        // 패널과 나란히 움직여야 한다. right(레이아웃)로 밀면 패널의 transform과
        // 다른 스레드에서 돌아 프레임이 어긋나므로, 탭도 같은 transform으로 옮기고
        // duration도 패널(300ms)에 맞춘다. 기본값은 150ms라 탭만 먼저 도착한다.
        className="bg-surface mesh-tab shadow-near z-float fixed top-[262px] right-0 flex h-[107px] w-8 flex-col items-center justify-center gap-1 rounded-l-md border-y border-l border-gray-100 text-gray-700 transition-transform duration-300"
        // 패널 폭이 상수라 Tailwind가 클래스를 미리 만들 수 없다. 이동량은 인라인으로 준다.
        style={{
          transform: open ? `translateX(calc(-1 * ${PANEL_WIDTH}))` : undefined,
        }}
      >
        {/* 세로쓰기에서 line-height는 줄 간격이 아니라 «글자 기둥의 두께»다(흐름에
            수직인 방향). 시안의 18을 임의값으로 박고 있었는데, text-label 자신의 22로도
            32폭 탭에 들어간다 — 실측해서 확인했다. */}
        <span className="text-label [writing-mode:vertical-rl]">
          {open ? '채팅닫기' : '채팅열기'}
        </span>
        {/* 꺾쇠를 text-[18px] 글자로 찍고 있었다. 화살표는 아이콘이다(CLAUDE.md 4-5) —
            열리면 오른쪽(닫기 방향), 닫히면 왼쪽을 가리킨다. */}
        <span aria-hidden className="flex">
          <Icon name={open ? 'arrow-right' : 'arrow-left'} size={16} />
        </span>
      </button>

      {/* 챗봇 패널 (오버레이). 열림/닫힘을 transform으로 전환한다.
          닫혀 있어도 화면 밖에 남아 있어 aria-hidden만으로는 내부 버튼에 탭 포커스가 들어간다.
          inert로 포커스·클릭 대상에서 함께 제외한다. */}
      <aside
        aria-hidden={!open}
        inert={!open}
        aria-label="AI 챗봇"
        style={{ width: PANEL_WIDTH }}
        className={cn(
          // bg-white가 토큰에서 지워져 패널이 통째로 투명하게 렌더되고 있었다 —
          // 오버레이인데 뒤 학습 화면이 그대로 비쳤다. 흰 표면의 이름은 surface다.
          // 테두리 gray-700은 카드와 같은 gray-100으로, 그림자는 §2의 두 단 중
          // 페이지 위에 뜨는 far로 바꾼다(shadow-xl은 토큰 밖이다).
          'bg-surface shadow-far z-nav fixed top-0 right-0 flex h-screen flex-col border-l border-gray-100 transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* 시안 배경(1129:365). from-primary-200/25 한 겹이었는데 §2에 없는 이름이라
            아무것도 안 그리고 있었다. 값과 근거는 globals.css의 mesh-dock에 있다. */}
        <GradientBackground layer variant="dock" />
        <div className="relative flex min-h-0 flex-1 flex-col">
          <ChatPanel projectId={projectId} open={open} />
        </div>
      </aside>
    </>
  );
}
