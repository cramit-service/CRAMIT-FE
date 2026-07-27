// src/features/exam/lib/examName.ts
import type { Exam } from '@/shared/types/api';

// 시험 표시 이름 = "강의명 시험이름" (예: '운영체제론 중간고사').
// 백엔드는 강의명(lectureName)과 시험이름(title)을 따로 주고, 화면에서 합쳐 보여준다.
// 강의명이 없으면(null) 시험이름만 쓴다.
export function examName(exam: Pick<Exam, 'lectureName' | 'title'>): string {
  return exam.lectureName ? `${exam.lectureName} ${exam.title}` : exam.title;
}
