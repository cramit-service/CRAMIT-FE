'use client';
// src/features/todo/hooks/useTodoFilter.tsx
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

// 캘린더와 TODO 체크리스트는 홈 격자에서 형제라 서로를 모른다. 그래서 공통 조상(page)에
// 상태를 두고 Context로 내려준다.
//
// calendar가 아니라 todo에 둔 이유: 이건 "어떤 TODO를 보여줄지"의 상태이고 캘린더는
// 그걸 바꾸는 입력 장치일 뿐이다. 이미 calendar → todo 방향 의존이 있어 방향도 안 늘어난다.

export type TodoFilter =
  | { kind: 'upcoming' } // 오늘 이후 (기본)
  | { kind: 'past' } // 오늘 이전 · 아직 완료 안 한 것
  | { kind: 'done' } // 완료한 것 (날짜 무관)
  | { kind: 'date'; date: string }; // 'YYYY-MM-DD' 하루만

interface TodoFilterContextValue {
  filter: TodoFilter;
  setFilter: (filter: TodoFilter) => void;
  /** 캘린더 칸을 누를 때 쓴다. 이미 고른 날짜를 다시 누르면 해제하고 기본으로 돌아간다. */
  toggleDate: (date: string) => void;
}

const TodoFilterContext = createContext<TodoFilterContextValue | null>(null);

export function TodoFilterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [filter, setFilter] = useState<TodoFilter>({ kind: 'upcoming' });

  const toggleDate = useCallback((date: string) => {
    setFilter((prev) =>
      prev.kind === 'date' && prev.date === date
        ? { kind: 'upcoming' }
        : { kind: 'date', date },
    );
  }, []);

  const value = useMemo(
    () => ({ filter, setFilter, toggleDate }),
    [filter, toggleDate],
  );

  return (
    <TodoFilterContext.Provider value={value}>
      {children}
    </TodoFilterContext.Provider>
  );
}

export function useTodoFilter() {
  const context = useContext(TodoFilterContext);
  if (!context) {
    throw new Error(
      'useTodoFilter는 TodoFilterProvider 안에서만 쓸 수 있어요.',
    );
  }
  return context;
}

// 'YYYY-MM-DD' → '08.12'. 드롭다운처럼 좁은 자리에 쓰는 짧은 표기.
export function shortDateLabel(dateStr: string): string {
  const [, month, day] = dateStr.split('-');
  return `${month}.${day}`;
}
