import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  base: './',
  plugins: [vue({ template: { transformAssetUrls: false } })],
  css: { preprocessorOptions: { less: { math: 'always' } } },
});
