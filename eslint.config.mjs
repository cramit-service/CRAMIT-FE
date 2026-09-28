import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// shared/ui의 공통 부품. 화면은 이것들을 조립만 하고, 생김새는 부품이 정한다.
const UI = [
  'Button',
  'Card',
  'Checkbox',
  'FormModal',
  'GradientBackground',
  'Icon',
  'Input',
  'Logo',
  'Modal',
  'ModalCombobox',
  'ModalDateField',
  'ModalTimeField',
  'Sidebar',
  'Switch',
  'Tooltip',
];

// 색·타이포·모서리의 임의값을 막는다. 폭·높이·간격의 임의값(border-[0.5px],
// w-[min(960px,50vw)])은 DESIGN.md §5가 뷰포트 비례 컨테이너에 쓰라고 정해 둔 것이라
// 건드리지 않는다.
// 모서리는 §2가 6과 full 둘만 남겼다. 토큰을 지운 것과 한 쌍이다 — 이름으로는 못 쓰게
// 됐지만 rounded-[10px]로 되돌리는 길이 열려 있으면 지운 의미가 없다.
const ARBITRARY = String.raw`(?:text|leading|tracking|font|fill|stroke|decoration)-\[|(?:bg|border|ring|shadow|from|via|to)-\[#|\brounded(?:-[a-z]{1,2})?-\[`;

// 브랜드 색을 허락한 파일에서도 타이포·모서리 임의값은 막는다 (색만 뺀 ARBITRARY).
const TYPO_ONLY = String.raw`(?:text|leading|tracking|font|fill|stroke|decoration)-\[|\brounded(?:-[a-z]{1,2})?-\[`;

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  {
    // import 경로 규칙 (CLAUDE.md 3절, 이슈 #47).
    // 폴더를 넘어가면 '@/' alias를 쓴다. 같은 폴더('./')는 그대로 둔다.
    // 문서로만 두면 리뷰 때마다 같은 지적이 반복돼서 린트로 못 박는다.
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message:
                "상위 폴더는 '@/' alias로 부릅니다 (예: '../lib/format' → '@/features/study/lib/format'). 같은 폴더는 './'를 그대로 쓰세요.",
            },
          ],
        },
      ],

      // 색·타이포 토큰 밖의 값을 못 쓰게 한다 (DESIGN.md 2·3절).
      // 기본 팔레트를 지우는 것(--color-*: initial)과 한 쌍이다 — 그쪽은 토큰 밖의 색을
      // 없애고, 이쪽은 임의값으로 우회하는 길을 막는다.
      // 클래스 문자열이 JSX 밖의 const로도 많이 선언돼 있어(FormModal의 OPTION_ROW 등)
      // className 속성이 아니라 문자열 자체를 본다.
      'no-restricted-syntax': [
        'error',
        {
          selector: `Literal[value=/${ARBITRARY}/]`,
          message:
            '색·타이포·모서리는 임의값을 쓰지 않습니다. DESIGN.md 2·3절의 토큰을 쓰고, 필요한 값이 없으면 멈추고 협의하세요.',
        },
        {
          selector: `TemplateElement[value.raw=/${ARBITRARY}/]`,
          message:
            '색·타이포·모서리는 임의값을 쓰지 않습니다. DESIGN.md 2·3절의 토큰을 쓰고, 필요한 값이 없으면 멈추고 협의하세요.',
        },
      ],
    },
  },
  {
    // shared/ui의 부품은 도메인을 모른다 (CLAUDE.md 3절).
    // 화살표는 app → features → shared 한 방향이다. shared가 features를 부르면
    // 순환이 생기고, 그 부품은 그 기능 없이는 못 쓴다 — shared에 둘 이유가 없어진다.
    // 도메인 타입도 같은 이유로 막는다. 필요하면 도메인 없는 모양으로 props를 받고,
    // 그 모양으로 옮기는 일은 features가 한다.
    files: ['src/shared/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*', '@/features/**'],
              message:
                'shared/ui는 features를 부르지 않습니다. 필요한 값은 props로 받고, 가져오는 일은 features가 하세요 (CLAUDE.md 3절).',
            },
            {
              group: ['@/shared/types/api'],
              message:
                'shared/ui는 도메인 타입을 모릅니다. 도메인 없는 모양으로 props를 정의하고, 옮기는 일은 features가 하세요 (CLAUDE.md 3절).',
            },
          ],
        },
      ],
    },
  },
  {
    // 아이콘은 shared/ui/Icon.tsx 한 곳에만 있다. 이 규칙이 없어서 같은 꺾쇠가
    // 다섯 군데에 따로 그려졌고, 56종 중 절반이 아무 데서도 안 쓰였다.
    // Logo는 아이콘이 아니라 워드마크라 자기 벡터를 갖는다.
    files: ['src/shared/**/*.tsx'],
    ignores: ['src/shared/ui/Icon.tsx', 'src/shared/ui/Logo.tsx'],
    rules: {
      'react/forbid-elements': [
        'error',
        {
          forbid: [
            {
              element: 'svg',
              message:
                '아이콘은 <Icon name="…" />로 부릅니다. 없으면 시안 "Icon" 프레임(1:13899)을 먼저 보고 shared/ui/Icon.tsx에 추가하세요 (DESIGN.md 4절).',
            },
          ],
        },
      ],
    },
  },
  {
    // 화면(features·app)은 부품을 조립만 한다.
    // 누를 수 있거나 값을 받는 것은 shared/ui에서 가져오고, 배치만 직접 그린다.
    // 이 규칙이 없으니 버튼이 66곳에서 날것으로 그려졌다 — 문서로는 안 막혔다.
    files: ['src/features/**/*.tsx', 'src/app/**/*.tsx'],
    rules: {
      'react/forbid-elements': [
        'error',
        {
          forbid: [
            { element: 'button', message: '@/shared/ui/Button을 쓰세요.' },
            { element: 'input', message: '@/shared/ui/Input을 쓰세요.' },
            {
              element: 'select',
              message: '@/shared/ui/ModalCombobox 등 공통 부품을 쓰세요.',
            },
            {
              element: 'textarea',
              message:
                '공통 부품이 없으면 shared/ui에 먼저 PR을 올리세요 (CONTRIBUTING.md).',
            },
            {
              element: 'svg',
              message:
                '아이콘은 <Icon name="…" />로 부릅니다. 없으면 시안 "Icon" 프레임(1:13899)을 먼저 보고 shared/ui/Icon.tsx에 추가하세요 (DESIGN.md 4절).',
            },
          ],
        },
      ],

      // 공통 부품의 생김새는 부품이 정한다. 호출처가 className으로 덮어쓰면
      // 규칙이 부품 밖으로 새고, 실제로 그렇게 쓰인 곳은 대부분 부품 자신의 버그였다
      // (버튼의 shrink-0, 체크박스의 font-medium 등).
      // 배치가 필요하면 props를 새로 만들고 shared/ui PR로 올린다.
      'react/forbid-component-props': [
        'error',
        {
          forbid: [
            {
              propName: 'className',
              disallowedFor: UI,
              message:
                '공통 부품의 생김새는 부품이 정합니다. 필요한 것이 있으면 props를 추가해 shared/ui에 단독 PR을 올리세요 (CONTRIBUTING.md).',
            },
            {
              propName: 'style',
              disallowedFor: UI,
              message:
                '공통 부품의 생김새는 부품이 정합니다. 필요한 것이 있으면 props를 추가해 shared/ui에 단독 PR을 올리세요 (CONTRIBUTING.md).',
            },
          ],
        },
      ],
    },
  },
  {
    // 캘린더의 하루 칸에서만 날것 button을 허락한다. 알약(Toggle)도 카드(Card)도 그
    // 모양이 아니다 — 96×110 격자 칸에 날짜와 일정 줄이 들어가고, 칸을 가르는 선은
    // 격자가 이미 긋는다. 누른 상태의 계약(aria-pressed·이름)은 그 파일이 직접 지킨다
    // (DESIGN.md 4절). 나머지 넷은 그대로 막고, 임의 색·타이포 규칙도 그대로 걸린다.
    files: ['src/features/calendar/components/CalendarCell.tsx'],
    rules: {
      'react/forbid-elements': [
        'error',
        {
          forbid: [
            { element: 'input', message: '@/shared/ui/Input을 쓰세요.' },
            {
              element: 'select',
              message: '@/shared/ui/ModalCombobox 등 공통 부품을 쓰세요.',
            },
            {
              element: 'textarea',
              message:
                '공통 부품이 없으면 shared/ui에 먼저 PR을 올리세요 (CONTRIBUTING.md).',
            },
            {
              element: 'svg',
              message: '아이콘은 <Icon name="…" />로 부릅니다 (DESIGN.md 4절).',
            },
          ],
        },
      ],
    },
  },
  {
    // 소셜 로그인 버튼에서만 브랜드 규정색과 날것 button을 허락한다.
    // 카카오 #FFE812와 구글 흰 알약은 각 회사의 규정색이라 우리가 고를 수 있는 값이
    // 아니다 — §2에 넣으면 다음 사람이 "토큰에 있으니 다른 데서도 쓰자"로 읽는다.
    // Button의 순위는 primary·secondary·danger 셋뿐이고, 거기에 brand를 더하면
    // 남의 색이 shared/ui로 들어온다. 그래서 이 파일이 자기 버튼을 그린다.
    // 나머지 넷과 타이포 임의값은 그대로 막는다.
    files: ['src/features/auth/components/SocialButton.tsx'],
    rules: {
      'react/forbid-elements': [
        'error',
        {
          forbid: [
            { element: 'input', message: '@/shared/ui/Input을 쓰세요.' },
            {
              element: 'select',
              message: '@/shared/ui/ModalCombobox 등 공통 부품을 쓰세요.',
            },
            {
              element: 'textarea',
              message:
                '공통 부품이 없으면 shared/ui에 먼저 PR을 올리세요 (CONTRIBUTING.md).',
            },
            {
              element: 'svg',
              message: '아이콘은 <Icon name="…" />로 부릅니다 (DESIGN.md 4절).',
            },
          ],
        },
      ],
      // 브랜드 채움만 허락한다. 타이포·모서리 임의값은 그대로 막는다.
      'no-restricted-syntax': [
        'error',
        {
          selector: `Literal[value=/${TYPO_ONLY}/]`,
          message:
            '색·타이포·모서리는 임의값을 쓰지 않습니다. 브랜드 규정색만 예외입니다 (DESIGN.md 2·3절).',
        },
      ],
    },
  },
  {
    // 챗독의 세로 탭에서만 날것 button을 허락한다. Toggle(알약)이 상태를 드는 컨트롤이지만
    // 모양이 다르다 — 가로 알약에 컨트롤 높이를 쓰는 것과, 창 오른쪽 변에 붙어
    // 32×107로 서서 글자가 세로로 흐르는 것은 같은 부품이 될 수 없다.
    // 열림 상태의 계약(aria-expanded·이름)은 그 파일이 직접 지킨다.
    // 나머지 넷과 색·타이포 임의값은 그대로 막는다.
    files: ['src/features/chat/components/ChatDock.tsx'],
    rules: {
      'react/forbid-elements': [
        'error',
        {
          forbid: [
            { element: 'input', message: '@/shared/ui/Input을 쓰세요.' },
            {
              element: 'select',
              message: '@/shared/ui/ModalCombobox 등 공통 부품을 쓰세요.',
            },
            {
              element: 'textarea',
              message:
                '공통 부품이 없으면 shared/ui에 먼저 PR을 올리세요 (CONTRIBUTING.md).',
            },
            {
              element: 'svg',
              message: '아이콘은 <Icon name="…" />로 부릅니다 (DESIGN.md 4절).',
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
