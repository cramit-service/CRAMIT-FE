'use client';
// src/features/chat/components/ChatBubble.tsx
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { PaperclipIcon, SparkleIcon } from '@/features/chat/components/icons';
import { formatFileSize } from '@/features/chat/lib/attachment';
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
        {/* 첨부 파일 (질문에 파일을 붙인 경우). 시안이 없어 미리보기 없이 칩으로만 둔다. */}
        {message.attachment && (
          <div
            className={cn(
              'mb-1.5 flex max-w-full items-center gap-1.5 rounded-sm border-[0.5px] px-2 py-1',
              isMine
                ? 'border-primary-200 bg-white/60'
                : 'border-secondary-400 bg-white',
            )}
          >
            <PaperclipIcon className="size-3.5 shrink-0 text-gray-600" />
            <span className="min-w-0 truncate text-[12px] leading-4.5 tracking-[-0.24px] text-gray-800">
              {message.attachment.name}
            </span>
            <span className="shrink-0 text-[11px] leading-4 tracking-[-0.22px] text-gray-600">
              {formatFileSize(message.attachment.size)}
            </span>
          </div>
        )}

        {/* 페이드를 본문 바로 아래 끝에 붙이려고 한 겹 감싼다.
            말풍선 기준으로 띄우면 "더 보기" 높이만큼 어긋나 글자 끝동이 남는다.
            파일만 보낸 질문은 본문이 없다 — 빈 문단이 여백만 만들지 않게 통째로 건너뛴다. */}
        {message.content && (
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
        )}

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
