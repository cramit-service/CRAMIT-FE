// src/features/exam/lib/examName.ts
import type { Exam } from '@/shared/types/api';

// 표시 이름 = "강의명 시험이름" (예: '운영체제론 중간고사').
// 백엔드가 강의명과 시험이름을 따로 주므로 화면에서 합친다.
export function examName(exam: Pick<Exam, 'lectureName' | 'title'>): string {
  return exam.lectureName ? `${exam.lectureName} ${exam.title}` : exam.title;
}
