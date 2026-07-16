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

/* ===== Project (기획서 7.3, 8.2) ===== */

export interface Project {
  projectId: string;
  title: string;
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
}

/* ===== Todo (기획서 7.3, 8.8) ===== */

export interface Todo {
  todoId: string;
  projectId: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  dueTime: string | null;
  lectureId: string | null;
  memo: string | null;
  isCompleted: boolean;
}
