import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import markdownPlugin from './vite-plugin-markdown.mjs';
import { execSync } from 'child_process';
import fs from 'fs';

const IS_LOCAL = process.env.BUILD === 'local';
const BUILD_DIR = 'build/harbinger-house-pf2e';

function getNextDevVersion() {
  try {
    const raw = execSync('git tag --sort=-version:refname').toString().trim();
    const tags = raw.split('\n').filter(t => /^v?\d+\.\d+\.\d+$/.test(t.trim()));
    if (tags.length === 0) return '0.0.1-dev';
    const [major, minor, patch] = tags[0].trim().replace(/^v/, '').split('.').map(Number);
    return `${major}.${minor}.${patch + 1}-dev`;
  } catch {
    return '0.0.1-dev';
  }
}

function getRemoteUrl() {
  try {
    return execSync('git remote get-url origin')
      .toString().trim()
      .replace(/^git@github\.com:/, 'https://github.com/')
      .replace(/\.git$/, '');
  } catch {
    return '';
  }
}

function copyPlugin(version: string | null) {
  return {
    name: 'copy-assets',
    closeBundle() {
      // Always copy assets to dist/assets
      fs.cpSync('src/assets', 'dist/assets', { recursive: true });

      if (!version) return;

      // Local build: mirror everything into BUILD_DIR
      fs.mkdirSync(`${BUILD_DIR}/dist`, { recursive: true });
      fs.copyFileSync('dist/module.js', `${BUILD_DIR}/dist/module.js`);
      if (fs.existsSync('dist/module.js.map')) {
        fs.copyFileSync('dist/module.js.map', `${BUILD_DIR}/dist/module.js.map`);
      }
      fs.cpSync('src/assets', `${BUILD_DIR}/dist/assets`, { recursive: true });
      fs.cpSync('lang', `${BUILD_DIR}/lang`, { recursive: true });
      fs.cpSync('styles', `${BUILD_DIR}/styles`, { recursive: true });

      // Copy built compendium packs if they exist
      if (fs.existsSync('packs')) {
        fs.cpSync('packs', `${BUILD_DIR}/packs`, { recursive: true });
      }

      const manifest = JSON.parse(fs.readFileSync('module.json', 'utf-8'));
      manifest.version = version;
      manifest.url = getRemoteUrl();
      manifest.manifest = '';
      manifest.download = '';
      fs.writeFileSync(`${BUILD_DIR}/module.json`, JSON.stringify(manifest, null, '\t'));
    }
  };
}

const devVersion = IS_LOCAL ? getNextDevVersion() : null;

if (IS_LOCAL) {
  console.log(`Building local dev version: ${devVersion}`);
}

export default defineConfig({
  base: './',
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    target: 'es2022',
    modulePreload: false,
    rollupOptions: {
      input: 'src/module.ts',
      output: {
        dir: 'dist',
        entryFileNames: 'module.js',
        format: 'es',
      },
    },
  },
  plugins: [
    svelte({
      compilerOptions: {
        css: 'injected',
      },
    }),
    markdownPlugin(),
    copyPlugin(devVersion),
  ],
});
