import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/server.ts'],
    outDir: 'dist',
    format: ['esm'],
    target: 'node18',
    clean: true,
    shims: true,
    dts: false,
  },
  {
    entry: { index: 'src/app.ts' },
    outDir: 'api',
    format: ['esm'],
    target: 'node18',
    clean: true,
    shims: true,
    dts: false,
    outExtension() {
      return { js: '.mjs' };
    },
  }
]);
