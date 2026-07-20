// src/features/study/components/SharedBoardPlaceholder.tsx

// 공유 강의일 때만 하단에 노출되는 '공유 게시판' 자리.
// 실제 채팅형 게시판 UI(멤버 메시지·파일 공유·입력창)는 share 담당이 채운다.
// 이번 이슈에서는 섹션 헤더 + 자리(placeholder)만 둔다.
export function SharedBoardPlaceholder() {
  return (
    <section className="mt-12">
      <div className="mb-4 flex flex-wrap items-baseline gap-2">
        <h2 className="text-xl font-bold text-gray-900">공유 게시판</h2>
        <span className="text-sm text-gray-500">
          이 과목을 함께 듣는 친구들만의 공간이에요. 노트와 필기를 공유해보세요.
        </span>
      </div>
      {/* TODO(share): 공유 강의 게시판(채팅형 UI)은 share 담당이 구현 예정 */}
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-100 p-10 text-center text-sm text-gray-500">
        공유 게시판은 공유 기능(share)에서 구현됩니다.
      </div>
    </section>
  );
}
