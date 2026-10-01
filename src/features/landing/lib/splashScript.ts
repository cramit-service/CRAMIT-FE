// src/features/landing/lib/splashScript.ts
// 랜딩 스플래시를 세션당 1회만 보여주기 위한 장치.
//
// 읽기(판정)와 쓰기(기록)를 나눈다.
// - 판정: 첫 페인트 전에 끝나야 한다. 마운트 후 useEffect로 숨기면 재방문 때 한 번
//   번쩍인다. 그래서 루트 레이아웃 <head>의 인라인 스크립트로 둔다.
//   (React 컴포넌트가 렌더한 <script>는 클라이언트에서 실행되지 않아 쓸 수 없다.
//    next/script의 beforeInteractive도 self.__next_s 큐에 넣어 부트스트랩 이후에
//    실행하므로 no-flash 가드로는 늦다.)
// - 기록: 급할 게 없다. 이번 방문은 이미 보여주기로 결정됐고, 플래그는 '다음 로드'에서만
//   쓰인다. 그래서 실제로 스플래시를 띄운 LandingSplash가 마운트 후에 남긴다.
//
// 이렇게 나누면 head 스크립트가 읽기만 하므로 모든 라우트에서 돌아도 부작용이 없다.
// (랜딩만 걸러내려고 pathname을 보게 하면 라우팅 방식에 따라 어긋난다)
export const SPLASH_SEEN_KEY = 'cramit:splash';

export const SPLASH_READ_SCRIPT = `try{if(sessionStorage.getItem('${SPLASH_SEEN_KEY}')){document.documentElement.dataset.splash='seen'}}catch(e){}`;
