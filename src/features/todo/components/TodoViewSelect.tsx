'use client';
// src/features/todo/components/TodoViewSelect.tsx
// 보기 드롭다운. 목록·트리거의 생김새는 shared/ui/Select이 갖고, 여기 남는 것은
// TodoFilter를 드롭다운이 다루는 문자열 값으로 바꿔 주는 일뿐이다.
import { Select } from '@/shared/ui/Select';
import {
  shortDateLabel,
  useTodoFilter,
  type TodoFilter,
} from '@/features/todo/hooks/useTodoFilter';

const KIND_LABEL = {
  upcoming: '다음 할 일',
  past: '지난 할 일',
  done: '완료된 할 일',
} as const;

type ViewValue = keyof typeof KIND_LABEL | 'date';

export function TodoViewSelect() {
  const { filter, setFilter } = useTodoFilter();

  // 날짜 항목은 캘린더에서 날짜를 고른 뒤에만 생긴다.
  const options = [
    ...(Object.keys(KIND_LABEL) as (keyof typeof KIND_LABEL)[]).map((k) => ({
      value: k as ViewValue,
      label: KIND_LABEL[k],
    })),
    ...(filter.kind === 'date'
      ? [{ value: 'date' as ViewValue, label: shortDateLabel(filter.date) }]
      : []),
  ];

  const handleChange = (value: ViewValue) => {
    // 'date'는 이미 고른 날짜를 가리킬 때만 목록에 있으므로 지금 filter를 그대로 둔다.
    if (value === 'date') return;
    setFilter({ kind: value } as TodoFilter);
  };

  return (
    <Select
      value={filter.kind as ViewValue}
      onChange={handleChange}
      options={options}
      label="할 일 보기"
    />
  );
}
