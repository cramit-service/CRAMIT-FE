'use client';
// src/features/chat/components/ChatBubble.tsx
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { SparkleIcon } from '@/features/chat/components/icons';
import { cn } from '@/shared/lib/cn';
import type { ChatMessage } from '@/shared/types/api';

// 접힌 높이. 시안은 264px 고정(×0.72 ≈ 190).
// 이 높이를 넘는 말풍선만 아래를 흐리게 덮고 "더 보기"를 붙인다.
const COLLAPSED_HEIGHT = 190;

// 대화 한 줄. 내 말은 오른쪽 연두, AI는 왼쪽 흰 말풍선이다(시안).
export function ChatBubble({ message }: { message: ChatMessage }) {
  const isMine = message.role === 'USER';
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  // 접었을 때 잘리는 내용이 있는지 붙는 순간 한 번 잰다.
  // 메시지는 한 번 들어오면 바뀌지 않으므로 다시 잴 일이 없다.
  const measure = useCallback((node: HTMLParagraphElement | null) => {
    if (node) setOverflows(node.scrollHeight > COLLAPSED_HEIGHT + 1);
  }, []);

  return (
    <li className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
      {/* AI 말풍선은 좌상단 반짝임이 말풍선 밖으로 걸치므로 자리를 따로 잡는다 */}
      {!isMine && (
        <SparkleIcon className="text-secondary-400 mt-1 mr-[-9px] size-[26px] shrink-0" />
      )}

      <div
        className={cn(
          'relative max-w-[85%] rounded-sm border-[0.5px] px-[14px] py-[9px]',
          isMine
            ? 'bg-primary-400 border-primary-200'
            : 'border-secondary-400 bg-white',
        )}
      >
        {/* 페이드를 본문 바로 아래 끝에 붙이려고 한 겹 감싼다.
            말풍선 기준으로 띄우면 "더 보기" 높이만큼 어긋나 글자 끝동이 남는다. */}
        <div className="relative">
          <p
            ref={measure}
            // 접힘 상태에서만 높이를 자른다. 펼치면 제한을 풀어 전문이 보인다.
            style={
              expanded || !overflows
                ? undefined
                : { maxHeight: COLLAPSED_HEIGHT }
            }
            className={cn(
              'text-[14px] leading-[22px] tracking-[-0.28px] whitespace-pre-line text-gray-800',
              !expanded && overflows && 'overflow-hidden',
            )}
          >
            {message.content}
          </p>

          {/* 잘린 지점을 말풍선 색으로 흐리게 덮는다(시안) */}
          {overflows && !expanded && (
            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-b to-55%',
                isMine ? 'to-primary-400' : 'to-white',
              )}
            />
          )}
        </div>

        {overflows && !expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="mt-1 flex items-center gap-1 text-[12px] leading-[18px] font-medium tracking-[-0.24px] text-gray-800 transition-opacity hover:opacity-70"
          >
            더 보기
            <ChevronDown className="size-3.5" />
          </button>
        )}
      </div>

      {/* AI 말풍선 오른쪽에 걸치는 캐릭터 (시안). 순수 장식이라 aria-hidden */}
      {!isMine && (
        <Image
          src="/images/Crait_Cat.svg"
          alt=""
          aria-hidden
          width={72}
          height={57}
          unoptimized
          // 말풍선이 relative라 그대로 두면 정적 배치인 캐릭터가 그 아래로 깔려
          // 꼬리만 삐져나온다. 같은 relative를 줘서 말풍선 위에 얹는다.
          className="pointer-events-none relative mt-auto ml-[-26px] h-9 w-auto shrink-0 select-none"
        />
      )}
    </li>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
