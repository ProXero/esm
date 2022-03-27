import nodeResolve from '@rollup/plugin-node-resolve';
import rollupTypescript from '@rollup/plugin-typescript';
import pkg from './package.json';

export default {
    input: 'src/main.ts',
    output: {
        file: 'bundle.js',
        format: 'cjs',
        sourceMap: true
    },
    plugins: [
        nodeResolve(),
        rollupTypescript()
    ]
  };
  