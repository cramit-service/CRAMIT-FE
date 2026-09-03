'use client';
// src/features/study/components/LectureSearchBar.tsx
import { Icon } from '@/shared/ui/Icon';

// 학습하기 상단의 어두운 검색바.
// shared/ui/Input은 흰 배경 + 테두리 + 라벨/에러 슬롯을 전제로 해서 이 시안(다크 바, 우측 아이콘)에
// 맞추려면 거의 모든 클래스를 덮어써야 한다. cn()엔 merge가 없어 덮어쓰기가 위험하므로 따로 만든다.
interface LectureSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function LectureSearchBar({ value, onChange }: LectureSearchBarProps) {
  return (
    <div className="flex h-12 items-center gap-1.5 rounded-md bg-gray-800 px-3.5">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="강의 명 또는 키워드를 검색해 주세요."
        aria-label="강의 검색"
        className="text-label min-w-0 flex-1 bg-transparent font-medium text-gray-100 placeholder:text-gray-400 focus:outline-none"
      />
      <Icon name="search" size={16} className="text-gray-400" />
    </div>
  );
}
