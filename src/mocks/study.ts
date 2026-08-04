// src/mocks/study.ts — 학습(챕터/프로젝트 상세/강의자료/요약) mock
import type {
  Chapter,
  ProjectDetail,
  LectureMaterial,
  LectureScript,
  LectureSummary,
} from '@/shared/types/api';

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

// 다음 주차 번호 — 지금 목록의 가장 큰 번호 +1.
export function nextMockChapterNumber(): number {
  return mockChapters.reduce((max, c) => Math.max(max, c.chapterNumber), 0) + 1;
}

// mock 전용: 업로드한 주차를 목록에 바로 밀어 넣는다.
// 백엔드가 붙기 전까지 "업로드 → 목록에 새 Chapter가 보인다"는 흐름을 확인하기 위한 것으로,
// 새로고침하면 사라진다(모듈 메모리라 세션 단위).
export function addMockChapter(chapter: Chapter): void {
  mockChapters.push(chapter);
}

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

// 학습 뷰어(원문 스크립트 탭) mock — 녹음 STT를 PDF 페이지 단위로 끊어 묶은 형태.
// 페이지 수(12)와 마지막 구간 끝(3662초 = 61:02)은 mockLectureMaterial과 맞춘다.
// 내용은 같은 챕터의 mockLectureSummary와 같은 강의(알고리즘 기초)를 말하도록 썼다.
// 시안(Figma)의 문구는 DP 강의 예시라 그대로 쓰면 요약 탭과 다른 수업이 돼 버린다.
export const mockLectureScript: LectureScript = {
  chapterId: 'c4',
  sections: [
    {
      page: 1,
      startSec: 0,
      endSec: 492,
      title: '알고리즘이란 & 좋은 알고리즘의 조건',
      segments: [
        {
          atSec: 0,
          text: '자, 오늘은 알고리즘 기초를 다뤄보겠습니다. 이번 학기 전체의 기준이 되는 내용이에요.',
        },
        {
          atSec: 132,
          text: '알고리즘은 문제를 푸는 명확한 절차입니다. 같은 문제라도 절차를 어떻게 짜느냐에 따라 걸리는 시간이 완전히 달라져요.',
        },
        {
          atSec: 305,
          text: '좋은 알고리즘의 조건 다섯 가지. 입력, 출력, 명확성, 유한성, 효율성. 특히 유한성은 반드시 끝나야 한다는 뜻입니다.',
        },
      ],
    },
    {
      page: 2,
      startSec: 493,
      endSec: 682,
      title: '프로그램 = 자료구조 + 알고리즘',
      segments: [
        {
          atSec: 493,
          text: '자료를 어떻게 담을지와 어떻게 다룰지는 항상 같이 결정됩니다. 둘을 따로 떼서 생각하면 안 돼요.',
        },
        {
          atSec: 601,
          text: '같은 알고리즘도 배열에 담느냐 연결 리스트에 담느냐에 따라 복잡도가 바뀝니다.',
        },
      ],
    },
    {
      page: 3,
      startSec: 683,
      endSec: 1092,
      title: '시간 복잡도와 점근 표기법 (★시험)',
      segments: [
        {
          atSec: 683,
          text: '입력 크기 n이 커질 때 연산 횟수가 어떻게 늘어나는지, 이게 시간 복잡도입니다.',
        },
        {
          atSec: 812,
          text: '상수항이랑 계수는 버립니다. 제일 빨리 커지는 항만 남겨요. 2n제곱 더하기 100n은 그냥 O(n제곱)입니다.',
        },
        {
          atSec: 967,
          text: '왜 버리냐. n이 충분히 커지면 지배항이 나머지를 다 덮어버리기 때문이에요. 이건 시험에 꼭 냅니다.',
        },
      ],
    },
    {
      page: 4,
      startSec: 1093,
      endSec: 1202,
      title: '빅오 표기 읽는 법',
      segments: [
        {
          atSec: 1093,
          text: '빅오는 최악의 경우 상한입니다. "아무리 나빠도 이 정도"라는 약속이에요.',
        },
      ],
    },
    {
      page: 5,
      startSec: 1203,
      endSec: 1457,
      title: 'O(1) · O(log n) · O(n) 비교',
      segments: [
        {
          atSec: 1203,
          text: '배열 인덱스 접근은 O(1). 입력이 아무리 커져도 한 번에 갑니다.',
        },
        {
          atSec: 1340,
          text: '이진 탐색은 매번 절반을 버리니까 O(log n). 순차 탐색은 처음부터 훑으니 O(n)이고요.',
        },
      ],
    },
    {
      page: 6,
      startSec: 1458,
      endSec: 1592,
      title: 'O(n log n) · O(n²)',
      segments: [
        {
          atSec: 1458,
          text: '병합 정렬과 퀵 정렬 평균이 O(n log n)입니다. 정렬에서는 사실상 이게 기준선이에요.',
        },
        {
          atSec: 1521,
          text: '버블 정렬, 선택 정렬은 O(n제곱). 이중 반복문이 보이면 대부분 여기입니다.',
        },
      ],
    },
    {
      page: 7,
      startSec: 1593,
      endSec: 1798,
      title: '빅오메가와 빅세타',
      segments: [
        {
          atSec: 1593,
          text: '빅오메가는 최선의 경우 하한입니다. 빅오의 반대쪽이라고 보면 돼요.',
        },
        {
          atSec: 1702,
          text: '상한과 하한이 같으면 빅세타를 씁니다. 사실 실무에서 제일 정확한 표현이지만 관행상 빅오를 많이 써요.',
        },
      ],
    },
    {
      page: 8,
      startSec: 1799,
      endSec: 2140,
      title: '순차 탐색 vs 이진 탐색',
      segments: [
        {
          atSec: 1799,
          text: '원소가 백만 개일 때 순차 탐색은 최악에 백만 번 비교합니다.',
        },
        {
          atSec: 1955,
          text: '이진 탐색은 스무 번이면 끝나요. 로그 이백만이 대략 스무 정도 되니까요.',
        },
      ],
    },
    {
      page: 9,
      startSec: 2141,
      endSec: 2480,
      title: '이진 탐색을 코드로 따라가기',
      segments: [
        {
          atSec: 2141,
          text: '전제 조건이 있습니다. 정렬돼 있어야 해요. 정렬 안 된 배열에 이진 탐색 쓰면 틀린 답이 나옵니다.',
        },
        {
          atSec: 2298,
          text: 'low, high, mid 세 변수로 범위를 절반씩 줄여갑니다. mid를 (low+high)//2로 잡고 비교해서 한쪽을 버려요.',
        },
      ],
    },
    {
      page: 10,
      startSec: 2481,
      endSec: 2885,
      title: '공간 복잡도',
      segments: [
        {
          atSec: 2481,
          text: '시간만 자원이 아닙니다. 추가로 쓰는 메모리 양이 공간 복잡도예요.',
        },
        {
          atSec: 2664,
          text: '입력 말고 상수 개의 변수만 쓰면 O(1). 이걸 제자리, in-place 알고리즘이라고 부릅니다.',
        },
        {
          atSec: 2790,
          text: '재귀는 호출 스택을 쓰죠. 그래서 깊이만큼 공간을 더 씁니다. 이거 놓치는 사람 많아요.',
        },
      ],
    },
    {
      page: 11,
      startSec: 2886,
      endSec: 3270,
      title: '시간과 공간의 트레이드오프',
      segments: [
        {
          atSec: 2886,
          text: '시간을 줄이려면 대개 공간을 더 씁니다. 반대도 마찬가지고요.',
        },
        {
          atSec: 3070,
          text: '대표적인 게 메모이제이션입니다. 계산 결과를 저장해두고 다시 안 계산하는 거죠. 다음 시간에 자세히 볼게요.',
        },
      ],
    },
    {
      page: 12,
      startSec: 3271,
      endSec: 3662,
      title: '핵심 정리 & 다음 강의 예고',
      segments: [
        {
          atSec: 3271,
          text: '정리하면, 성능은 입력이 커질 때의 증가율로 판단합니다.',
        },
        {
          atSec: 3410,
          text: '정렬돼 있는지 같은 전제 조건이 쓸 수 있는 알고리즘을 결정한다는 것도 기억해 주세요.',
        },
        {
          atSec: 3540,
          text: '다음 시간에는 정렬 알고리즘을 종류별로 비교합니다. 오늘 배운 표기법을 계속 쓸 거예요.',
        },
      ],
    },
  ],
};
