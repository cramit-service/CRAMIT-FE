// src/mocks/project.ts — 프로젝트 목록 mock
import type { Project, ProjectSummary } from '@/shared/types/api';

export const mockProjects: Project[] = [
  { projectId: '1', title: '운영체제', createdAt: '2026-03-02T09:00:00Z' },
  { projectId: '2', title: '자료구조', createdAt: '2026-03-05T09:00:00Z' },
  {
    projectId: '3',
    title: '컴퓨터네트워크',
    createdAt: '2026-03-10T09:00:00Z',
  },
];

// 시험일을 오늘 기준 상대값으로 만든다.
// 날짜를 하드코딩하면 며칠만 지나도 전부 "종료" 태그로 굳어버려서
// D-DAY 색 분기(임박/주의/여유)를 화면에서 확인할 수 없다.
function daysFromNow(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// 학습하기(강의 목록) mock.
// sharedBy가 null이면 내 강의, 값이 있으면 공유받은 강의로 갈린다.
// D-DAY tone 4종(임박·주의·여유·없음)과 검색(제목/교수명)을 모두 확인할 수 있게 구성했다.
export const mockProjectSummaries: ProjectSummary[] = [
  {
    projectId: '1',
    title: '알고리즘',
    createdAt: '2026-03-02T09:00:00',
    professor: '박지훈',
    chapterCount: 6,
    examName: '중간고사',
    examDate: daysFromNow(0), // D-DAY (임박)
    sharedBy: null,
  },
  {
    projectId: '2',
    title: '운영체제',
    createdAt: '2026-03-05T09:00:00',
    professor: '이서연',
    chapterCount: 6,
    examName: null,
    examDate: null,
    sharedBy: null,
  },
  {
    projectId: '3',
    title: '자료구조',
    createdAt: '2026-03-08T09:00:00',
    professor: '박지훈',
    chapterCount: 3,
    examName: '중간고사',
    examDate: daysFromNow(3), // D-3 (임박)
    sharedBy: null,
  },
  {
    projectId: '4',
    title: '컴퓨터네트워크',
    createdAt: '2026-03-11T09:00:00',
    professor: '최민호',
    chapterCount: 6,
    examName: '기말고사',
    examDate: daysFromNow(13), // D-13 (여유)
    sharedBy: null,
  },
  {
    projectId: '5',
    title: '데이터베이스',
    createdAt: '2026-03-14T09:00:00',
    professor: '이서연',
    chapterCount: 6,
    examName: '중간고사',
    examDate: daysFromNow(5), // D-5 (주의)
    sharedBy: null,
  },
  {
    projectId: '6',
    title: '선형대수학',
    createdAt: '2026-03-17T09:00:00',
    professor: '한지우',
    chapterCount: 6,
    examName: null,
    examDate: null,
    sharedBy: null,
  },
  {
    projectId: '7',
    title: '알고리즘설계와분석',
    createdAt: '2026-03-20T09:00:00',
    professor: '박지훈',
    chapterCount: 3,
    examName: null,
    examDate: null,
    sharedBy: '김한양',
  },
  {
    projectId: '8',
    title: '이산수학',
    createdAt: '2026-03-23T09:00:00',
    professor: '정도윤',
    chapterCount: 6,
    examName: null,
    examDate: null,
    sharedBy: '김한양',
  },
  {
    projectId: '9',
    title: '컴퓨터구조',
    createdAt: '2026-03-26T09:00:00',
    professor: '최민호',
    chapterCount: 3,
    examName: '중간고사',
    examDate: daysFromNow(4), // D-4 (주의)
    sharedBy: '김한양',
  },
  {
    projectId: '10',
    title: '소프트웨어공학',
    createdAt: '2026-03-29T09:00:00',
    professor: '한지우',
    chapterCount: 6,
    examName: null,
    examDate: null,
    sharedBy: '오지훈',
  },
  {
    projectId: '11',
    title: '인공지능개론',
    createdAt: '2026-04-01T09:00:00',
    professor: '이서연',
    chapterCount: 6,
    examName: null,
    examDate: null,
    sharedBy: '오지훈',
  },
];
