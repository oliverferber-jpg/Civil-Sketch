import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import { defineConfig, globalIgnores } from 'eslint/config'

type ReactRefreshModule =
  | { configs?: { vite?: unknown } }
  | { default?: { configs?: { vite?: unknown } } }

const reactRefreshConfig =
  (reactRefresh as unknown as ReactRefreshModule).configs?.vite ??
  (reactRefresh as unknown as ReactRefreshModule).default?.configs?.vite

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: [
      js.configs.recommended,
      tsPlugin.configs['flat/recommended'],
      reactHooks.configs.flat.recommended,
      reactRefreshConfig,
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: globals.browser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
  },
])
