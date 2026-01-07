import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import markdownPlugin from './rollup-plugin-markdown.mjs';

export default {
  input: 'src/module.ts',
  output: {
    file: 'dist/module.js',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    markdownPlugin(), // Inject markdown content at build time
    resolve(),
    typescript({
      tsconfig: './tsconfig.json',
      compilerOptions: {
        noEmit: false,
        declaration: false,
      },
    }),
    copy({
      targets: [
        { src: 'src/assets/**/*', dest: 'dist/assets' }
      ]
    })
  ],
};
