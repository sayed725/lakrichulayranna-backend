import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  outDir: 'dist',
  format: ['cjs'],
  target: 'node18',
  clean: true,
  sourcemap: false,
  minify: false,
  splitting: false,
  shims: false,
  dts: false,
});
