'use client';
// src/features/chat/components/ChatPanel.tsx
import { useEffect, useId, useRef, useState } from 'react';
import {
  useChatMessages,
  useSendChatMessage,
} from '@/features/chat/hooks/useChat';
import { ChatBubble } from '@/features/chat/components/ChatBubble';
import {
  CloseIcon,
  PaperclipIcon,
  SendIcon,
} from '@/features/chat/components/icons';
import {
  ATTACHMENT_ACCEPT,
  formatFileSize,
  validateAttachment,
} from '@/features/chat/lib/attachment';
import { mockSuggestedQuestions } from '@/mocks/chat';
import { ArrowUpIcon } from '@/features/study/components/viewer/icons';
import { Button } from '@/shared/ui/Button';

// 챗봇 패널 본문. 도크(열고 닫는 껍데기)는 ChatDock이 맡는다.
export function ChatPanel({
  projectId,
  open,
}: {
  projectId: string;
  open: boolean;
}) {
  // 닫혀 있는 동안에는 조회하지 않는다. 도크는 닫혀도 DOM에 남아 있다.
  const chatQuery = useChatMessages(projectId, open);
  const sendMutation = useSendChatMessage(projectId);
  const [draft, setDraft] = useState('');
  // 질문에 붙일 파일 1개와 검증 실패 문구.
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileErrorId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  // 올라갈 데가 없는데 "맨 위로"를 띄우면 눌러도 아무 일이 없다.
  const [canScrollUp, setCanScrollUp] = useState(false);

  const messages = chatQuery.data ?? [];
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
    // 대화가 영역을 넘겼을 때만 "맨 위로"를 띄운다(같은 시점에 재면 된다).
    setCanScrollUp(el.scrollHeight > el.clientHeight + 8);
  }, [messages.length, sending]);

  // 파일만 올리고 "이거 봐줘" 하는 흐름이 자연스러워 본문 없이 보내는 것도 허용한다.
  const send = (content: string) => {
    const text = content.trim();
    if ((!text && !file) || sending) return;
    setDraft('');
    setFile(null);
    setFileError(null);
    sendMutation.mutate({ content: text, file });
  };

  // 실패한 전송 입력. mutation이 마지막 mutate 인자를 그대로 들고 있어
  // 따로 보관하지 않아도 된다(File 객체까지 살아 있어 다시 고를 필요가 없다).
  const failed = sendMutation.isError ? sendMutation.variables : undefined;
  const failedLabel = failed
    ? [failed.file?.name, failed.content].filter(Boolean).join(' · ')
    : '';

  // draft·file은 건드리지 않는다. 실패한 사이에 새 질문을 쓰고 있을 수 있고,
  // 그걸 덮어쓰면 이번엔 방금 쓴 게 날아간다.
  const retry = () => {
    if (!failed || sending) return;
    sendMutation.mutate(failed);
  };

  // 고른 파일을 검증해 받아들이거나, 문구만 남기고 선택을 비운다.
  const pickFile = (picked: File | undefined) => {
    if (!picked) return;
    const message = validateAttachment(picked);
    setFileError(message);
    setFile(message ? null : picked);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 대화 영역 */}
      <div
        ref={listRef}
        // flex-col + 아래 버튼의 mt-auto 조합이라, 대화가 짧아도 "맨 위로"가
        // 시안처럼 대화 영역 우하단에 머문다(내용을 따라 위로 올라오지 않는다).
        className="relative flex min-h-0 flex-1 [scrollbar-width:thin] flex-col overflow-y-auto overscroll-contain px-7 pt-8 pb-4"
      >
        {chatQuery.isPending ? (
          <p className="pt-10 text-center text-[13px] text-gray-500">
            대화를 불러오는 중…
          </p>
        ) : chatQuery.isError ? (
          <div className="flex flex-col items-center gap-3 pt-10">
            <p className="text-center text-[13px] text-gray-600">
              대화를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => chatQuery.refetch()}
              disabled={chatQuery.isFetching}
            >
              {chatQuery.isFetching ? '다시 시도 중…' : '다시 시도'}
            </Button>
          </div>
        ) : messages.length === 0 ? (
          // mock은 인사말을 항상 포함하지만, 백엔드가 빈 배열을 주면 아무 안내도 없이
          // 빈 화면만 남는다. 로딩·에러와 마찬가지로 빈 상태도 말해 준다.
          <p className="pt-10 text-center text-[13px] text-gray-500">
            아직 주고받은 대화가 없어요. 궁금한 내용을 물어보세요.
          </p>
        ) : (
          <ul className="flex flex-col gap-5">
            {messages.map((message) => (
              <ChatBubble key={message.messageId} message={message} />
            ))}
            {sending && (
              <li className="flex justify-start">
                <p className="rounded-sm border-[0.5px] border-gray-300 bg-white px-[14px] py-[9px] text-[13px] leading-[22px] text-gray-500">
                  답변을 준비하고 있어요…
                </p>
              </li>
            )}
          </ul>
        )}

        {/* 추천 질문 (시안: 대화 영역 좌하단 흰 알약). 고정 바가 아니라 대화 흐름 안에 있어야
            말풍선을 가리지 않는다. 첫 질문 전에만 둔다. */}
        {!hasAsked && !chatQuery.isPending && !chatQuery.isError && (
          <div className="mt-5 flex flex-col items-start gap-2">
            {mockSuggestedQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => send(question)}
                disabled={sending}
                className="rounded-full border border-white bg-white px-4 py-1 text-[14px] leading-7 font-medium tracking-[-0.28px] text-gray-800 shadow-sm transition-colors hover:bg-gray-200 disabled:opacity-50"
              >
                {question}
              </button>
            ))}
          </div>
        )}

        {/* 맨 위로 (시안: 우하단 원형 버튼). mt-auto라 위 내용이 줄면 그만큼 내려온다 */}
        {canScrollUp && (
          <button
            type="button"
            onClick={() =>
              listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
            }
            aria-label="맨 위로"
            className="sticky bottom-0 mt-auto flex size-9 shrink-0 items-center justify-center self-end rounded-full border-2 border-gray-950 bg-white/80 text-gray-950 backdrop-blur transition-colors hover:bg-white"
          >
            <ArrowUpIcon className="h-[17px] w-[14px]" />
          </button>
        )}
      </div>

      {/* 입력창 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
        className="flex shrink-0 flex-col gap-2 border-t-[0.3px] border-gray-500 bg-gray-800 px-7 py-[14px]"
      >
        {/* 전송 실패 — 낙관적으로 넣었던 말풍선은 롤백돼 사라지므로, 여기서 말해주지 않으면
            보낸 게 조용히 없어진 것처럼 보인다. 입력은 지워진 뒤라 재시도는 여기서만 가능하다. */}
        {failed && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-sm border border-gray-500 bg-gray-700 px-2 py-1.5"
          >
            <span className="min-w-0 flex-1">
              <span className="text-error block text-[12px] leading-4.5 tracking-[-0.24px] break-keep">
                질문을 보내지 못했습니다.
              </span>
              <span className="block truncate text-[11px] leading-4 tracking-[-0.22px] text-gray-400">
                {failedLabel}
              </span>
            </span>
            <Button
              variant="dark"
              size="xs"
              onClick={retry}
              disabled={sending}
              className="shrink-0"
            >
              {sending ? '보내는 중…' : '다시 보내기'}
            </Button>
            <button
              type="button"
              onClick={() => sendMutation.reset()}
              aria-label="전송 실패 알림 닫기"
              className="shrink-0 text-gray-400 transition-colors hover:text-gray-100"
            >
              <CloseIcon className="size-3" />
            </button>
          </div>
        )}

        {/* 고른 파일 (시안 없음 — 미리보기 없이 이름·크기만 보여준다) */}
        {file && (
          <div className="flex max-w-full items-center gap-2 self-start rounded-sm border border-gray-500 bg-gray-700 px-2 py-1">
            <PaperclipIcon className="size-3.5 shrink-0 text-gray-300" />
            <span className="min-w-0 truncate text-[12px] leading-4.5 tracking-[-0.24px] text-gray-100">
              {file.name}
            </span>
            <span className="shrink-0 text-[11px] leading-4 tracking-[-0.22px] text-gray-400">
              {formatFileSize(file.size)}
            </span>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setFileError(null);
              }}
              aria-label="첨부 파일 빼기"
              className="shrink-0 text-gray-400 transition-colors hover:text-gray-100"
            >
              <CloseIcon className="size-3" />
            </button>
          </div>
        )}

        {/* 파일을 고른 직후 나타나는 문구라 보조기기가 바로 읽도록 alert로 둔다. */}
        {fileError && (
          <p
            id={fileErrorId}
            role="alert"
            className="text-error text-[12px] leading-4.5 tracking-[-0.24px] break-keep"
          >
            {fileError}
          </p>
        )}

        <div className="flex items-center gap-4">
          {/* 같은 파일을 뺐다가 다시 고르면 change가 안 뜬다. value를 비워 매번 뜨게 한다.
              sr-only는 position:absolute라 스크롤 컨테이너를 탈출한다 — hidden으로 둔다. */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ATTACHMENT_ACCEPT}
            className="hidden"
            onChange={(e) => {
              pickFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            aria-label="파일 첨부"
            aria-describedby={fileError ? fileErrorId : undefined}
            className="shrink-0 text-gray-400 transition-colors hover:text-gray-100 disabled:opacity-50 disabled:hover:text-gray-400"
          >
            <PaperclipIcon className="size-[18px]" />
          </button>

          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="질문 내용을 입력해 주세요."
            aria-label="질문 내용"
            className="min-w-0 flex-1 bg-transparent text-[14px] leading-6 font-medium tracking-[-0.28px] text-gray-300 outline-none placeholder:text-gray-300"
          />

          <button
            type="submit"
            disabled={(!draft.trim() && !file) || sending}
            aria-label="보내기"
            className="bg-secondary-400 flex size-[26px] shrink-0 items-center justify-center rounded-full text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <SendIcon className="size-[11px]" />
          </button>
        </div>
      </form>
    </div>
  );
}
