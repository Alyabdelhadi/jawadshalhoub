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
    // The sections render PRE-OPTIMIZED, responsive media via plain
    // `<img srcSet>` pointing at the webp variants produced by
    // scripts/prep-media.mjs (640/1280/1920). We intentionally do NOT use
    // next/image here: there is no runtime image optimizer in this static,
    // self-hosted media pipeline, and next/image would add no value while
    // complicating the cinematic full-bleed layout. Disable the warning for
    // these files only.
    files: ["src/components/sections/**/*.tsx"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
