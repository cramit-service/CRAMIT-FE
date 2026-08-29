// src/shared/lib/date.ts
// 날짜 유틸. 화면 표시·mock 생성·D-DAY 계산이 모두 같은 "로컬 오늘"을 쓰도록 한 곳에 모은다.

// toISOString()은 UTC라 자정 근처에서 하루 어긋난다. 그래서 직접 조립한다.
export function toLocalDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 'HH:mm'. 마감 시간처럼 분 단위까지만 다루는 값과 자릿수를 맞춘다.
// 같은 자릿수라서 문자열 비교가 곧 시각 비교가 된다.
export function toLocalTimeString(d: Date): string {
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// offset이 음수면 과거. 월/연 경계는 setDate가 알아서 넘겨준다.
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
