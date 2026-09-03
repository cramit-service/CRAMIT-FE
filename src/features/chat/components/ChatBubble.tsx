'use client';
// src/features/chat/components/ChatBubble.tsx
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { PaperclipIcon, SparkleIcon } from '@/features/chat/components/icons';
import { formatFileSize } from '@/features/chat/lib/attachment';
import { cn } from '@/shared/lib/cn';
import type { ChatMessage } from '@/shared/types/api';

// 접힌 높이(시안 고정값). 이 높이를 넘는 말풍선만 아래를 흐리게 덮고 "더 보기"를 붙인다.
const COLLAPSED_HEIGHT = 264;

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
    // 위로 솟는 반짝임이 말풍선 사이 간격(ul의 gap)을 먹지 않게 AI 행만 위를 띄운다.
    <li className={cn('flex', isMine ? 'justify-end' : 'justify-start pt-6')}>
      <div
        // 최대 폭이 좌우가 다르다 — 시안 대화 열 632 기준 AI 612(≈97%), 내 질문 262(≈41%).
        // cn엔 merge가 없어 max-w를 공통 문자열에 두고 덮어쓸 수 없다. 분기마다 완성된 세트로 준다.
        className={cn(
          'relative rounded-sm border-[0.5px] px-5 py-3',
          isMine
            ? 'bg-primary-400 border-primary-200 max-w-[41%]'
            : 'border-secondary-400 max-w-[97%] bg-white',
        )}
      >
        {/* 시안(36×36 @ x20,y102 / 말풍선 x20,y126): 반짝임의 왼쪽 변이 말풍선 왼쪽
            변과 맞고 위로 24px 솟아 모서리에 걸친다.
            말풍선의 자식이라야 배경 위에 그려진다 — 형제로 두면 relative인
            말풍선이 위에 깔려 겹친 부분이 가려진다. */}
        {!isMine && (
          <SparkleIcon className="text-secondary-400 absolute -top-6 left-0 size-9" />
        )}

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
            <PaperclipIcon className="size-5 shrink-0 text-gray-600" />
            <span className="text-body-sm min-w-0 truncate text-gray-800">
              {message.attachment.name}
            </span>
            <span className="text-label shrink-0 text-gray-600">
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
                'text-body-md whitespace-pre-line text-gray-800',
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
                  'pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-linear-to-b to-55%',
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
            className="text-body-sm mt-1 flex items-center gap-1 font-medium text-gray-800 transition-opacity hover:opacity-70"
          >
            더 보기
            <ChevronDown className="size-[19px]" />
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
          className="pointer-events-none relative mt-auto ml-[-36px] h-[50px] w-auto shrink-0 select-none"
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
