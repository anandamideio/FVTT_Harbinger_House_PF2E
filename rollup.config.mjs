import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import markdownPlugin from './rollup-plugin-markdown.mjs';

const BUILD_DIR = 'build/harbinger-house-pf2e';

export default {
  input: 'src/module.ts',
  output: [
    {
      file: 'dist/module.js',
      format: 'es',
      sourcemap: true,
    },
    {
      file: `${BUILD_DIR}/dist/module.js`,
      format: 'es',
      sourcemap: true,
    },
  ],
  plugins: [
    markdownPlugin(), // Inject markdown content at build time
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
        { src: 'src/assets/**/*', dest: `${BUILD_DIR}/dist/assets` },
        { src: 'module.json', dest: BUILD_DIR },
        { src: 'lang', dest: BUILD_DIR },
        { src: 'styles', dest: BUILD_DIR },
      ]
    })
  ],
};
