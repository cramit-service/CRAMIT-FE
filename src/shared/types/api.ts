// src/shared/types/api.ts

/* ===== 공통 ===== */

// 에러 응답 (기획서 10.1)
export interface ApiError {
  error: {
    code: string; // 예: "AUTH_INVALID_TOKEN"
    message: string; // 사용자에게 보여줄 메시지
    status: number; // HTTP 상태 코드
  };
}

// 비동기 처리 상태 (STT·요약·적용·TODO 생성)
export type ProcessStatus = 'READY' | 'PROCESSING';

/* ===== User (기획서 7.3) ===== */

export interface User {
  userId: string;
  email: string;
  nickname: string;
  provider: 'EMAIL' | 'KAKAO' | 'GOOGLE';
  profileImage: string | null;
}

/* ===== 인증 (기획서 8.1) ===== */

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

/* ===== 온보딩 (약관 → 닉네임 → 요금제) ===== */

export type PlanId = 'FREE' | 'STANDARD' | 'PRO';

export interface NicknameCheckResponse {
  available: boolean;
}

// TODO: 백엔드 온보딩 등록 스펙 확정 시 필드명 재확인 필요
export interface OnboardingProfileRequest {
  nickname: string;
  agreedTermIds: string[];
  plan: PlanId;
}

/* ===== Project (기획서 7.3, 8.2) ===== */

export interface Project {
  projectId: string;
  title: string;
  createdAt: string; // ISO 날짜 문자열
}

/* ===== Chapter / 단계별 학습 (이슈 A) ===== */

// 챕터 학습 상태: 학습 전 / 학습 중 / 완료
export type ChapterStatus = 'BEFORE' | 'IN_PROGRESS' | 'DONE';

export interface Chapter {
  chapterId: string;
  projectId: string;
  chapterNumber: number;
  title: string; // 카드 본문 한 줄 (예: "알고리즘 기초 알아보기")
  createdAt: string; // ISO 날짜 문자열
  status: ChapterStatus;
  // 백엔드 확정 후 조정. 필드명 카멜/ID 타입은 기존 방침 따름
}

// 새 주차(챕터) 업로드 요청.
// 파일 2종은 선택이며, 실제 전송은 JSON이 아니라 multipart/form-data다.
// TODO: 백엔드 업로드 스펙 확정 시 필드명/필수 여부 재확인 필요
export interface CreateChapterRequest {
  projectId: string; // 어느 강의(프로젝트)에 붙일 주차인지
  title: string; // 주차 제목 (예: "알고리즘 기초 알아보기")
  lectureDate: string; // 주차 수강 날짜 (YYYY-MM-DD)
  professor: string | null; // 교수명 (선택)
  materialFile: File | null; // 강의 자료 PDF (선택)
  audioFile: File | null; // 강의 녹음 파일 (선택)
}

// 프로젝트 상세 헤더에 필요한 메타 (과목명 + 태그 + 시험 D-DAY + 공유 여부)
// TODO: 백엔드 프로젝트 상세 응답 스펙 확정 시 필드명 재확인 필요
export interface ProjectDetail extends Project {
  professor: string; // 교수명 (태그: "OOO 교수님")
  chapterCount: number; // 강의(챕터) 개수 (태그: "강의 N개")
  examName: string | null; // 시험명 (예: "중간고사")
  examDate: string | null; // 시험일 (YYYY-MM-DD) — D-DAY 계산용
  isShared: boolean; // 공유 강의 여부 (공유 게시판 노출 여부)
  sharedBy: string | null; // 공유자 이름 (태그: "OOO 님의 공유"). 내 강의면 null
}

/* ===== 학습 뷰어 / 강의자료 (이슈 B) ===== */

// 학습 뷰어 탭 4종. 이번 이슈에서 내용을 채우는 건 PDF뿐이고 나머지는 자리만 잡는다.
export type ViewerTab = 'PDF' | 'SUMMARY' | 'SCRIPT' | 'TODO';

// 챕터 하나에 딸린 강의자료(PDF + 녹음) 메타.
// TODO: 백엔드 스펙 확정 후 필드명/타입 재확인 필요.
export interface LectureMaterial {
  chapterId: string;
  pdfPageCount: number; // PDF 총 페이지 수
  audioDuration: number; // 녹음 길이(초). 예: 3662 = 61:02
  // TODO: pdfUrl / audioUrl(실제 렌더·재생용), 페이지↔오디오 구간 매핑은
  //       백엔드에서 내려주는 형태가 확정되면 여기에 추가한다.
}

/* ===== AI 강의 요약 (이슈 C) ===== */

// AI가 생성한 Markdown 요약본.
// TODO: 백엔드 스펙 확정 후 필드명/타입 재확인 필요.
export interface LectureSummary {
  chapterId: string;
  fileName: string; // 상단 바에 노출 (예: "알고리즘_Chapter 4 - ..._요약.md")
  markdown: string; // Markdown 원문 (조회 시 렌더, 편집 시 textarea 내용)
  updatedAt: string; // ISO 날짜 문자열
}

/* ===== 원문 스크립트 / STT (이슈 D) ===== */

// 스크립트 한 줄 — 발화가 시작된 시각(초)과 그 내용.
export interface ScriptSegment {
  atSec: number;
  text: string;
}

// PDF 한 페이지에 대응하는 스크립트 구간.
// 녹음을 PPT 페이지 단위로 끊어 묶은 것이라 페이지 번호가 곧 구간 식별자다.
export interface ScriptSection {
  page: number; // PDF 페이지 번호 (배지 "PDF P.01")
  startSec: number; // 구간 시작(초)
  endSec: number; // 구간 끝(초)
  title: string; // 구간 소제목
  segments: ScriptSegment[];
}

// 챕터 하나의 STT 원문 전체.
// TODO: 백엔드 STT 응답 스펙 확정 시 필드명/타입 재확인 필요.
export interface LectureScript {
  chapterId: string;
  sections: ScriptSection[];
}

/* ===== AI 챗봇 (기획서 8.7) ===== */

// 말한 쪽. 화면에선 내 말이 오른쪽 연두, AI가 왼쪽 흰 말풍선이다.
export type ChatRole = 'USER' | 'AI';

// 대화 한 줄.
// TODO: 백엔드 챗봇 응답 스펙 확정 시 필드명/타입 재확인 필요.
export interface ChatMessage {
  messageId: string;
  projectId: string;
  role: ChatRole;
  content: string;
  createdAt: string; // ISO 날짜 문자열
}

/* ===== Exam / 시험 일정 (기획서 7.3, 8.9) ===== */

export interface Exam {
  examId: string;
  projectId: string;
  title: string;
  lectureName: string | null;
  examDate: string; // YYYY-MM-DD
  memo: string | null;
  createdAt: string;
  progress: number; // 학습 진행률 0~100 (홈 학습 배너 표시용, 시험 일정과 함께 내려옴)
}

/* ===== Todo (기획서 7.3, 8.8) ===== */

export interface Todo {
  todoId: string;
  projectId: string;
  title: string;
  lectureName: string | null; // 강의명 — 표시 시 제목 앞에 붙인다 (시험 일정과 동일 규칙)
  dueDate: string; // YYYY-MM-DD
  dueTime: string | null;
  lectureId: string | null;
  memo: string | null;
  isCompleted: boolean;
}
