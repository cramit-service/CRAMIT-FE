import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

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
    },
  },
]);

export default eslintConfig;
