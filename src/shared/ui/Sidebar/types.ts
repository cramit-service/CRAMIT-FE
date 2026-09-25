// src/shared/ui/Sidebar/types.ts
// 사이드바가 아는 전부. 강의도 프로필도 여기까지만 안다 — 무엇을 뜻하는 색인지,
// 그 강의가 공유받은 것인지는 넣는 쪽(features)이 이미 판단해서 나눠 준다.
export interface NavCourse {
  id: string;
  label: string;
  /** 점 색 클래스. 어떤 규칙으로 고른 색인지는 넣는 쪽이 안다. */
  colorClass: string;
}

export interface NavProfile {
  name: string;
  imageUrl: string | null;
}

export interface NavData {
  mine: NavCourse[];
  shared: NavCourse[];
  pending: boolean;
  error: boolean;
  profile: NavProfile | null;
}
