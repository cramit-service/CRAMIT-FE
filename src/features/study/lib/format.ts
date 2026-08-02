// src/features/study/lib/format.ts
// 챕터 상세 화면 전용 표시 포맷 유틸

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

// 값이 깨졌을 때 화면에 보여줄 대체 문자열.
// 백엔드 값이 null이거나 형식이 어긋나면 "NaN. NaN. NaN. (undefined)"가 그대로
// 렌더되므로, 표시 단계에서 안전한 값으로 정규화한다.
const FALLBACK = '-';

// 챕터 생성일 표시: "2026. 07. 14. (화) 16:03"
export function formatChapterDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return FALLBACK;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const w = WEEKDAYS[d.getDay()];
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}. ${mm}. ${dd}. (${w}) ${hh}:${min}`;
}

// 챕터 생성일 표시(시각 없이): "2026. 07. 14. (화)"
export function formatChapterDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return FALLBACK;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}. ${mm}. ${dd}. (${WEEKDAYS[d.getDay()]})`;
}

// 오디오 재생 시간 표시: 725 → "12:05", 3662 → "61:02", 0 → "00:00"
// 60분을 넘겨도 시(hour)로 나누지 않고 분으로 계속 센다 (Figma 표기 그대로).
// 분도 두 자리로 채운다 — 시안의 스크립트 구간이 "00:00 – 08:12"로 자리를 맞춘다.
// 자릿수가 들쭉날쭉하면 세로로 늘어선 타임스탬프의 시작선이 어긋난다.
export function formatPlayTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return FALLBACK;
  const safe = Math.max(0, Math.floor(seconds));
  const mm = String(Math.floor(safe / 60)).padStart(2, '0');
  const ss = String(safe % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

// 녹음 길이 정규화 — 백엔드가 값을 빼먹거나 숫자가 아니면 0으로 본다.
// 재생 위치 계산(useMockAudio)과 표시(원문 스크립트 헤더)가 각자 다르게 방어하면
// 같은 자료인데 화면마다 다른 값이 나온다. 두 경로가 이 함수를 함께 쓴다.
export function toPlayDuration(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : 0;
}

// D-DAY 계산 결과 (태그 텍스트 + 긴급도)
export interface Dday {
  label: string; // 예: "중간고사 D-3", "중간고사 D-DAY", "중간고사 종료"
  // 색 강도: 임박(빨강) / 주의(노랑) / 여유(하늘) / 지남(회색)
  tone: 'urgent' | 'warning' | 'normal' | 'past';
}

// examDate는 "YYYY-MM-DD"로 내려오는 값이다.
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// 오늘~시험일 사이 남은 일수로 D-DAY 태그 텍스트/색을 계산한다.
// examDate가 없거나 형식이 깨졌으면 null(태그 미표시).
export function getDday(
  examName: string | null,
  examDate: string | null,
): Dday | null {
  if (!examName || !examDate) return null;
  // 형식이 어긋나거나 존재하지 않는 날짜(2026-02-31 등)면 "D-NaN" 태그가 뜨므로 숨긴다.
  if (!ISO_DATE.test(examDate)) return null;

  // 자정 기준으로 날짜만 비교 (시분초 영향 제거)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${examDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;

  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / 86_400_000,
  );

  if (diffDays < 0) return { label: `${examName} 종료`, tone: 'past' };
  if (diffDays === 0) return { label: `${examName} D-DAY`, tone: 'urgent' };

  const label = `${examName} D-${diffDays}`;
  if (diffDays <= 3) return { label, tone: 'urgent' };
  if (diffDays <= 7) return { label, tone: 'warning' };
  return { label, tone: 'normal' };
}
