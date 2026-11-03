'use client';
// src/features/chat/components/ChatPanel.tsx
import { useEffect, useRef, useState } from 'react';
import { isNoContextError } from '@/features/chat/api';
import {
  useChatThread,
  useSendChatMessage,
} from '@/features/chat/hooks/useChat';
import { ChatBubble } from '@/features/chat/components/ChatBubble';
import { useChatDock } from '@/shared/hooks/useChatDock';
import { splitQuote, withQuote } from '@/shared/lib/quote';
import {
  CHAT_GREETING,
  QUOTE_QUESTIONS,
  SUGGESTED_QUESTIONS,
} from '@/features/chat/lib/starter';
import { useChapter } from '@/features/study/hooks/useLectureMaterial';
import { Button } from '@/shared/ui/Button';
import { IconButton } from '@/shared/ui/IconButton';
import { Textarea } from '@/shared/ui/Textarea';
import { ScrollArea } from '@/shared/ui/ScrollArea';

// 입력이 늘어날 수 있는 최대 줄 수. 그 뒤로는 칸이 스크롤한다.
const COMPOSER_MAX_ROWS = 5;

// 챗봇 패널 본문. 도크(열고 닫는 껍데기)는 ChatDock이 맡는다.
export function ChatPanel({
  projectId,
  chapterId,
  open,
}: {
  projectId: number;
  chapterId: number;
  open: boolean;
}) {
  // 닫혀 있는 동안에는 조회하지 않는다. 도크는 닫혀도 DOM에 남아 있다.
  const chatQuery = useChatThread(chapterId, open);
  const sendMutation = useSendChatMessage(chapterId);
  const [draft, setDraft] = useState('');
  // 학습 뷰어에서 [AI에게 질문]으로 넘어온 글. 다음 질문 하나에만 붙는다.
  const { quote, setQuote } = useChatDock();
  const draftRef = useRef<HTMLTextAreaElement>(null);

  // 인용이 붙으면 바로 질문을 쓸 수 있게 입력칸으로 간다.
  useEffect(() => {
    if (quote && open) draftRef.current?.focus();
  }, [quote, open]);

  const { data: chapter } = useChapter(projectId, chapterId);
  // 주차 제목이다. 이 대화가 어느 주차에 걸려 있는지 사람이 알아보는 건 번호가 아니라
  // 제목이라서 — 길면 상한에서 잘린다(아래 max-w + truncate).
  const scopeLabel = chapter?.title ?? null;
  const listRef = useRef<HTMLDivElement>(null);

  const messages = chatQuery.data?.messages ?? [];
  // 대화를 불러오기 전에 보내면 기존 세션을 모른 채 새 세션을 만든다.
  const ready = chatQuery.isSuccess;
  // 답을 기다리는 동안 추천 질문을 계속 눌러 질문이 겹치지 않게 막는다.
  const sending = sendMutation.isPending;
  // 추천 질문은 말문을 트라고 있는 것이다. 한 번이라도 질문했으면 할 일을 다 했고,
  // 계속 남으면 대화 영역만 잡아먹는다. (낙관적 반영이라 보내는 즉시 참이 된다)
  const hasAsked = messages.some((message) => message.role === 'USER');

  // 새 말풍선이 보이는 영역 밖에 생기면 보낸 줄도, 답이 온 줄도 모른다.
  // mutate 콜백에서 스크롤하면 아직 새 말풍선이 그려지기 전이라 예전 높이로 움직인다.
  // 목록이 실제로 바뀐 뒤(렌더 후)에 맨 아래로 붙인다.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    // 인용이 붙으면 인용용 추천 질문이 대화 맨 아래에 생긴다. 그것도 보이게 내린다.
  }, [messages.length, sending, quote]);

  // 추천 질문을 눌러 보낼 때는 쓰던 질문(draft)을 지우지 않는다.
  const send = (content: string, fromDraft = true) => {
    const text = content.trim();
    if (!text || sending || !ready) return;
    if (fromDraft) setDraft('');
    setQuote(null);
    sendMutation.mutate(quote ? withQuote(quote, text) : text);
  };

  // 인용이 붙어 있으면 그 글에 맞는 추천 질문을 다시 띄운다(이미 질문했어도).
  const suggestions = quote ? QUOTE_QUESTIONS : SUGGESTED_QUESTIONS;
  const showSuggestions = quote !== null || !hasAsked;

  // 실패한 전송 입력. mutation이 마지막 mutate 인자를 그대로 들고 있어
  // 따로 보관하지 않아도 된다.
  const failed = sendMutation.isError ? sendMutation.variables : undefined;
  const noContext = isNoContextError(sendMutation.error);

  // draft는 건드리지 않는다. 실패한 사이에 새 질문을 쓰고 있을 수 있고,
  // 그걸 덮어쓰면 이번엔 방금 쓴 게 날아간다.
  const retry = () => {
    if (failed === undefined || sending) return;
    sendMutation.mutate(failed);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 대화 영역. 여백은 스크롤 칸이 아니라 안쪽 내용이 갖는다 — 막대가 그 여백 위에 선다.
          relative·flex·flex-col·min-h-full이 붙어 있었는데 전부 "맨 위로" 버튼의 것이었다
          (mt-auto로 우하단에 붙이고 sticky로 띄우던 자리). 버튼이 없어져 넷 다 할 일이
          없어졌다 — 자식 위치가 한 픽셀도 안 움직이는 것을 확인하고 지웠다. */}
      <ScrollArea ref={listRef}>
        <div className="px-6 pt-[50px] pb-6">
          {chatQuery.isPending ? (
            <p className="text-body-sm pt-10 text-center text-gray-500">
              대화를 불러오는 중…
            </p>
          ) : chatQuery.isError ? (
            <div className="flex flex-col items-center gap-3 pt-10">
              <p className="text-body-sm text-center text-gray-700">
                대화를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
              </p>
              <Button rank="secondary" onClick={() => chatQuery.refetch()}>
                다시 시도
              </Button>
            </div>
          ) : (
            // gap-7(28)이었고 거기에 행마다 위 여백이 더 붙어 실제 간격이 52~60이었다.
            // 28은 §2 간격 목록에도 없다. 24 하나로 두면 AI 반짝임이 솟는 24가 이 안에
            // 정확히 들어가서, 행이 여백을 따로 갖지 않아도 된다.
            <ul className="flex flex-col gap-6">
              <ChatBubble message={CHAT_GREETING} />
              {messages.map((message) => (
                <ChatBubble key={message.messageId} message={message} />
              ))}
              {sending && (
                <li className="flex justify-start">
                  {/* AI 말풍선이 잠깐 서 있는 자리라 ChatBubble과 같은 상자여야 한다.
                      bg-white가 죽어 투명했고 테두리도 0.5px·gray-300으로 달랐다. */}
                  <p className="text-body-sm bg-surface rounded-md border border-gray-100 px-5 py-3 text-gray-700">
                    답변을 준비하고 있어요…
                  </p>
                </li>
              )}
            </ul>
          )}

          {/* 추천 질문 (시안: 대화 영역 좌하단 흰 알약). 고정 바가 아니라 대화 흐름 안에 있어야
            말풍선을 가리지 않는다. 첫 질문 전, 또는 인용이 붙었을 때만 둔다. */}
          {showSuggestions && !chatQuery.isPending && !chatQuery.isError && (
            <div className="mt-5 flex flex-col items-start gap-2">
              {/* 알약(rounded-full)에 죽은 border-white·bg-white를 얹고 있었다.
                  §4가 모서리로 둘을 가른다 — 알약은 상태를 들고, 6은 일을 한다.
                  추천 질문은 누르면 그 질문이 보내지는 «일»이라 2순위 버튼이다. */}
              {suggestions.map((question) => (
                <Button
                  key={question}
                  rank="secondary"
                  size="sm"
                  onClick={() => send(question, false)}
                  disabled={sending}
                >
                  {question}
                </Button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 입력창 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
        // bg-gray-800이었다. §2에 어두운 표면이 없다 — 패널이 surface이므로 입력 바는
        // 그 위에서 경계선 하나로 갈리고, 그 안의 칸이 well로 내려간다.
        // 테두리 0.3px도 걷는다(제품의 다른 테두리와 같은 1).
        className="bg-surface flex shrink-0 flex-col gap-2 border-t border-gray-100 px-6 py-5"
      >
        {/* 전송 실패 — 낙관적으로 넣었던 말풍선은 롤백돼 사라지므로, 여기서 말해주지 않으면
            보낸 게 조용히 없어진 것처럼 보인다. 입력은 지워진 뒤라 재시도는 여기서만 가능하다. */}
        {failed !== undefined && (
          <div
            role="alert"
            className="bg-well flex items-center gap-2 rounded-md px-2 py-1.5"
          >
            <span className="min-w-0 flex-1">
              <span className="text-body-sm text-red-ink block break-keep">
                {noContext
                  ? '이 주차는 아직 요약본이 없어 답할 수 없어요.'
                  : '질문을 보내지 못했어요.'}
              </span>
              <span className="text-label block truncate text-gray-500">
                {splitQuote(failed).question}
              </span>
            </span>
            {!noContext && (
              <Button rank="secondary" onClick={retry} disabled={sending}>
                {sending ? '보내는 중…' : '다시 보내기'}
              </Button>
            )}
            <IconButton
              name="close"
              aria-label="전송 실패 알림 닫기"
              rank="plain"
              onClick={() => sendMutation.reset()}
            />
          </div>
        )}

        {/* 다음 질문에 붙을 인용 (프리뷰 보드 H). 한 줄로 자르고, 빼면 그냥 질문이 된다. */}
        {quote && (
          <div className="flex max-w-full items-center gap-2">
            <span className="text-label bg-well shrink-0 rounded-md px-2 py-0.5 font-medium text-gray-700">
              인용
            </span>
            <span className="text-label min-w-0 flex-1 truncate text-gray-700">
              {quote}
            </span>
            <IconButton
              name="close"
              aria-label="인용 빼기"
              rank="plain"
              onClick={() => setQuote(null)}
            />
          </div>
        )}

        {/* 합성 입력 — 위에 글, 아래 줄에 컨트롤. 상자 하나가 필드이고 그 안의
            textarea는 투명하게 깔린다(fieldStyle의 FIELD_BOX와 같은 구조).
            그래서 포커스 테두리도 상자가 focus-within으로 받는다. */}
        <div className="bg-well focus-within:border-sky-ink flex flex-col gap-2 rounded-md border border-transparent px-4 py-3 transition-colors duration-150 ease-out">
          <Textarea
            ref={draftRef}
            bare
            maxRows={COMPOSER_MAX_ROWS}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              // Enter로 보내고 Shift+Enter로 줄을 늘린다. 조합 중(한글 중간 글자)에는
              // Enter가 조합을 확정하는 키라 가로채면 글자가 잘린다.
              if (
                e.key !== 'Enter' ||
                e.shiftKey ||
                e.nativeEvent.isComposing
              ) {
                return;
              }
              e.preventDefault();
              send(draft);
            }}
            placeholder={
              quote
                ? '이 부분에 대해 무엇이 궁금한가요?'
                : '질문 내용을 입력해 주세요.'
            }
            aria-label="질문 내용"
          />

          <div className="flex items-center gap-2">
            {/* 이 대화가 걸려 있는 주차. 세션이 주차에 묶여 있어 읽기만 한다.
                well 위라 한 단 올라간 surface를 쓴다. */}
            {scopeLabel && (
              <span className="text-label bg-surface max-w-40 truncate rounded-md px-2 py-0.5 text-gray-700">
                {scopeLabel}
              </span>
            )}

            <span className="ml-auto flex shrink-0">
              <IconButton
                name="send"
                type="submit"
                aria-label="보내기"
                rank="primary"
                disabled={!draft.trim() || sending || !ready}
              />
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
