'use client';
// src/features/chat/components/ChatBubble.tsx
import { useCallback, useState } from 'react';
import { formatFileSize } from '@/features/chat/lib/attachment';
import { cn } from '@/shared/lib/cn';
import type { ChatMessage } from '@/shared/types/api';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';

// 접기 전에 보여 주는 줄 수. 한 줄은 text-body-sm의 줄상자 24다(§3).
// 내 질문은 5줄 — 방금 내가 쓴 글이라 앞머리만 보이면 어느 질문인지 안다.
// AI 답은 11줄이다. 시안의 264px를 줄 수로 옮긴 값인데, 그 264는 본문이 20/30이던
// 시절의 8.8줄이라 지금 램프(16/24)에서는 11줄이 된다.
const LINE_HEIGHT = 24;
const VISIBLE_LINES = { mine: 5, ai: 11 };

// 대화 한 줄. 내 말은 오른쪽 연두, AI는 왼쪽 흰 말풍선이다(시안).
export function ChatBubble({ message }: { message: ChatMessage }) {
  const isMine = message.role === 'USER';
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  const collapsedHeight =
    (isMine ? VISIBLE_LINES.mine : VISIBLE_LINES.ai) * LINE_HEIGHT;

  // 접었을 때 잘리는 내용이 있는지 붙는 순간 한 번 잰다.
  // 메시지는 한 번 들어오면 바뀌지 않으므로 다시 잴 일이 없다.
  const measure = useCallback(
    (node: HTMLParagraphElement | null) => {
      if (node) setOverflows(node.scrollHeight > collapsedHeight + 1);
    },
    [collapsedHeight],
  );

  return (
    // 행마다 위 여백을 따로 주고 있었다 — AI는 반짝임(pt-6), 내 말은 고양이(pt-8).
    // 고양이가 없어졌고, 반짝임도 자리를 따로 얻을 필요가 없다: 말풍선 좌상단에서 24
    // 솟는데 바로 위 행은 오른쪽에 붙는 내 질문이라 가로로 겹칠 일이 없고, 그 24는
    // ul의 gap 안에 정확히 들어간다. 여백은 gap 하나가 갖는다.
    <li className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
      {/* 최대 폭이 좌우가 다르다. AI는 시안 그대로 97%, 내 질문은 60%다.

          시안은 41%(대화 열 632 기준 262)인데, 그 폭에서는 5줄 제한이 100자에서 걸린다 —
          두 문장짜리 질문이 이미 접힌다. 폭 제한의 목적은 «누가 한 말인지 보이게»이고
          AI가 97%로 고정된 지금 60%로도 그 일은 충분하다. 60%에서 158자까지 선다.
          (열 폭 658 기준 실측: 41%→100자 · 50%→126 · 60%→158 · 70%→186 · 97%→266)

          채움이 bg-primary-400 / bg-white였고 테두리가 primary-200 / secondary-400이라
          넷 다 §2에 없는 이름이었다 — 말풍선 둘이 통째로 투명하게 렌더되고 있었다.

          둘을 색이 아니라 표면으로 가른다. §2가 표면을 "밝기가 아니라 채움으로 나뉜다"고
          정했고, 색 넷(연두=누를 수 있는 것, 하늘=상태, 빨강=잘못됨, 주황=시간)에
          "누가 말했나"에 해당하는 칸이 없다.
          AI는 패널과 같은 surface라 테두리가 가장자리를 만들고(Card의 기본과 같은 이유),
          내 말은 그 위에서 한 단 내려간 well이다(ΔE 7.65라 자기 가장자리를 갖는다).
          테두리도 0.5가 아니라 1이다 — 제품의 다른 모든 테두리와 같은 굵기다.

          AI 폭은 max-w가 아니라 w다. 최대값으로 두면 내용이 폭을 정해서 답변마다
          말풍선이 달라진다 — 줄바꿈이 든 답은 599 대신 466으로 섰다. 답이 길 것을
          아는 쪽이라 자리를 미리 잡아 두는 편이 읽기에도 낫다.
          내 말은 그대로 max-w다. 짧은 질문이 빈 상자로 늘어날 이유가 없다. */}
      <div
        className={cn(
          'relative rounded-md px-5 py-3',
          isMine
            ? 'bg-well max-w-[60%]'
            : 'bg-surface w-[97%] border border-gray-100',
        )}
      >
        {/* 시안(36×36 @ x20,y102 / 말풍선 x20,y126): 반짝임의 왼쪽 변이 말풍선 왼쪽
            변과 맞고 위로 24px 솟아 모서리에 걸친다.
            말풍선의 자식이라야 배경 위에 그려진다 — 형제로 두면 relative인
            말풍선이 위에 깔려 겹친 부분이 가려진다. */}
        {!isMine && (
          <span className="text-sky-ink absolute -top-6 left-0">
            <Icon name="sparkle" size={36} />
          </span>
        )}

        {/* 첨부 파일 (질문에 파일을 붙인 경우). 시안이 없어 미리보기 없이 칩으로만 둔다. */}
        {message.attachment && (
          // 채움이 없다 — 말풍선 안에서 파일 하나를 알려 주는 줄이라 상자가 필요 없고,
          // 표면을 한 단 더 쌓으면 내 말과 AI 말에서 서로 다른 채움을 써야 했다.
          // 글자는 14, 아이콘은 그 옆 4px 단계인 16이다(§3 아이콘 규칙).
          <div className="mb-2 flex max-w-full items-center gap-2">
            <span className="flex shrink-0 text-gray-400">
              <Icon name="paperclip" size={16} />
            </span>
            <span className="text-label min-w-0 truncate text-gray-800">
              {message.attachment.name}
            </span>
            <span className="text-label shrink-0 text-gray-500">
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
                  : { maxHeight: collapsedHeight }
              }
              className={cn(
                // 20이었다. §3에서 20은 «카드·패널·섹션의 제목» 칸이고, 말풍선
                // 본문은 카드 안의 글이라 16이다. 제목 크기로 대화를 읽고 있었다.
                'text-body-sm whitespace-pre-line text-gray-800',
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
                  // 페이드는 말풍선 채움과 같은 색으로 끝나야 잘린 자리가 안 보인다.
                  isMine ? 'to-well' : 'to-surface',
                )}
              />
            )}
          </div>
        )}

        {overflows && !expanded && (
          // 날것 button이었다. 말풍선 안이라 작은 칸(sm)을 쓴다.
          <div className="mt-1">
            <Button
              rank="secondary"
              size="sm"
              onClick={() => setExpanded(true)}
            >
              더 보기
              <Icon name="arrow-down" size={16} />
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}
