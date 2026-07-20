// src/mocks/data.ts
import type {
  Project,
  ProjectDetail,
  Chapter,
  Exam,
  Todo,
  User,
  LoginResponse,
} from '@/shared/types/api';

// 소셜 로그인 mock 응답 (백엔드 연동 전까지 사용)
export const mockLoginResponse: LoginResponse = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

export const mockUser: User = {
  userId: '1',
  email: 'test@cramit.com',
  nickname: '김진우',
  provider: 'EMAIL',
  profileImage: null,
};

export const mockProjects: Project[] = [
  { projectId: '1', title: '운영체제', createdAt: '2026-03-02T09:00:00Z' },
  { projectId: '2', title: '자료구조', createdAt: '2026-03-05T09:00:00Z' },
  {
    projectId: '3',
    title: '컴퓨터네트워크',
    createdAt: '2026-03-10T09:00:00Z',
  },
];

// 챕터 상세(단계별 학습) mock — 상태 3종(학습 전/중/완료)을 모두 포함한다.
// 완료 2 / 진행 2 / 학습전 2 → 학습 진행률 = 완료(2) / 전체(6) = 33%
// createdAt은 타임존(Z) 없이 두어 로컬 시각 그대로 "16:03"으로 표시되게 한다.
export const mockChapters: Chapter[] = [
  {
    chapterId: 'c1',
    projectId: '1',
    chapterNumber: 1,
    title: '알고리즘과 복잡도 개요',
    createdAt: '2026-07-01T16:03:00',
    status: 'DONE',
  },
  {
    chapterId: 'c2',
    projectId: '1',
    chapterNumber: 2,
    title: '정렬 알고리즘',
    createdAt: '2026-07-04T16:03:00',
    status: 'IN_PROGRESS',
  },
  {
    chapterId: 'c3',
    projectId: '1',
    chapterNumber: 3,
    title: '분할 정복',
    createdAt: '2026-07-08T16:03:00',
    status: 'BEFORE',
  },
  {
    chapterId: 'c4',
    projectId: '1',
    chapterNumber: 4,
    title: '알고리즘 기초 알아보기',
    createdAt: '2026-07-14T16:03:00',
    status: 'DONE',
  },
  {
    chapterId: 'c5',
    projectId: '1',
    chapterNumber: 5,
    title: '그래프 탐색',
    createdAt: '2026-07-16T16:03:00',
    status: 'IN_PROGRESS',
  },
  {
    chapterId: 'c6',
    projectId: '1',
    chapterNumber: 6,
    title: '최단 경로',
    createdAt: '2026-07-18T16:03:00',
    status: 'BEFORE',
  },
];

// 프로젝트 상세 헤더 mock (과목명·교수·시험 D-DAY 등)
// isShared=false / sharedBy=null → 내 강의. 공유 강의 게시판은 share 담당이 채운다.
export const mockProjectDetail: ProjectDetail = {
  projectId: '1',
  title: '알고리즘',
  createdAt: '2026-03-02T09:00:00Z',
  professor: '박지훈',
  chapterCount: 6,
  examName: '중간고사',
  examDate: '2026-07-20',
  isShared: false,
  sharedBy: null,
};

export const mockExams: Exam[] = [
  {
    examId: '1',
    projectId: '1',
    title: '중간고사',
    lectureName: '운영체제',
    examDate: '2026-04-20',
    memo: '3~7장 범위',
    createdAt: '2026-03-15T09:00:00Z',
  },
];

export const mockTodos: Todo[] = [
  {
    todoId: '1',
    projectId: '1',
    title: 'OSI 7계층 개념 학습',
    dueDate: '2026-04-15',
    dueTime: null,
    lectureId: null,
    memo: null,
    isCompleted: false,
  },
  {
    todoId: '2',
    projectId: '1',
    title: 'TCP/IP 정리',
    dueDate: '2026-04-16',
    dueTime: null,
    lectureId: null,
    memo: null,
    isCompleted: true,
  },
];
