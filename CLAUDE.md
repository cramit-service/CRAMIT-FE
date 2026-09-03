# Cramit Frontend — 프로젝트 개발 가이드

> 이 문서는 프로젝트에 참여하는 모든 개발자 및 AI 협업 도구(Claude Code 등)가
> 프로젝트의 전체 구조·표준·담당 경계를 정확히 이해하고
> 일관되게 구현하기 위한 기준 문서다.

---

## 1. 프로젝트 개요

**Cramit(크래밋)** 은 AI 기반 스마트 학습 어시스턴트다. 대학생이 강의자료(PDF)와
강의 녹음을 업로드하면 STT로 변환하고, AI가 이를 분석해 Markdown 요약본을
생성한다. 사용자는 강의자료와 요약본을 나란히 보며 학습하고, 페이지별 강의
재청취·메모·학습포인트를 활용한다. AI 챗봇과 시험 대비 TODO까지 하나의
프로젝트에서 관리하는 통합 학습 환경이 핵심 가치다.

**이 레포는 프론트엔드 전용이다.** (백엔드는 Spring Boot 별도 레포)

### 화면 흐름

랜딩 → 로그인/회원가입 → 홈(프로젝트 목록) → 프로젝트(학습/챗봇/TODO/공유)

- **인증**: 이메일 / 카카오 / 구글 로그인·회원가입, 프로필 관리
- **홈**: 프로젝트 생성·목록, 시험 일정 관리
- **프로젝트 생성**: PDF 업로드 → 녹음 → STT(비동기) → AI 요약 생성(비동기)
- **학습 화면**: 강의자료(좌) + 요약본(우) 분할, 드래그로 학습포인트/메모/AI질문,
  페이지별 강의 재청취
- **챗봇 / TODO / 공유**: AI 질의응답, 시험 대비 TODO, 프로젝트 공유(최대 3명)

---

## 2. 기술 스택

- Next.js (App Router) / TypeScript
- Tailwind CSS **v4** (설정은 `tailwind.config`가 아니라 `globals.css`의 `@theme`)
- 데이터: Fetch 래퍼 + TanStack Query
- 패키지 매니저: **npm**
- 배포: Vercel
- 백엔드 준비 전에는 `src/mocks`의 가짜 응답으로 개발

---

## 3. 폴더 구조 / 아키텍처

기능형(feature) 폴더 구조를 따른다. 각 기능은 자신의 components / hooks / api를
독립적으로 가지며, 여러 기능이 공유하는 것은 `shared`에 둔다.
src/
├── app/ # 라우팅 전용. page.tsx는 얇게 유지(features 조립만)
│ ├── (auth)/ # 로그인 전 레이아웃 그룹
│ └── (main)/ # 로그인 후 레이아웃 그룹
│ └── projects/[projectId]/ # 프로젝트 하위: study, chat, todo, share
├── features/ # 기능별 폴더 = 담당 경계
│ └── <기능>/
│ ├── components/ # 이 기능 전용 UI
│ ├── hooks/ # 이 기능 전용 훅
│ └── api.ts # 이 기능 전용 API 호출
├── shared/ # 공용 (여러 기능이 함께 사용)
│ ├── ui/ # 공통 컴포넌트 (Button, Input, Card, Modal)
│ ├── lib/ # apiClient, cn 등
│ ├── hooks/ # 공통 훅 (폴링 등)
│ └── types/ # 전역 API 타입 (api.ts)
└── mocks/ # 백엔드 대기용 가짜 데이터

- 기능 전용 코드는 `features/<기능>/`에, 공유 코드는 `shared/`에 둔다.
- `app/`의 `page.tsx`는 `features`에서 만든 걸 import해 조립만 한다.
- import 경로는 `@/` alias 사용 (`@/shared/ui/Button`).

---

## 4. 스타일 & 디자인 토큰 표준

### 4-1. 색상 (하드코딩 금지)

- **색상 하드코딩 절대 금지.** `bg-[#4dd8ff]` ❌ → `bg-secondary-400` ✅
- 모든 색·radius는 `globals.css`의 `@theme` 토큰을 클래스로 사용한다.
- 색 스케일: Primary(형광 연두) / Secondary(하늘색) / Gray, 각 100~900.

### 4-2. 색 역할 구분

| 색               | 토큰            | 용도                                               |
| ---------------- | --------------- | -------------------------------------------------- |
| Secondary (하늘) | `secondary-400` | 일반 확정 액션 — 다음/생성/업로드/확인             |
| Primary (연두)   | `primary-400`   | 시그니처 강조 — 핵심 CTA, 완료/성공, 브랜드 포인트 |
| Error            | `error`         | 삭제/위험 액션                                     |

색은 둘 다 적극 사용하되 위 역할을 지킨다. 한 화면 안에서 역할이 뒤섞이지 않게 한다.

### 4-3. 공통 컴포넌트 재사용

새로 만들지 말고 `shared/ui`의 것을 재사용한다.

- `Button`: `variant`(primary/danger/point/outline) + `size`(sm/md/lg) + `disabled`
- `Input`: `label` / `error`
- `Card`: `clickable`
- `Modal`: `open` / `onClose`

### 4-4. Figma → 코드 스케일 (0.72배)

Figma 시안은 **1920 캔버스 기준**이라 픽셀을 1:1로 옮기면 실제 화면에서 커진다. 옮길 때:

- **박스 지오메트리(높이·폭·패딩·gap·버튼 크기·radius 등 공간 값)는 Figma px × 0.72** 로 줄인다.
- **타이포(font-size)는 Figma px 그대로** 둔다(축소하지 않는다). `tracking`은 Figma % → px로 환산해 붙인다 (예: 18px에 -2% → `tracking-[-0.36px]`).
- 값에 정규 클래스가 있으면 정규 클래스(`leading-7`, `size-4.5`), 없으면 명시적 `[Npx]`를 쓴다. **린터 경고 0을 유지한다.**

이미 study/auth/landing 화면 전체에 적용돼 있다. 새 화면도 같은 규칙을 따른다.

### 4-5. 절대 위치 요소는 `relative` 부모를 반드시 둔다

`absolute`를 쓰는 요소(숨긴 input·툴팁·배지·장식 이미지 등)는 **가장 가까운 조상에 `relative`가 있어야 한다.** 없으면 위치 기준이 문서 최상위가 되고, `overflow`는 컨테이닝 블록 체인에 있는 조상만 자르므로 **스크롤 컨테이너를 탈출해 페이지 높이를 밀어낸다.**

- Tailwind의 `sr-only`에는 `position: absolute`가 포함돼 있다. 체크박스·라디오처럼 input을 숨기는 패턴이 특히 걸린다.
- 이 요소는 조상의 `scrollHeight`에 잡히지 않는다. 컨테이너 측정이 전부 정상인데 문서만 길다면 `absolute`를 의심한다.

### 4-6. 전역 쌓임 순서는 숫자가 아니라 이름으로 부른다

화면 전체에서 겹치는 `fixed`·`sticky` 요소는 `globals.css`의 유틸리티를 쓴다.

| 유틸리티   | 값  | 쓰는 곳                                |
| ---------- | --- | -------------------------------------- |
| `z-dim`    | 20  | 사이드바 펼침 딤                       |
| `z-nav`    | 30  | 사이드바, 챗독 패널                    |
| `z-float`  | 40  | 떠 있는 보조 컨트롤 (맨 위로, 챗독 탭) |
| `z-header` | 50  | 랜딩 sticky 헤더                       |
| `z-modal`  | 60  | 모달                                   |
| `z-splash` | 100 | 랜딩 스플래시                          |

**부모 안에서만 겹치는 것은 지역 `z-10`을 그대로 쓴다** — 드롭다운, 모달 닫기 버튼 등.
새 층이 필요하면 숫자를 새로 쓰지 말고 이 표에 추가한다.

---

## 5. Next.js App Router 규칙

- 상호작용(onClick·onChange·useState·useEffect·window 등)이 있는 파일은
  최상단에 `'use client'`를 붙인다.
- 공통 UI 컴포넌트는 클라이언트 컴포넌트로 둔다.
- `page.tsx`는 얇게, 로직은 `features`로 뺀다.

---

## 6. API / 데이터 표준

- **모든 서버 통신은 `apiClient`(shared/lib)를 거친다.** 컴포넌트에서 직접 `fetch` 금지.
- 서버 상태(로딩/에러/캐싱/폴링)는 TanStack Query로 관리한다.
- API 응답 타입은 `src/shared/types/api.ts`에 정의된 것을 사용한다.
- STT·AI요약·학습적용·TODO 생성은 비동기 처리이며, `/status`(READY/PROCESSING)를
  폴링해 완료를 감지한다. 폴링은 공통 훅으로 처리한다.
- 백엔드 준비 전에는 `src/mocks`의 가짜 응답으로 개발하고, 준비되면 교체한다.

---

## 7. 코드 컨벤션

- 여러 className 조합 시 `cn()` 유틸 사용 (`@/shared/lib/cn`).
- 조건부 스타일이 겹칠 땐 덮어쓰지 말고 삼항으로 분기한다.
- 저장 시 Prettier 자동 포맷 (설정: `.prettierrc`). 커밋 전 포맷 상태를 유지한다.
- 주석은 한국어로 작성한다.

---

## 8. 담당 경계 & 협업

프론트는 2인 협업이며, 기능(feature) 폴더로 담당을 나눈다.
다른 담당의 feature 폴더를 직접 수정하지 않고, 필요 시 협의한다.

| 영역        | 주요 feature                         | 비고                                                  |
| ----------- | ------------------------------------ | ----------------------------------------------------- |
| 학습 코어   | study, chat                          | 분할 학습 화면, 드래그 인터랙션, 오디오 (난이도 높음) |
| 플로우/부가 | auth, project, todo, share, settings | 인증·홈·업로드·설정 등                                |
| 공용        | shared/*                             | 변경 시 상대 담당 리뷰 필수                           |

> 실제 담당자 배정은 팀 논의에 따르며, 정해지면 이 표를 갱신한다.

### 협업 지점 (중요)

- **프로젝트 진입 레이아웃** (`app/(main)/projects/[projectId]/layout.tsx`):
  study·chat·todo·share가 공유하는 골격. 변경 시 양쪽 담당이 인지해야 한다.
- **공통 컴포넌트/타입** (`shared/`): 한쪽이 바꾸면 다른 쪽 화면에 영향을 준다.
  변경은 반드시 리뷰를 거친다.

---

## 9. 새 기능 추가 규칙

1. 기능 전용 코드는 `features/<기능>/`에 둔다. 공유가 필요하면 `shared/`로 올린다.
2. 색·radius는 토큰 클래스만 사용한다(하드코딩 금지).
3. 이미 있는 공통 컴포넌트(Button/Input/Card/Modal)를 우선 재사용한다.
4. 상호작용이 있으면 `'use client'`를 붙인다.
5. 서버 통신은 `apiClient` + TanStack Query로 하고, 타입은 `shared/types/api.ts`를 따른다.
6. 새 API 응답 타입이 필요하면 `shared/types/api.ts`에 먼저 정의한다.

---

## 10. 깃헙 협업

@CONTRIBUTING.md

- `main` 직접 push 금지, 브랜치 → PR.
- 작업 단위: 기능 하나 = PR 하나.
- `shared/` 변경 PR은 리뷰 필수.
