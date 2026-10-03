'use client';
// src/features/chat/components/ChatPanel.tsx
import { useEffect, useId, useRef, useState } from 'react';
import {
  useChatMessages,
  useSendChatMessage,
} from '@/features/chat/hooks/useChat';
import { useParams } from 'next/navigation';
import { ChatBubble } from '@/features/chat/components/ChatBubble';
import { useChapter } from '@/features/study/hooks/useLectureMaterial';
import {
  ATTACHMENT_ACCEPT,
  formatFileSize,
  validateAttachment,
} from '@/features/chat/lib/attachment';
import { mockSuggestedQuestions } from '@/mocks/chat';
import { Button } from '@/shared/ui/Button';
import { FileInput } from '@/shared/ui/FileInput';
import { Icon } from '@/shared/ui/Icon';
import { IconButton } from '@/shared/ui/IconButton';
import { Textarea } from '@/shared/ui/Textarea';
import { ScrollArea } from '@/shared/ui/ScrollArea';

// 입력이 늘어날 수 있는 최대 줄 수. 그 뒤로는 칸이 스크롤한다.
const COMPOSER_MAX_ROWS = 5;

// 챗봇 패널 본문. 도크(열고 닫는 껍데기)는 ChatDock이 맡는다.
export function ChatPanel({
  projectId,
  open,
}: {
  projectId: number;
  open: boolean;
}) {
  // 닫혀 있는 동안에는 조회하지 않는다. 도크는 닫혀도 DOM에 남아 있다.
  const chatQuery = useChatMessages(projectId, open);
  const sendMutation = useSendChatMessage(projectId);
  const [draft, setDraft] = useState('');
  // 질문에 붙일 파일 1개와 검증 실패 문구.
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileErrorId = useId();
  const fileInputId = useId();

  // 이 대화가 어느 주차에서 열렸는지. 도크는 chapters/ 아래에서만 뜨므로 라우트가 안다 —
  // 서버에 물을 것이 없다(ChatMessage에 chapterId 자체가 없다).
  const params = useParams<{ chapterId?: string }>();
  const chapterId = params?.chapterId;
  const { data: chapter } = useChapter(projectId, Number(chapterId));
  // 주차 제목이다. 이 대화가 어느 주차에 걸려 있는지 사람이 알아보는 건 번호가 아니라
  // 제목이라서 — 길면 상한에서 잘린다(아래 max-w + truncate).
  const scopeLabel = chapter?.title ?? null;
  const listRef = useRef<HTMLDivElement>(null);

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
          ) : messages.length === 0 ? (
            // mock은 인사말을 항상 포함하지만, 백엔드가 빈 배열을 주면 아무 안내도 없이
            // 빈 화면만 남는다. 로딩·에러와 마찬가지로 빈 상태도 말해 준다.
            <p className="text-body-sm pt-10 text-center text-gray-500">
              아직 주고받은 대화가 없어요. 궁금한 내용을 물어보세요.
            </p>
          ) : (
            // gap-7(28)이었고 거기에 행마다 위 여백이 더 붙어 실제 간격이 52~60이었다.
            // 28은 §2 간격 목록에도 없다. 24 하나로 두면 AI 반짝임이 솟는 24가 이 안에
            // 정확히 들어가서, 행이 여백을 따로 갖지 않아도 된다.
            <ul className="flex flex-col gap-6">
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
            말풍선을 가리지 않는다. 첫 질문 전에만 둔다. */}
          {!hasAsked && !chatQuery.isPending && !chatQuery.isError && (
            <div className="mt-5 flex flex-col items-start gap-2">
              {/* 알약(rounded-full)에 죽은 border-white·bg-white를 얹고 있었다.
                  §4가 모서리로 둘을 가른다 — 알약은 상태를 들고, 6은 일을 한다.
                  추천 질문은 누르면 그 질문이 보내지는 «일»이라 2순위 버튼이다. */}
              {mockSuggestedQuestions.map((question) => (
                <Button
                  key={question}
                  rank="secondary"
                  size="sm"
                  onClick={() => send(question)}
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
        {failed && (
          <div
            role="alert"
            className="bg-well flex items-center gap-2 rounded-md px-2 py-1.5"
          >
            <span className="min-w-0 flex-1">
              <span className="text-body-sm text-red-ink block break-keep">
                질문을 보내지 못했어요.
              </span>
              <span className="text-label block truncate text-gray-500">
                {failedLabel}
              </span>
            </span>
            <Button rank="secondary" onClick={retry} disabled={sending}>
              {sending ? '보내는 중…' : '다시 보내기'}
            </Button>
            <IconButton
              name="close"
              aria-label="전송 실패 알림 닫기"
              rank="plain"
              onClick={() => sendMutation.reset()}
            />
          </div>
        )}

        {/* 고른 파일 (시안 없음 — 미리보기 없이 이름·크기만 보여준다).
            채움이 없다 — 파일 하나를 알려 주는 줄이지 누르는 것도 담는 것도 아니라
            상자가 필요 없다. 채움을 걷으면서 그 채움을 위해 있던 radius·여백도 같이 지웠다.
            글자는 14, 아이콘은 그 옆 4px 단계인 16이다(§3 아이콘 규칙). */}
        {file && (
          <div className="flex max-w-full items-center gap-2 self-start">
            <span className="flex shrink-0 text-gray-400">
              <Icon name="paperclip" size={16} />
            </span>
            <span className="text-label min-w-0 truncate text-gray-800">
              {file.name}
            </span>
            <span className="text-label shrink-0 text-gray-500">
              {formatFileSize(file.size)}
            </span>
            <IconButton
              name="close"
              aria-label="첨부 파일 빼기"
              rank="plain"
              onClick={() => {
                setFile(null);
                setFileError(null);
              }}
            />
          </div>
        )}

        {/* 파일을 고른 직후 나타나는 문구라 보조기기가 바로 읽도록 alert로 둔다. */}
        {fileError && (
          <p
            id={fileErrorId}
            role="alert"
            className="text-body-sm text-red-ink break-keep"
          >
            {fileError}
          </p>
        )}

        {/* 합성 입력 — 위에 글, 아래 줄에 컨트롤. 상자 하나가 필드이고 그 안의
            textarea는 투명하게 깔린다(fieldStyle의 FIELD_BOX와 같은 구조).
            그래서 포커스 테두리도 상자가 focus-within으로 받는다. */}
        <div className="bg-well focus-within:border-sky-ink flex flex-col gap-2 rounded-md border border-transparent px-4 py-3 transition-colors duration-150 ease-out">
          <Textarea
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
            placeholder="질문 내용을 입력해 주세요."
            aria-label="질문 내용"
          />

          <div className="flex items-center gap-2">
            {/* 파일 고르기. FileInput은 sr-only라 포커스를 자기가 갖고, 누르는 자리는
                이 label이 만든다 — 클릭을 흉내 내는 버튼이 없다.
                relative 필수 — sr-only가 position:absolute다 (CLAUDE.md 4-6). */}
            <label
              htmlFor={fileInputId}
              className="focus-within:ring-sky-ink relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-500 transition-colors focus-within:ring-2 hover:bg-gray-100 hover:text-gray-800"
            >
              <FileInput
                id={fileInputId}
                accept={ATTACHMENT_ACCEPT}
                disabled={sending}
                onPick={pickFile}
                aria-label="파일 첨부"
                aria-describedby={fileError ? fileErrorId : undefined}
              />
              <Icon name="plus" size={16} />
            </label>

            {/* 이 대화가 걸려 있는 자리. 지금은 주차 하나에 고정이라 읽기만 한다 —
                고를 수 있게 하려면 전송 요청에 chapterId가 생겨야 한다(백엔드 대기).
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
                disabled={(!draft.trim() && !file) || sending}
              />
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
