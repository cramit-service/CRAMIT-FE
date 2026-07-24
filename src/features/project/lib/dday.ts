// src/features/project/lib/dday.ts
// 시험일까지 남은 일수(D-DAY)를 계산한다.
// "며칠 남았나"는 보는 사람의 오늘 기준이라 화면(클라이언트)에서 계산한다.

// 'YYYY-MM-DD' → 로컬 자정 기준 Date. (시각 없이 날짜만 비교하기 위해)
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// 시험일까지 남은 일수. 오늘이면 0, 내일이면 1, 어제면 -1.
// 양쪽 다 자정 기준으로 맞춰 빼야 시/분 차이로 하루가 어긋나지 않는다.
export function daysUntil(examDate: string): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const exam = parseLocalDate(examDate);
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round((exam.getTime() - today.getTime()) / MS_PER_DAY);
}

// 남은 일수 → 뱃지 라벨. 0이면 'D-DAY', 그 외엔 'D-3'.
export function ddayLabel(days: number): string {
  return days === 0 ? 'D-DAY' : `D-${days}`;
}
