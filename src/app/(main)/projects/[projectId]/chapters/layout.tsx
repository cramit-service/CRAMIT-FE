import { ChatDock } from '@/features/chat/components/ChatDock';
import { toRouteId } from '@/shared/lib/routeId';

// 챗봇 도크는 주차 안에서만 뜬다 — 새 주차 등록과 학습 뷰어다.
// 주차 목록(/projects/[projectId])에는 없다: 물어볼 자료가 아직 화면에 없고,
// 그 화면에서 하는 일은 어느 주차로 들어갈지 고르는 것뿐이다.
//
// 조건 분기 대신 이 자리에 둔 이유는 라우터가 이미 경계를 그려 놨기 때문이다.
// chapters/ 아래가 정확히 "주차 안"이고, 폴더가 세그먼트이므로 이 layout은
// 그 두 라우트에만 걸린다. usePathname으로 가르면 레이아웃이 클라이언트가 되고
// 라우트가 하나 늘 때마다 그 조건문을 다시 읽어야 한다.
//
// 대화는 프로젝트 단위라 projectId를 내려준다.
// Next 16: params는 Promise이므로 await로 푼다.
export default async function ChaptersLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <>
      {children}
      {/* 탭과 패널이 둘 다 fixed라 children의 폭에도 흐름에도 영향이 없다. */}
      <ChatDock projectId={toRouteId(projectId)} />
    </>
  );
}
