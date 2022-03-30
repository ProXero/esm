import nodeResolve from '@rollup/plugin-node-resolve';
import rollupTypescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [{
    input: 'build/index.js',
    output: {
        file: 'bundle.js',
        format: 'cjs',
        sourceMap: true
    },
    plugins: [
        nodeResolve()
    ],
    external: [
        'ramda'
    ]
  }, {
      input: 'build/index.d.ts',
      output: {
          file: 'bundle.d.ts',
          format: 'es'
      },
      plugins: [
          dts()
      ]
  }];
  