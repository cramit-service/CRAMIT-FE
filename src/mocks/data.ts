// src/mocks/data.ts
import type {
  Project,
  ProjectDetail,
  Chapter,
  Exam,
  LectureMaterial,
  LectureSummary,
  Todo,
  User,
  LoginResponse,
} from '@/shared/types/api';
import { dateFromToday } from '@/shared/lib/date';

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

// 학습 뷰어(PDF 강의 자료 탭) mock — Figma 시안값 그대로 12페이지 / 61:02.
export const mockLectureMaterial: LectureMaterial = {
  chapterId: 'c4',
  pdfPageCount: 12,
  audioDuration: 3662, // 61분 2초
};

// 학습 뷰어(AI 강의 요약 탭) mock — 백엔드 요약 생성이 붙기 전까지 쓰는 Markdown 원문.
// 제목/목록/표/코드/인용을 모두 넣어 렌더 스타일이 한 번에 확인되게 한다.
export const mockLectureSummary: LectureSummary = {
  chapterId: 'c4',
  fileName: '알고리즘_Chapter 4 - 알고리즘 기초 알아보기_요약.md',
  markdown: `# Chapter 4 - 알고리즘 기초 알아보기

## 1. 알고리즘이란

**알고리즘(Algorithm)** 은 문제를 해결하기 위한 명확한 절차의 모음이다.
같은 문제를 풀더라도 절차를 어떻게 설계하느냐에 따라 걸리는 시간과 메모리가 크게 달라진다.

좋은 알고리즘이 갖춰야 할 조건은 다음 다섯 가지다.

1. **입력** — 0개 이상의 입력을 받는다
2. **출력** — 1개 이상의 결과를 만든다
3. **명확성** — 각 단계가 모호하지 않다
4. **유한성** — 반드시 유한한 단계 안에 끝난다
5. **효율성** — 자원(시간·공간)을 낭비하지 않는다

> 프로그램 = 자료구조 + 알고리즘. 자료를 어떻게 담을지와 어떻게 다룰지는 항상 함께 결정된다.

## 2. 시간 복잡도와 점근 표기법

입력 크기 \`n\`이 커질 때 연산 횟수가 어떻게 늘어나는지를 나타낸 것이 **시간 복잡도**다.
상수항과 계수는 무시하고 가장 빠르게 증가하는 항만 남긴다.

| 표기 | 이름 | 대표 예시 |
| --- | --- | --- |
| O(1) | 상수 시간 | 배열 인덱스 접근 |
| O(log n) | 로그 시간 | 이진 탐색 |
| O(n) | 선형 시간 | 순차 탐색 |
| O(n log n) | 선형 로그 시간 | 병합 정렬, 퀵 정렬(평균) |
| O(n²) | 이차 시간 | 버블 정렬, 선택 정렬 |

- **빅오(O)** 는 최악의 경우 상한을 나타낸다
- **빅오메가(Ω)** 는 최선의 경우 하한을 나타낸다
- **빅세타(Θ)** 는 상한과 하한이 같을 때 쓴다

## 3. 예시로 보는 복잡도 차이

같은 "배열에서 값 찾기"라도 정렬 여부에 따라 선택할 수 있는 전략이 달라진다.

\`\`\`python
# 순차 탐색 — O(n)
def linear_search(arr, target):
    for i, value in enumerate(arr):
        if value == target:
            return i
    return -1

# 이진 탐색 — O(log n), 단 정렬된 배열이어야 한다
def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
\`\`\`

원소가 100만 개일 때 순차 탐색은 최악에 100만 번을 비교하지만,
이진 탐색은 약 20번이면 끝난다.

## 4. 공간 복잡도

시간만이 자원은 아니다. **공간 복잡도**는 알고리즘이 추가로 사용하는 메모리 양이다.

- 입력 외에 상수 개의 변수만 쓰면 O(1) — *제자리(in-place)* 알고리즘이라 부른다
- 재귀 호출은 호출 스택을 쓰므로 깊이만큼 공간을 더 쓴다
- 시간과 공간은 대개 **트레이드오프** 관계다 (예: 메모이제이션)

## 5. 핵심 정리

- 알고리즘의 성능은 입력이 커질 때의 **증가율**로 판단한다
- 점근 표기법은 상수와 낮은 차수 항을 버리고 지배항만 남긴다
- 자료가 정렬돼 있는지 같은 **전제 조건**이 선택 가능한 알고리즘을 결정한다
- 다음 챕터에서는 정렬 알고리즘을 종류별로 비교한다
`,
  updatedAt: '2026-07-14T16:03:00',
};

// 다가오는 시험 일정 mock — D-DAY / D-1~3 / D-4+ 색이 언제 켜도 한 번에 보이도록,
// 고정 날짜가 아니라 "오늘 기준" 상대 날짜로 생성한다. (시간이 지나도 mock을 안 고쳐도 됨)
// 과거 1건(어제)은 getExams의 "다가오는" 필터에서 빠지는지 확인하려고 남겨둔다.
export const mockExams: Exam[] = [
  {
    examId: '1',
    projectId: '1',
    title: '중간고사',
    lectureName: '운영체제론',
    examDate: dateFromToday(0), // 오늘 → D-DAY (빨강)
    memo: '3~7장 범위',
    createdAt: '2026-07-01T09:00:00Z',
  },
  {
    examId: '2',
    projectId: '3',
    title: '퀴즈 2회',
    lectureName: '컴퓨터네트워크',
    examDate: dateFromToday(1), // 내일 → D-1 (노랑)
    memo: null,
    createdAt: '2026-07-02T09:00:00Z',
  },
  {
    examId: '3',
    projectId: '2',
    title: '중간고사',
    lectureName: '자료구조',
    examDate: dateFromToday(3), // D-3 (노랑)
    memo: '실습 과제 범위 포함',
    createdAt: '2026-07-03T09:00:00Z',
  },
  {
    examId: '4',
    projectId: '1',
    title: '기말 대비 모의고사',
    lectureName: '운영체제론',
    examDate: dateFromToday(8), // D-8 (파랑)
    memo: null,
    createdAt: '2026-07-04T09:00:00Z',
  },
  {
    examId: '5',
    projectId: '1',
    title: '쪽지시험',
    lectureName: '운영체제론',
    examDate: dateFromToday(-1), // 어제 → "다가오는" 필터에서 제외되어야 함(경계 확인)
    memo: null,
    createdAt: '2026-04-01T09:00:00Z',
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
