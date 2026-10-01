// src/shared/ui/pageShell.ts
// DESIGN.md §5 "Every page is inset by the same amount".

// 페이지 껍데기의 여백. 폭은 열(content-col·read-col)이 정하고, 이건 여백만 갖는다.
//
// 위아래가 같다 — 다르게 둘 이유를 어느 화면도 대지 못했다. 예전 값 넷(83·67·68·44)은
// 시안 px을 그대로 박은 것이라 §2 간격 목록 밖이었고, 목록 안이면서도 48/48과 40/32로
// 갈려 있었다.
//
// 가로는 좁은 화면에서만 쓴다. lg부터는 남는 폭이 여백을 갖는다(CLAUDE.md 4-4) —
// px-*로 주면 여백이 폭을 먹어서 열이 상한에 못 닿는다.
export const PAGE_PAD = 'px-4 pt-12 pb-12 md:px-8 lg:px-0';

/** 판을 나란히 놓는 작업 화면의 껍데기 (홈·학습·강의 목록). */
export const CONTENT_SHELL = `${PAGE_PAD} w-full lg:content-col`;
