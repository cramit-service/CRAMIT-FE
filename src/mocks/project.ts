// src/mocks/project.ts — 강의 목록 mock
import type { MyLectureResponse } from '@/shared/types/api';

// 서버 응답 모양(MyLectureResponse) 그대로 둔다 — mock 경로도 features/study/api.ts의 변환을 탄다.
// 시험(D-DAY)은 강의가 아니라 mocks/exam이 갖고, id로 이어 붙인다.
export const mockLectures: MyLectureResponse[] = [
  {
    lectureId: 1,
    title: '알고리즘',
    professorName: '박지훈',
    weekCount: 6,
    colorIndex: 1,
  },
  {
    lectureId: 2,
    title: '운영체제',
    professorName: '이서연',
    weekCount: 6,
    colorIndex: 2,
  },
  {
    lectureId: 3,
    title: '자료구조',
    professorName: '박지훈',
    weekCount: 3,
    colorIndex: 3,
  },
  {
    lectureId: 4,
    title: '컴퓨터네트워크',
    professorName: '최민호',
    weekCount: 6,
    colorIndex: 4,
  },
  {
    lectureId: 5,
    title: '데이터베이스',
    professorName: '이서연',
    weekCount: 6,
    colorIndex: 5,
  },
  {
    lectureId: 6,
    title: '선형대수학',
    professorName: '한지우',
    weekCount: 6,
    colorIndex: 6,
  },
  {
    lectureId: 7,
    title: '알고리즘설계와분석',
    professorName: '박지훈',
    weekCount: 3,
    colorIndex: 7,
  },
  {
    lectureId: 8,
    title: '이산수학',
    professorName: '정도윤',
    weekCount: 6,
    colorIndex: 8,
  },
  {
    lectureId: 9,
    title: '컴퓨터구조',
    professorName: '최민호',
    weekCount: 3,
    colorIndex: 1,
  },
  {
    lectureId: 10,
    title: '소프트웨어공학',
    professorName: '한지우',
    weekCount: 6,
    colorIndex: 2,
  },
  {
    lectureId: 11,
    title: '인공지능개론',
    professorName: null,
    weekCount: 6,
    colorIndex: 3,
  },
];

// mock 전용: 생성·수정·삭제를 목록에 반영한다. 새로고침하면 사라진다.
export function addMockLecture(lecture: MyLectureResponse): void {
  mockLectures.push(lecture);
}

export function findMockLecture(
  lectureId: number,
): MyLectureResponse | undefined {
  return mockLectures.find((l) => l.lectureId === lectureId);
}

export function updateMockLecture(lecture: MyLectureResponse): void {
  const index = mockLectures.findIndex(
    (l) => l.lectureId === lecture.lectureId,
  );
  if (index === -1) throw new Error('수정할 강의를 찾지 못했어요.');
  mockLectures[index] = lecture;
}

export function removeMockLecture(lectureId: number): void {
  const index = mockLectures.findIndex((l) => l.lectureId === lectureId);
  if (index !== -1) mockLectures.splice(index, 1);
}
