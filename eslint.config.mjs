import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// shared/ui의 공통 부품. 화면은 이것들을 조립만 하고, 생김새는 부품이 정한다.
const UI = [
  "Button",
  "Card",
  "Checkbox",
  "FormModal",
  "GradientBackground",
  "Icon",
  "Input",
  "Logo",
  "Modal",
  "ModalCombobox",
  "ModalDateField",
  "ModalTimeField",
  "Sidebar",
  "Switch",
  "Tooltip",
];

// 색·타이포의 임의값만 막는다. 폭·높이·간격의 임의값(border-[0.5px], w-[min(960px,50vw)])은
// CLAUDE.md 4-4가 뷰포트 비례 컨테이너에 쓰라고 정해 둔 것이라 건드리지 않는다.
const ARBITRARY = String.raw`(?:text|leading|tracking|font|fill|stroke|decoration)-\[|(?:bg|border|ring|shadow|from|via|to)-\[#`;

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // import 경로 규칙 (CLAUDE.md 3절, 이슈 #47).
    // 폴더를 넘어가면 '@/' alias를 쓴다. 같은 폴더('./')는 그대로 둔다.
    // 문서로만 두면 리뷰 때마다 같은 지적이 반복돼서 린트로 못 박는다.
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*"],
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
      "no-restricted-syntax": [
        "error",
        {
          selector: `Literal[value=/${ARBITRARY}/]`,
          message:
            "색·타이포는 임의값을 쓰지 않습니다. DESIGN.md 2·3절의 토큰을 쓰고, 필요한 값이 없으면 멈추고 협의하세요.",
        },
        {
          selector: `TemplateElement[value.raw=/${ARBITRARY}/]`,
          message:
            "색·타이포는 임의값을 쓰지 않습니다. DESIGN.md 2·3절의 토큰을 쓰고, 필요한 값이 없으면 멈추고 협의하세요.",
        },
      ],
    },
  },
  {
    // 화면(features·app)은 부품을 조립만 한다.
    // 누를 수 있거나 값을 받는 것은 shared/ui에서 가져오고, 배치만 직접 그린다.
    // 이 규칙이 없으니 버튼이 66곳에서 날것으로 그려졌다 — 문서로는 안 막혔다.
    files: ["src/features/**/*.tsx", "src/app/**/*.tsx"],
    rules: {
      "react/forbid-elements": [
        "error",
        {
          forbid: [
            { element: "button", message: "@/shared/ui/Button을 쓰세요." },
            { element: "input", message: "@/shared/ui/Input을 쓰세요." },
            {
              element: "select",
              message: "@/shared/ui/ModalCombobox 등 공통 부품을 쓰세요.",
            },
            {
              element: "textarea",
              message:
                "공통 부품이 없으면 shared/ui에 먼저 PR을 올리세요 (CONTRIBUTING.md).",
            },
          ],
        },
      ],

      // 공통 부품의 생김새는 부품이 정한다. 호출처가 className으로 덮어쓰면
      // 규칙이 부품 밖으로 새고, 실제로 그렇게 쓰인 곳은 대부분 부품 자신의 버그였다
      // (버튼의 shrink-0, 체크박스의 font-medium 등).
      // 배치가 필요하면 props를 새로 만들고 shared/ui PR로 올린다.
      "react/forbid-component-props": [
        "error",
        {
          forbid: [
            {
              propName: "className",
              disallowedFor: UI,
              message:
                "공통 부품의 생김새는 부품이 정합니다. 필요한 것이 있으면 props를 추가해 shared/ui에 단독 PR을 올리세요 (CONTRIBUTING.md).",
            },
            {
              propName: "style",
              disallowedFor: UI,
              message:
                "공통 부품의 생김새는 부품이 정합니다. 필요한 것이 있으면 props를 추가해 shared/ui에 단독 PR을 올리세요 (CONTRIBUTING.md).",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
