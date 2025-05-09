import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import pkg from './package.json';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

const babelOptions = {
  babelHelpers: 'bundled',
  extensions,
  exclude: 'node_modules/**',
};

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
      exports: 'named',
    },
  ],
  plugins: [
    resolve({ extensions }),
    commonjs(),
    typescript({
      tsconfig: 'tsconfig.json',
    }),
    babel(babelOptions),
    // 프로덕션 빌드에서만 terser 실행
    process.env.NODE_ENV === 'production' && terser(),
  ],
  external: [
    // 'reflect-metadata' // 만약 peerDependency로 둔다면
    // ...다른 peer dependencies
  ],
};