// scripts/check-cn.mjs
// cn()이 클래스를 제대로 합치는지 본다.
//
// 이 검사가 필요한 이유는 틀렸을 때 아무도 안 죽어서다. tailwind-merge는 클래스가
// 어느 그룹인지 이름으로 판단하는데, globals.css가 만든 토큰은 그 목록에 없다.
// 빠뜨리면 린트·타입·빌드가 전부 통과하고, 화면에서 클래스 하나가 조용히 사라진다.
//
// 토큰을 늘리면 여기에 한 줄 추가한다. cn.ts의 목록만 고치고 여기를 빼먹으면
// 다음 사람이 같은 자리에서 다시 물린다.
import { cn } from '../src/shared/lib/cn.ts';

// [설명, 넣는 것, 나와야 하는 것]
const cases = [
  // 타이포 토큰이 색으로 오해받아 text-<색>에 밀려 사라지던 자리
  [
    '타이포와 색은 함께 남는다',
    'text-body-sm text-gray-700',
    'text-body-sm text-gray-700',
  ],
  [
    '타이포끼리는 뒤가 이긴다',
    'text-body-sm text-heading-md',
    'text-heading-md',
  ],
  ['색끼리는 뒤가 이긴다', 'text-gray-700 text-sky-ink', 'text-sky-ink'],

  // 그림자 단계 토큰이 색으로 오해받아 크기 그룹과 안 싸우던 자리
  ['그림자를 끌 수 있다', 'shadow-far shadow-none', 'shadow-none'],
  ['그림자 단을 바꿀 수 있다', 'shadow-near shadow-far', 'shadow-far'],
  ['기본 단을 새 단으로 덮는다', 'shadow-md shadow-far', 'shadow-far'],
  ['새 단을 기본 단으로 덮는다', 'shadow-far shadow-lg', 'shadow-lg'],
  [
    '그림자 단과 색은 함께 남는다',
    'shadow-far shadow-gray-800',
    'shadow-far shadow-gray-800',
  ],

  // 나머지 네임스페이스는 twMerge 기본 동작으로 충분하다는 것도 함께 잠가 둔다
  ['배경색은 뒤가 이긴다', 'bg-canvas bg-surface', 'bg-surface'],
  [
    '테두리색은 뒤가 이긴다',
    'border-gray-100 border-red-ink',
    'border-red-ink',
  ],
  ['radius는 뒤가 이긴다', 'rounded-md rounded-full', 'rounded-full'],
  [
    '배경과 글자색은 함께 남는다',
    'bg-lime-action text-gray-800',
    'bg-lime-action text-gray-800',
  ],
];

let failed = 0;
for (const [name, input, want] of cases) {
  const got = cn(input);
  if (got === want) continue;
  failed++;
  console.error(
    `  ✗ ${name}\n      넣은 것: ${input}\n      나온 것: ${got}\n      기대한 것: ${want}`,
  );
}

if (failed > 0) {
  console.error(
    `\ncn() 검사 ${failed}개 실패 — cn.ts의 classGroups를 확인하세요`,
  );
  process.exit(1);
}
console.log(`cn() 검사 ${cases.length}개 통과`);
