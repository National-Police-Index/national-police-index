import { defineConfig, globalIgnores } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default defineConfig([
    // Build output, dependencies and other generated files must be ignored
    // explicitly: ESLint's flat config does NOT read .gitignore/.eslintignore.
    globalIgnores([
        "node_modules/**",
        ".next/**",
        "out/**",
        "dist/**",
        "build/**",
        ".firebase/**",
        "next-env.d.ts",
        // functions/ is a separate project with its own ESLint config
        "functions/**",
        // Legacy CommonJS / compiled-output duplicates of the .ts pipeline
        // scripts (the .ts versions in package.json are the ones actually
        // run via tsx). Safe to delete; ignored here so they don't lint.
        "scripts/**/*.{js,cjs}",
    ]),
    {
        extends: compat.extends("next/core-web-vitals", "next/typescript"),
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
        },
    },
]);
