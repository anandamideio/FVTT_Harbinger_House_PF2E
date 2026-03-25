import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import markdownPlugin from './rollup-plugin-markdown.mjs';
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

function moduleJsonPlugin(version) {
  return {
    name: 'module-json',
    writeBundle() {
      const manifest = JSON.parse(fs.readFileSync('module.json', 'utf-8'));
      manifest.version = version;
      manifest.url = getRemoteUrl();
      manifest.manifest = '';
      manifest.download = '';
      fs.mkdirSync(BUILD_DIR, { recursive: true });
      fs.writeFileSync(`${BUILD_DIR}/module.json`, JSON.stringify(manifest, null, '\t'));
    }
  };
}

const devVersion = IS_LOCAL ? getNextDevVersion() : null;

if (IS_LOCAL) {
  console.log(`Building local dev version: ${devVersion}`);
}

export default {
  input: 'src/module.ts',
  output: IS_LOCAL
    ? [
        { file: 'dist/module.js', format: 'es', sourcemap: true },
        { file: `${BUILD_DIR}/dist/module.js`, format: 'es', sourcemap: true },
      ]
    : { file: 'dist/module.js', format: 'es', sourcemap: true },
  plugins: [
    markdownPlugin(),
    resolve(),
    typescript({
      tsconfig: './tsconfig.json',
      compilerOptions: {
        noEmit: false,
        declaration: false,
        outDir: '.',
      },
    }),
    copy({
      targets: [
        { src: 'src/assets/**/*', dest: 'dist/assets' },
        ...(IS_LOCAL ? [
          { src: 'src/assets/**/*', dest: `${BUILD_DIR}/dist/assets` },
          { src: 'lang', dest: BUILD_DIR },
          { src: 'styles', dest: BUILD_DIR },
        ] : []),
      ]
    }),
    ...(IS_LOCAL ? [moduleJsonPlugin(devVersion)] : []),
  ],
};
