// @ts-check
import svelteConfig from './svelte.config.js';
import globals from 'globals';
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';

export default defineConfig(
  eslint.configs.recommended,
  svelte.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        // for Sveltekit in non-SPA mode
        ...globals.node
      }
    }
  },
  {
    files: ['**/*.svelte', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        // explicitly importing allows for better compatibilty and functionality with rules and other tooling that depend on the config file.
        //
        // Note: `eslint --cache` will fail with non-serializable properties.
        // In those cases, please remove the non-serializable properties.
        // svelteConfig: {
        //   ...svelteConfig,
        //   kit: {
        //     ...svelteConfig.kit,
        //     typescript: undefined
        //   }
        // }
        svelteConfig
      }
    }
  },
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
);
