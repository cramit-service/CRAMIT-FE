// src/shared/lib/date.ts
// 날짜 유틸. 화면 표시·mock 생성·D-DAY 계산이 모두 같은 "로컬 오늘"을 쓰도록 한 곳에 모은다.

// Date → 'YYYY-MM-DD' (로컬 기준).
// toISOString()은 UTC라 자정 근처에서 하루 어긋날 수 있어 직접 조립한다.
export function toLocalDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 오늘로부터 offset일 뒤의 날짜를 'YYYY-MM-DD'로 반환한다. (offset 음수면 과거)
// setDate는 월/연 경계를 알아서 넘겨준다. (예: 7/30 + 3일 = 8/2)
export function dateFromToday(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return toLocalDateString(d);
}

// 'YYYY-MM-DD' → "2026. 07. 14. (화요일)" 형태의 한국어 표시 문자열.
export function formatKoreanDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}. ${mm}. ${dd}. (${weekday}요일)`;
}
