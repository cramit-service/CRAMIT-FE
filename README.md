<p align="center">
  <img width="220" height="220" alt="크래밋파비콘" src="https://github.com/user-attachments/assets/bb978ee9-d59c-41c8-957d-ca645d5e525f" />
</p>

<div>

## ⚡️ CRAMIT

> **"CRAM IT: Cram more in less time." <br> 더 적은 시간에, 더 많은 것을 머릿속에 채우다.**

</div>

<br>

## 📌 Cramit은 이런 서비스예요

> 대학생들은 강의자료, 강의 녹음, 필기, 개인 메모 등을 여러 플랫폼에 나누어 관리하며 시험 기간마다 다시 정리해야 하는 불편함을 겪는다. Cramit은 강의자료와 강의 녹음을 AI로 분석하여 자동 요약을 제공하고, 사용자가 학습하며 추가한 메모와 학습 포인트까지 함께 활용하는 통합 학습 환경을 제공하기 위해 개발되었다.

### 🔥 강의자료와 강의 녹음을 하나로

> PDF와 STT를 페이지 단위로 자동 매핑해, 원하는 페이지만 골라 다시 들을 수 있습니다

강의자료(PDF)를 업로드하고 강의를 녹음하면, 녹음 종료 즉시 STT가 자동 생성되고 강의자료 페이지와 STT 구간이 자동으로 매핑된다. '해당 페이지 수업 듣기' 버튼 하나로 필요한 구간만 빠르게 재청취할 수 있다.

### 🔥 AI 요약본 생성

> 강의자료(PDF)와 STT를 함께 분석하여 Markdown 형태의 요약본을 생성합니다

'요약본 생성' 버튼 클릭 시 AI가 강의자료와 STT를 종합 분석하여 페이지별 핵심 내용을 정리한 요약본을 생성한다. 교수가 강조한 내용은 별도로 표시된다.

### 🔥 메모와 학습 포인트

> 학습 중 남긴 메모와 학습 포인트가 챗봇·학습 계획에도 반영됩니다

요약본에서 원하는 텍스트를 드래그해 메모를 남기거나 학습 포인트를 생성할 수 있다. '학습 내용 적용' 버튼을 누르면 이 기록들이 프로젝트에 반영되어, 이후 AI 챗봇 답변과 학습 계획 생성에도 함께 활용된다.

### 🔥 AI가 도와주는 시험 대비 학습 플랜

> 시험 일정을 등록하면 AI가 날짜별 학습 계획(TODO)을 자동으로 만들어줍니다

시험 일정과 D-Day를 등록하면, 프로젝트의 학습 진도와 내용을 분석해 AI가 날짜별 학습 계획을 자동 생성한다. TODO는 AI 생성 외에 직접 추가·수정도 가능하다.

<br>

## 👤 CRAMIT의 구성원을 소개합니다!

| 역할 | 담당 |
|:---|:---|
| 🖥️ Frontend | 박태현 · 강준우 |
| ⌨️ Backend | 배서윤 · 엄정인 |
| 🎨 Design | 배서윤 |

<br>

## ⚙️ 기술 스택

| 구분 | 기술 | 용도 |
| --- | --- | --- |
| Language | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) | Frontend Application |
| Framework | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black) | React Framework (App Router) |
| Styling | ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white) | Utility-First CSS |
| Data Fetching | ![Fetch API](https://img.shields.io/badge/Fetch%20API-0769AD?style=for-the-badge) | REST API 통신 |
| Bundler | ![Turbopack](https://img.shields.io/badge/Turbopack-EF4444?style=for-the-badge) | Build & Dev Server |
| Code Quality | ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white) ![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black) | Lint & Formatting |
| Package Manager | ![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white) | Dependency Management |
| Deploy | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white) | Build & Deployment |

<br>

## 📁 프로젝트 구조

기능형(feature) 폴더 구조를 따릅니다. 각 기능은 자신의 `components` / `hooks` / `api`를 독립적으로 가지며, 여러 기능이 함께 쓰는 것은 `shared`에 둡니다.

```text
src/
├── app/                          # 라우팅 전용. page.tsx는 얇게 유지(features 조립만)
│   ├── (auth)/                   # 로그인 전 레이아웃 그룹
│   └── (main)/                   # 로그인 후 레이아웃 그룹
│       └── projects/[projectId]/ # 프로젝트 하위: study, chat, todo, share
├── features/                     # 기능별 폴더 = 담당 경계
│   └── <기능>/
│       ├── components/           # 이 기능 전용 UI
│       ├── hooks/                # 이 기능 전용 훅
│       └── api.ts                # 이 기능 전용 API 호출
├── shared/                       # 공용 (여러 기능이 함께 사용)
│   ├── ui/                       # 공통 컴포넌트 (Button, Input, Card, Modal)
│   ├── lib/                      # apiClient, cn 등
│   ├── hooks/                    # 공통 훅 (폴링 등)
│   └── types/                    # 전역 API 타입 (api.ts)
└── mocks/                        # 백엔드 대기용 가짜 데이터
```

- 기능 전용 코드는 `features/<기능>/`에, 공유 코드는 `shared/`에 둡니다.
- `app/`의 `page.tsx`는 `features`에서 만든 걸 import해 조립만 합니다.
- import 경로는 `@/` alias를 사용합니다 (`@/shared/ui/Button`).

<br>

## ⚙️ 실행 환경

- **Node 버전**: `20 이상`
- **패키지 매니저**: npm
- **여는 방법**

  ```bash
  git clone https://github.com/cramit-service/CRAMIT-FE.git
  cd CRAMIT-FE
  npm install
  ```

  `.env.example`을 복사해 `.env.local`을 만든 뒤 필요한 값을 입력합니다.

  ```bash
  cp .env.example .env.local
  ```

  > `.env.local`은 `.gitignore`에 포함되어 있습니다.

- **실행**

  ```bash
  npm run dev
  ```

  실행 후 [http://localhost:3000](http://localhost:3000)으로 접속합니다.

- **주요 명령어**

  | 명령어 | 설명 |
  | --- | --- |
  | `npm run dev` | 개발 서버 실행 |
  | `npm run build` | 프로덕션 빌드 |
  | `npm run start` | 빌드 결과물 실행 |
  | `npm run lint` | ESLint 검사 |

<br>

## 🔗 Git Convention

브랜치, 커밋, 이슈/PR 컨벤션은 [CONTRIBUTING.md](./CONTRIBUTING.md)를 참고해주세요.
