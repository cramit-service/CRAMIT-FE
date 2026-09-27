// src/features/study/components/viewer/panel.ts

// 학습 뷰어 탭 4종(PDF·요약·원문 스크립트·TODO)이 공유하는 패널 크기·배경.
// 탭을 바꿔도 화면이 출렁이지 않아야 하므로 높이를 한곳에서만 정한다.
// 높이는 화면이 준 남은 공간을 그대로 채운다. 590px은 더 이상 목표치가 아니라 하한이다
// — 창이 짧아도 이 아래로는 안 줄어든다(그 밑으로 가면 어느 탭이든 내용이 안 보인다).
// 패널은 surface다. well로 뒀더니 판이 바닥 노릇을 하게 됐고, 그 위 컨트롤의 hover가
// 갈 자리가 없어졌다 — 흰 채움에 검정 8%를 얹은 값이 well과 ΔE 0.70이라 토글이 판에 녹았다.
// well을 파인 자리(검색칸·PDF 영역)로 되돌리고 판은 §2의 "카드·패널" 자리를 쓴다.
// 크림 배경과 ΔE 2.35라 판의 경계는 테두리가 진다 — §2가 "borders are not the default
// separator"라 했지만, 그건 기본값을 정한 것이지 경계가 필요한 자리를 막은 게 아니다.
// 그림자는 안 쓴다 — §2가 떠 있는 것에만 허락하고, 이 판은 떠 있지 않다.
export const VIEWER_PANEL =
  'bg-surface h-full min-h-[590px] rounded-md border border-gray-100';
